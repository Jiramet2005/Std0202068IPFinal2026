// Run locally after npm ci in frontend. Produces static files for the cloud API.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const frontend = path.join(__dirname, '..', 'frontend');
const apiUrl = process.argv[2] || 'http://119.59.102.161:3009';
const parsed = new URL(apiUrl);
if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Provide an HTTP(S) API base URL without credentials.');
const result = spawnSync(process.execPath, [path.join(frontend, 'node_modules', 'expo', 'bin', 'cli'), 'export', '--platform', 'web', '--output-dir', path.join(__dirname, 'public')], {
  cwd: frontend, stdio: 'inherit', env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl.replace(/\/$/, ''), EXPO_OFFLINE: '1', CI: '1' },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
