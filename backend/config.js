const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

function getConfig(env = process.env) {
  const storageMode = env.STORAGE_MODE || 'memory';
  if (!['memory', 'mysql'].includes(storageMode)) throw new Error('STORAGE_MODE must be memory or mysql.');
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  const config = { storageMode, port };
  if (storageMode === 'mysql') {
    for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
      if (!env[key]) throw new Error(`${key} is required in mysql mode.`);
    }
    const dbPort = Number(env.DB_PORT || 3306);
    if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) throw new Error('DB_PORT is invalid.');
    config.database = {
      host: env.DB_HOST, port: dbPort, user: env.DB_USER,
      password: env.DB_PASSWORD, database: env.DB_NAME,
      charset: 'utf8mb4', timezone: 'Z', waitForConnections: true,
      connectionLimit: 5, connectTimeout: 8000, supportBigNumbers: true, bigNumberStrings: true,
    };
  }
  return config;
}
module.exports = { getConfig };
