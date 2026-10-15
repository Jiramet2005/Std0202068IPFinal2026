const { getConfig } = require('./config');
const { createMysqlStore } = require('./mysql-store');

async function initialize() {
  const config = getConfig();
  if (config.storageMode !== 'mysql') throw new Error('Set STORAGE_MODE=mysql in backend/.env before running init-db.');
  const store = createMysqlStore(config.database);
  try {
    await store.initialize();
    await store.health();
    console.log('HR tables are ready. Existing non-HR tables were not changed.');
  } finally { await store.close(); }
}
initialize().catch(error => { console.error('Database initialization failed:', error.code || error.message); process.exitCode = 1; });
