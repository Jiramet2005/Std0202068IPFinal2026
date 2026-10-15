// Explicit integration check against initialized HR tables. It only deletes its own test employee.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { getConfig } = require('./config');
const { createMysqlStore } = require('./mysql-store');

async function verify() {
  const config = getConfig();
  if (config.storageMode !== 'mysql') throw new Error('Set STORAGE_MODE=mysql before verify:mysql.');
  const first = createMysqlStore(config.database);
  let second;
  let createdId;
  let firstClosed = false;
  try {
    await first.health();
    const name = `HR connection test ${randomUUID()}`;
    const employee = await first.addEmployee({ name, position: 'Temporary integration check', salary: 12345.67 });
    createdId = employee.id;
    await first.close();
    firstClosed = true;
    second = createMysqlStore(config.database);
    const persisted = (await second.listEmployees()).find(item => item.id === createdId);
    assert.ok(persisted, 'Employee must persist after closing and reopening the database connection.');
    assert.equal(persisted.name, name);
    assert.equal(persisted.salary, 12345.67);
    assert.equal((await second.toggleStatus(createdId)).status, 'On Leave');
    const editedValues = { name: `${name} edited`, position: 'Edited integration check', salary: 23456.78 };
    const edited = await second.updateEmployee(createdId, editedValues);
    assert.deepEqual(edited, { id: createdId, ...editedValues, status: 'On Leave' });
    assert.deepEqual(await second.updateEmployee(createdId, editedValues), edited, 'Saving unchanged values must succeed.');
    await second.close();
    second = createMysqlStore(config.database);
    assert.deepEqual((await second.listEmployees()).find(item => item.id === createdId), edited, 'Edited fields must persist after reconnecting.');
    assert.equal((await second.toggleStatus(createdId)).status, 'Active');
    assert.equal(await second.deleteEmployee(createdId), true);
    createdId = undefined;
    console.log('MySQL persistence, editing, decimal salary, status toggle and deletion verified.');
  } finally {
    const cleanup = second || (firstClosed ? createMysqlStore(config.database) : first);
    try { if (createdId) await cleanup.deleteEmployee(createdId); }
    finally {
      await cleanup.close();
      if (cleanup !== first && !firstClosed) await first.close();
    }
  }
}
verify().catch(error => { console.error('MySQL verification failed:', error.code || error.message); process.exitCode = 1; });
