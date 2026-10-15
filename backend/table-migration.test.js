const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TABLE_RENAMES, buildRenamePlan, requireCurrentTableNames, migrateTables } = require('./migrate-table-names');

const oldNames = TABLE_RENAMES.map(pair => pair.from);
const newNames = TABLE_RENAMES.map(pair => pair.to);
function metadataDb(names) {
  const calls = [];
  return {
    calls,
    async execute() { return [names.map(table_name => ({ table_name, table_type: 'BASE TABLE' }))]; },
    async query(sql) { calls.push(sql); throw new Error('Unexpected mutation/query in read-only check'); },
  };
}

test('migration plans exactly the five owned HR tables and retains the seed ledger', () => {
  const plan = buildRenamePlan([...oldNames, 'users', 'products', 'orders']);
  assert.equal(plan.pending.length, 5);
  assert.deepEqual(plan.pending.find(pair => pair.from === 'hr_schema_migrations'), { from: 'hr_schema_migrations', to: 'Jiramet_schema_migrations' });
  assert.ok(plan.pending.every(pair => pair.to.startsWith('Jiramet_')));
  assert.equal(plan.missing.length, 0);
});
test('migration handles already-renamed and partially renamed tables', () => {
  assert.equal(buildRenamePlan(newNames).pending.length, 0);
  assert.equal(buildRenamePlan(newNames.map(name => name.toLowerCase())).complete.length, 5);
  const partial = buildRenamePlan([oldNames[0], ...newNames.slice(1)]);
  assert.equal(partial.pending.length, 1);
  assert.equal(partial.complete.length, 4);
});
test('migration refuses collisions instead of overwriting destination tables', async () => {
  const db = metadataDb([...oldNames, 'Jiramet_employees']);
  await assert.rejects(migrateTables(db, { apply: true, log: () => {} }), /Both hr_employees and Jiramet_employees exist/);
  assert.deepEqual(db.calls, []);
});
test('check mode and repeated completed migrations never mutate tables', async () => {
  const check = metadataDb(oldNames);
  await migrateTables(check, { log: () => {} });
  assert.deepEqual(check.calls, []);
  const complete = metadataDb(newNames);
  await migrateTables(complete, { apply: true, log: () => {} });
  assert.deepEqual(complete.calls, []);
});
test('initializer blocks old tables before creating empty replacement tables', async () => {
  await assert.rejects(requireCurrentTableNames(metadataDb(oldNames)), /migrate-table-names.js --apply/);
  await requireCurrentTableNames(metadataDb([]));
  await requireCurrentTableNames(metadataDb(newNames));
});
test('missing source tables stop apply before any rename', async () => {
  const db = metadataDb(oldNames.slice(1));
  await assert.rejects(migrateTables(db, { apply: true, log: () => {} }), /Missing HR tables/);
  assert.deepEqual(db.calls, []);
});

test('apply uses one rename statement and verifies all five original row counts', async () => {
  const tables = new Map(oldNames.map((name, i) => [name, { count: String(i + 1) }]));
  const original = new Map(tables);
  const renameStatements = [];
  const db = {
    async execute() { return [[...tables.keys()].map(table_name => ({ table_name, table_type: 'BASE TABLE' }))]; },
    async query(sql) {
      if (sql === 'SET SESSION lock_wait_timeout = 8') return [];
      if (sql.startsWith('SELECT COUNT(*)')) {
        const name = sql.match(/FROM `([^`]+)`/)[1];
        assert.ok(tables.has(name));
        return [[{ row_count: tables.get(name).count }]];
      }
      assert.ok(sql.startsWith('RENAME TABLE '), 'Migration must not create, delete or copy rows.');
      renameStatements.push(sql);
      const pairs = [...sql.matchAll(/`([^`]+)` TO `([^`]+)`/g)];
      assert.equal(pairs.length, 5);
      for (const [, from, to] of pairs) {
        assert.ok(tables.has(from)); assert.ok(!tables.has(to));
        tables.set(to, tables.get(from)); tables.delete(from);
      }
      return [];
    },
  };
  await migrateTables(db, { apply: true, log: () => {} });
  assert.equal(renameStatements.length, 1);
  for (const pair of TABLE_RENAMES) assert.equal(tables.get(pair.to), original.get(pair.from));
  await migrateTables(db, { apply: true, log: () => {} });
  assert.equal(renameStatements.length, 1, 'A repeated migration must not change the database.');
});
