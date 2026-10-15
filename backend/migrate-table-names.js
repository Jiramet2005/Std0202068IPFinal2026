// Rename only this app's five tables. Run --check first, then --apply with the app stopped.
const TABLE_RENAMES = Object.freeze([
  ['hr_schema_migrations', 'Jiramet_schema_migrations'],
  ['hr_users', 'Jiramet_users'],
  ['hr_employees', 'Jiramet_employees'],
  ['hr_sessions', 'Jiramet_sessions'],
  ['hr_salary_analyses', 'Jiramet_salary_analyses'],
].map(([from, to]) => Object.freeze({ from, to })));

function buildRenamePlan(existingNames) {
  // MySQL with lower_case_table_names=1 stores names in lowercase.
  const names = new Set(existingNames.map(name => name.toLowerCase()));
  const pending = [], complete = [], missing = [];
  for (const pair of TABLE_RENAMES) {
    const oldExists = names.has(pair.from.toLowerCase());
    const newExists = names.has(pair.to.toLowerCase());
    if (oldExists && newExists) throw new Error(`Both ${pair.from} and ${pair.to} exist. Stopped without overwriting either table.`);
    if (oldExists) pending.push(pair);
    else if (newExists) complete.push(pair);
    else missing.push(pair);
  }
  return { pending, complete, missing };
}

async function inspectTables(db) {
  const names = TABLE_RENAMES.flatMap(pair => [pair.from, pair.to]);
  const [rows] = await db.execute(
    `SELECT TABLE_NAME AS table_name, TABLE_TYPE AS table_type FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (${names.map(() => '?').join(', ')})`, names);
  if (rows.some(row => row.table_type !== 'BASE TABLE')) throw new Error('An expected HR table name is a view. Stopped without changes.');
  return buildRenamePlan(rows.map(row => row.table_name));
}

async function requireCurrentTableNames(db) {
  const plan = await inspectTables(db);
  if (plan.pending.length) throw new Error('Existing hr_ tables found. Stop the app, then run node migrate-table-names.js --apply before init-db.');
}

async function migrateTables(db, { apply = false, log = console.log } = {}) {
  const plan = await inspectTables(db);
  for (const pair of plan.pending) log(`${pair.from} -> ${pair.to}`);
  if (!plan.pending.length) {
    log(plan.complete.length ? 'Table names already use Jiramet_. No changes made.' : 'No HR tables found. Use node init-db.js for a fresh installation.');
    return plan;
  }
  if (plan.missing.length) throw new Error(`Missing HR tables: ${plan.missing.map(pair => pair.from).join(', ')}. Restore the missing tables before migrating.`);
  if (!apply) { log('Check only. Run with --apply to rename the tables after stopping the app.'); return plan; }
  const before = new Map();
  for (const pair of plan.pending) {
    const [rows] = await db.query(`SELECT COUNT(*) AS row_count FROM \`${pair.from}\``);
    before.set(pair.to, String(rows[0].row_count));
  }
  await db.query('SET SESSION lock_wait_timeout = 8');
  // One RENAME statement: no DROP, CREATE, INSERT, DELETE, or row copying.
  await db.query('RENAME TABLE ' + plan.pending.map(pair => `\`${pair.from}\` TO \`${pair.to}\``).join(', '));
  for (const pair of plan.pending) {
    const [rows] = await db.query(`SELECT COUNT(*) AS row_count FROM \`${pair.to}\``);
    if (String(rows[0].row_count) !== before.get(pair.to)) throw new Error(`Row count changed for ${pair.to}. Keep the app stopped and inspect the table.`);
    log(`${pair.to}: ${rows[0].row_count} rows preserved`);
  }
  log('Table rename completed. Column names and existing data were preserved.');
  return plan;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && !['--check', '--apply'].includes(args[0]))) throw new Error('Usage: node migrate-table-names.js [--check|--apply]');
  const { getConfig } = require('./config');
  const config = getConfig();
  if (config.storageMode !== 'mysql') throw new Error('Set STORAGE_MODE=mysql before migrating.');
  const { waitForConnections, connectionLimit, ...database } = config.database;
  const db = await require('mysql2/promise').createConnection(database);
  try {
    const [rows] = await db.query('SELECT DATABASE() AS db');
    console.log('Selected database:', rows[0].db);
    await migrateTables(db, { apply: args[0] === '--apply' });
  } catch (error) {
    if (error.sqlMessage) console.error(String(error.sqlMessage).split(config.database.password).join('[REDACTED]'));
    throw error;
  } finally { await db.end(); }
}
if (require.main === module) main().catch(error => { console.error('Table migration failed:', error.code || error.message); process.exitCode = 1; });
module.exports = { TABLE_RENAMES, buildRenamePlan, inspectTables, requireCurrentTableNames, migrateTables };
