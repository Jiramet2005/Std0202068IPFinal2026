const express = require('express');
const cors = require('cors');
const { salaryClusters } = require('./clustering');
const initialEmployees = [
  { id: '1', name: 'John Doe', position: 'Software Engineer', status: 'Active', salary: 45000 },
  { id: '2', name: 'Jane Smith', position: 'HR Manager', status: 'Active', salary: 48000 },
  { id: '3', name: 'Somchai Jaidee', position: 'Office Assistant', status: 'On Leave', salary: 18000 },
  { id: '4', name: 'Pim Chan', position: 'Support Specialist', status: 'Active', salary: 22000 },
  { id: '5', name: 'Alex Chen', position: 'Engineering Lead', status: 'Active', salary: 85000 },
  { id: '6', name: 'Nida Wong', position: 'Product Director', status: 'On Leave', salary: 95000 },
];
function createApp() {
  const app = express();
  let employees = initialEmployees.map(employee => ({ ...employee }));
  let nextId = employees.length + 1;
  app.use(cors());
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_req, res) => res.json({ success: true }));
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body ?? {};
    if (username === 'admin' && password === 'password123') return res.json({ success: true, token: 'mock-jwt-token' });
    return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  });
  app.use('/api/employees', (req, res, next) => {
    if (req.get('Authorization') !== 'Bearer mock-jwt-token') {
      return res.status(401).json({ success: false, error: 'Please log in to access employee records.' });
    }
    next();
  });
  app.get('/api/employees/salary-clusters', (_req, res) => {
    res.json({ success: true, clusters: salaryClusters(employees.map(employee => employee.salary)) });
  });
  app.get('/api/employees', (_req, res) => res.json(employees));
  app.post('/api/employees', (req, res) => {
    const { name, position, salary } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() || typeof position !== 'string' || !position.trim()) {
      return res.status(400).json({ success: false, error: 'Name and position are required.' });
    }
    if (typeof salary !== 'number' || !Number.isFinite(salary) || salary < 0 || salary > Number.MAX_SAFE_INTEGER) {
      return res.status(400).json({ success: false, error: 'Salary must be a finite, non-negative number within the safe numeric range.' });
    }
    const employee = { id: String(nextId++), name: name.trim(), position: position.trim(), status: 'Active', salary };
    employees.push(employee);
    return res.status(201).json(employee);
  });
  app.put('/api/employees/:id/status', (req, res) => {
    const employee = employees.find(item => item.id === req.params.id);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found.' });
    employee.status = employee.status === 'Active' ? 'On Leave' : 'Active';
    return res.json(employee);
  });
  app.delete('/api/employees/:id', (req, res) => {
    const index = employees.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Employee not found.' });
    employees.splice(index, 1);
    return res.json({ success: true });
  });
  app.use((_req, res) => res.status(404).json({ success: false, error: 'Endpoint not found.' }));
  app.use((error, _req, res, _next) => {
    const status = error.status >= 400 && error.status < 500 ? error.status : 500;
    res.status(status).json({ success: false, error: status === 500 ? 'Internal server error.' : 'Invalid JSON request body.' });
  });
  return app;
}
module.exports = { createApp };
