const { getConfig } = require('./config');
const { createMysqlStore } = require('./mysql-store');

async function initialize() {
  const config = getConfig();
  if (config.storageMode !== 'mysql') throw new Error('Set STORAGE_MODE=mysql in backend/.env before running init-db.');
  const store = createMysqlStore(config.database);
  try {
    const [context] = await store.pool.query('SELECT DATABASE() AS database_name, CURRENT_USER() AS db_account');
    console.log('Database target:', config.database.host + ':' + config.database.port);
    console.log('Selected database:', context[0].database_name);
    console.log('MySQL account:', context[0].db_account);
    await store.initialize();
    await store.health();
    console.log('Jiramet_ HR tables are ready. Existing data and unrelated tables were preserved.');
  } catch (error) {
    // Permission diagnostics only: never print a full SQL statement or connection config.
    const denied = ['ER_TABLEACCESS_DENIED_ERROR', 'ER_DBACCESS_DENIED_ERROR', 'ER_COLUMNACCESS_DENIED_ERROR', 'ER_ACCESS_DENIED_ERROR'];
    if (denied.includes(error.code)) {
      const detail = String(error.sqlMessage || error.message || error.code)
        .split(config.database.password).join('[REDACTED]');
      console.error('Permission detail:', detail);
      const table = String(error.sql || '').match(/\b(?:hr|Jiramet)_[a-z_]+\b/i)?.[0];
      if (table) console.error('HR table:', table);
      console.error('Check the selected database and the denied SQL operation. Do not change passwords or grant global privileges as a workaround.');
    }
    throw error;
  } finally { await store.close(); }
}
initialize().catch(error => { console.error('Database initialization failed:', error.code || error.message); process.exitCode = 1; });
