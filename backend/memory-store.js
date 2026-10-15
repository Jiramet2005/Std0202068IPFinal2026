const { initialEmployees } = require('./seed');

function createMemoryStore() {
  const employees = initialEmployees.map(employee => ({ ...employee }));
  let nextId = employees.length + 1;
  return {
    mode: 'memory',
    async health() {},
    async verifyLogin(username, password) { return username === 'admin' && password === 'password123'; },
    async isAuthorized(token) { return token === 'mock-jwt-token'; },
    async listEmployees() { return employees.map(employee => ({ ...employee })); },
    async addEmployee(values) {
      const employee = { id: String(nextId++), ...values, status: 'Active' };
      employees.push(employee);
      return { ...employee };
    },
    async toggleStatus(id) {
      const employee = employees.find(item => item.id === id);
      if (!employee) return null;
      employee.status = employee.status === 'Active' ? 'On Leave' : 'Active';
      return { ...employee };
    },
    async deleteEmployee(id) {
      const index = employees.findIndex(item => item.id === id);
      if (index < 0) return false;
      employees.splice(index, 1);
      return true;
    },
    async recordAnalysis() {},
    async close() {},
  };
}
module.exports = { createMemoryStore };
