const { createApp } = require('./app');
const { getConfig } = require('./config');
const { createMemoryStore } = require('./memory-store');

async function start() {
  const config = getConfig();
  const store = config.storageMode === 'mysql'
    ? require('./mysql-store').createMysqlStore(config.database)
    : createMemoryStore();
  try { await store.health(); }
  catch (error) { await store.close(); throw error; }
  const path = require('node:path');
  const fs = require('node:fs');
  // Optional Expo web export in the same cloud process/port as the API.
  const webRoot = path.join(__dirname, 'public');
  const app = createApp({ store, webRoot: fs.existsSync(path.join(webRoot, 'index.html')) ? webRoot : undefined });
  const server = app.listen(config.port, '0.0.0.0', () => console.log(`HR API listening on port ${config.port} (${store.mode})`));
  server.on('error', async error => { console.error('Server failed:', error.code || error.message); await store.close(); process.exitCode = 1; });
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    const timer = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => { await store.close(); clearTimeout(timer); });
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
}
start().catch(error => { console.error('Startup failed:', error.code || error.message); process.exitCode = 1; });
