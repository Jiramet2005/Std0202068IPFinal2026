const express = require('express');
const cors = require('cors');
const { salaryClusters } = require('./clustering');
const { createMemoryStore } = require('./memory-store');
function createApp({ store = createMemoryStore(), webRoot } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', async (_req, res) => {
    await store.health();
    res.json({ success: true, storage: store.mode });
  });
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (await store.verifyLogin(username, password)) return res.json({ success: true, token: 'mock-jwt-token' });
    return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  });
  app.use('/api/employees', async (req, res, next) => {
    const header = req.get('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!(await store.isAuthorized(token))) {
      return res.status(401).json({ success: false, error: 'Please log in to access employee records.' });
    }
    next();
  });
  app.get('/api/employees/salary-clusters', async (_req, res) => {
    const employees = await store.listEmployees();
    const salaries = employees.map(employee => employee.salary);
    const clusters = salaryClusters(salaries);
    await store.recordAnalysis(salaries, clusters);
    res.json({ success: true, clusters });
  });
  app.get('/api/employees', async (_req, res) => res.json(await store.listEmployees()));
  app.post('/api/employees', async (req, res) => {
    const { name, position, salary } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() || typeof position !== 'string' || !position.trim()) {
      return res.status(400).json({ success: false, error: 'Name and position are required.' });
    }
    if ([name, position].some(value => [...value.trim()].length > 255)) {
      return res.status(400).json({ success: false, error: 'Name and position must be at most 255 characters.' });
    }
    if (typeof salary !== 'number' || !Number.isFinite(salary) || salary < 0 || salary > Number.MAX_SAFE_INTEGER || Number(salary.toFixed(2)) !== salary) {
      return res.status(400).json({ success: false, error: 'Salary must be a finite, non-negative number with at most 2 decimal places within the safe numeric range.' });
    }
    const employee = await store.addEmployee({ name: name.trim(), position: position.trim(), salary });
    return res.status(201).json(employee);
  });
  app.param('id', (req, res, next, id) => {
    if (!/^[1-9]\d{0,19}$/.test(id) || BigInt(id) > 18446744073709551615n) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }
    next();
  });
  app.put('/api/employees/:id/status', async (req, res) => {
    const employee = await store.toggleStatus(req.params.id);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found.' });
    return res.json(employee);
  });
  app.delete('/api/employees/:id', async (req, res) => {
    if (!(await store.deleteEmployee(req.params.id))) return res.status(404).json({ success: false, error: 'Employee not found.' });
    return res.json({ success: true });
  });
  if (webRoot) app.use(express.static(webRoot, { extensions: ['html'] }));
  app.use((_req, res) => res.status(404).json({ success: false, error: 'Endpoint not found.' }));
  app.use((error, _req, res, _next) => {
    const unavailable = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_NO_SUCH_TABLE'].includes(error.code);
    const status = unavailable ? 503 : error.status >= 400 && error.status < 500 ? error.status : 500;
    res.status(status).json({ success: false, error: status === 503 ? 'Database unavailable. Check the server configuration and initialize the HR tables.' : status === 500 ? 'Internal server error.' : 'Invalid JSON request body.' });
  });
  return app;
}
module.exports = { createApp };
