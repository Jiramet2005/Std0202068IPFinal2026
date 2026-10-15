const mysql = require('mysql2/promise');
const { randomBytes, scryptSync, timingSafeEqual, createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { initialEmployees } = require('./seed');
const tokenHash = token => createHash('sha256').update(token).digest('hex');
const mapEmployee = row => ({ id: String(row.id), name: row.name, position: row.position, status: row.status, salary: Number(row.salary) });

function createMysqlStore(database) {
  const pool = mysql.createPool(database);
  const listSql = 'SELECT id, name, position, status, salary FROM hr_employees';
  return {
    mode: 'mysql',
    pool,
    async health() {
      await pool.query('SELECT 1 FROM hr_employees LIMIT 1');
      await pool.query('SELECT 1 FROM hr_users LIMIT 1');
      await pool.query('SELECT 1 FROM hr_sessions LIMIT 1');
      await pool.query('SELECT 1 FROM hr_salary_analyses LIMIT 1');
    },
    async initialize() {
      // Execute our fixed schema one statement at a time. multipleStatements stays disabled.
      const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
        .split('\n').filter(line => !line.trimStart().startsWith('--')).join('\n');
      for (const statement of schema.split(';').map(value => value.trim()).filter(Boolean)) await pool.query(statement);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [migration] = await connection.execute('INSERT IGNORE INTO hr_schema_migrations (version) VALUES (?)', ['initial-hr-v1']);
        if (migration.affectedRows === 1) {
          const salt = randomBytes(16).toString('hex');
          const hash = scryptSync('password123', salt, 64).toString('hex');
          await connection.execute('INSERT INTO hr_users (username, password_salt, password_hash) VALUES (?, ?, ?)', ['admin', salt, hash]);
          for (const employee of initialEmployees) {
            await connection.execute('INSERT INTO hr_employees (name, position, status, salary) VALUES (?, ?, ?, ?)',
              [employee.name, employee.position, employee.status, employee.salary]);
          }
        }
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async verifyLogin(username, password) {
      if (typeof username !== 'string' || typeof password !== 'string') return false;
      const [rows] = await pool.execute('SELECT id, password_salt, password_hash FROM hr_users WHERE username = ?', [username]);
      if (!rows.length) return false;
      const expected = Buffer.from(rows[0].password_hash, 'hex');
      const actual = scryptSync(password, rows[0].password_salt, 64);
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
      await pool.execute('INSERT INTO hr_sessions (token_hash, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), created_at = CURRENT_TIMESTAMP',
        [tokenHash('mock-jwt-token'), rows[0].id]);
      return true;
    },
    async isAuthorized(token) {
      if (token !== 'mock-jwt-token') return false;
      const [rows] = await pool.execute('SELECT user_id FROM hr_sessions WHERE token_hash = ?', [tokenHash(token)]);
      return rows.length > 0;
    },
    async listEmployees() {
      const [rows] = await pool.query(`${listSql} ORDER BY id`);
      return rows.map(mapEmployee);
    },
    async addEmployee({ name, position, salary }) {
      const [result] = await pool.execute('INSERT INTO hr_employees (name, position, salary) VALUES (?, ?, ?)', [name, position, salary]);
      const [rows] = await pool.execute(`${listSql} WHERE id = ?`, [String(result.insertId)]);
      return mapEmployee(rows[0]);
    },
    async toggleStatus(id) {
      // A transaction keeps the returned row consistent with this atomic toggle.
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.execute("UPDATE hr_employees SET status = IF(status = 'Active', 'On Leave', 'Active') WHERE id = ?", [id]);
        if (!result.affectedRows) { await connection.rollback(); return null; }
        const [rows] = await connection.execute(`${listSql} WHERE id = ?`, [id]);
        await connection.commit();
        return mapEmployee(rows[0]);
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async deleteEmployee(id) {
      const [result] = await pool.execute('DELETE FROM hr_employees WHERE id = ?', [id]);
      return result.affectedRows > 0;
    },
    async recordAnalysis(salaries, clusters) {
      await pool.execute('INSERT INTO hr_salary_analyses (employee_count, salary_snapshot, clusters) VALUES (?, ?, ?)',
        [salaries.length, JSON.stringify(salaries), JSON.stringify(clusters)]);
    },
    async close() { await pool.end(); },
  };
}
module.exports = { createMysqlStore };
