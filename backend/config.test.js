const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getConfig } = require('./config');

test('storage config supports the PDF memory mode and the cloud MySQL mode', () => {
  assert.deepEqual(getConfig({}), { storageMode: 'memory', port: 5000 });
  const config = getConfig({ STORAGE_MODE: 'mysql', PORT: '3009', DB_HOST: 'localhost', DB_USER: 'test', DB_PASSWORD: 'test-only', DB_NAME: 'test' });
  assert.equal(config.database.database, 'test');
  assert.equal(config.port, 3009);
  assert.equal(config.database.port, 3306);
  assert.throws(() => getConfig({ STORAGE_MODE: 'other' }), /STORAGE_MODE/);
  assert.throws(() => getConfig({ STORAGE_MODE: 'mysql' }), /DB_HOST/);
  assert.throws(() => getConfig({ PORT: '-1' }), /PORT/);
});
