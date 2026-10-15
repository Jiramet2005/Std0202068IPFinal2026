const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('./app');
const { salaryClusters } = require('./clustering');

test('K-Means: known separated salaries have correct means, counts and ordering', () => {
  assert.deepEqual(salaryClusters([10000, 20000, 45000, 55000, 80000, 100000]), [
    { group: 'Tier 1', centroid: 15000, count: 2 },
    { group: 'Tier 2', centroid: 50000, count: 2 },
    { group: 'Tier 3', centroid: 90000, count: 2 },
  ]);
});
test('K-Means: empty, single, duplicate, two-tier and zero salary datasets', () => {
  for (const values of [[], [0], [45000], [10, 10, 10], [0, 0, 20], [1, 2], [1, 1, 2, 2, 3, 3], [Number.MAX_SAFE_INTEGER]]) {
    const result = salaryClusters(values);
    assert.equal(result.length, 3);
    assert.equal(result.reduce((sum, item) => sum + item.count, 0), values.length);
    for (const item of result) {
      if (item.count) assert.ok(Number.isFinite(item.centroid));
      else assert.equal(item.centroid, null);
    }
    const means = result.filter(item => item.count).map(item => item.centroid);
    assert.deepEqual(means, [...means].sort((a, b) => a - b));
  }
});
test('HTTP integration: auth, validation, CRUD, current-data analytics and empty list', async t => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, method = 'GET', body, auth = true) => {
    const response = await fetch(`${url}/api${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer mock-jwt-token' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: await response.json() };
  };
  assert.equal((await call('/login', 'POST', { username: 'admin', password: 'wrong' }, false)).status, 401);
  assert.deepEqual(await call('/login', 'POST', { username: 'admin', password: 'password123' }, false), {
    status: 200, body: { success: true, token: 'mock-jwt-token' },
  });
  for (const [path, method] of [['/employees', 'GET'], ['/employees', 'POST'], ['/employees/1/status', 'PUT'], ['/employees/1', 'DELETE'], ['/employees/salary-clusters', 'GET']]) {
    assert.equal((await call(path, method, undefined, false)).status, 401);
  }
  const original = (await call('/employees')).body;
  assert.ok(original.length >= 5);
  const valid = { name: '  New Person  ', position: ' Engineer ', salary: 35000 };
  for (const bad of [{}, { ...valid, name: ' ' }, { ...valid, name: 'x'.repeat(256) }, { ...valid, position: '' }, { ...valid, salary: '' }, { ...valid, salary: '35000' }, { ...valid, salary: null }, { ...valid, salary: -1 }, { ...valid, salary: true }, { ...valid, salary: 35000.123 }, { ...valid, salary: Number.MAX_VALUE }]) {
    assert.equal((await call('/employees', 'POST', bad)).status, 400);
  }
  const malformed = await fetch(`${url}/api/employees`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mock-jwt-token' }, body: '{bad json' });
  assert.equal(malformed.status, 400);
  assert.equal(typeof (await malformed.json()).error, 'string');
  const created = await call('/employees', 'POST', valid);
  assert.equal(created.status, 201); assert.equal(created.body.name, 'New Person');
  assert.equal(created.body.position, 'Engineer'); assert.equal(typeof created.body.salary, 'number');
  const id = created.body.id;
  for (const invalidId of ['1abc', '-1', '0', '18446744073709551616']) {
    assert.equal((await call(`/employees/${invalidId}/status`, 'PUT')).status, 404);
    assert.equal((await call(`/employees/${invalidId}`, 'DELETE')).status, 404);
  }
  assert.equal((await call(`/employees/${id}/status`, 'PUT')).body.status, 'On Leave');
  assert.equal((await call(`/employees/${id}/status`, 'PUT')).body.status, 'Active');
  const current = (await call('/employees')).body;
  assert.equal(current.length, original.length + 1);
  const analytics = await call('/employees/salary-clusters');
  assert.equal(analytics.status, 200);
  assert.equal(analytics.body.clusters.reduce((sum, cluster) => sum + cluster.count, 0), current.length);
  assert.deepEqual(analytics.body.clusters, salaryClusters(current.map(employee => employee.salary)));
  assert.equal((await call(`/employees/${id}`, 'DELETE')).status, 200);
  assert.equal((await call(`/employees/${id}`, 'DELETE')).status, 404);
  assert.equal((await call(`/employees/${id}/status`, 'PUT')).status, 404);
  const zero = await call('/employees', 'POST', { ...valid, salary: 0 });
  assert.equal(zero.status, 201); assert.notEqual(zero.body.id, id);
  for (const employee of (await call('/employees')).body) await call(`/employees/${employee.id}`, 'DELETE');
  assert.deepEqual((await call('/employees')).body, []);
  assert.deepEqual((await call('/employees/salary-clusters')).body.clusters, salaryClusters([]));
});

test('async database failures return a safe JSON error, without exposing credentials', async t => {
  const { createMemoryStore } = require('./memory-store');
  const store = createMemoryStore();
  store.health = async () => { throw Object.assign(new Error('private database details'), { code: 'ECONNREFUSED' }); };
  const server = createApp({ store }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.success, false);
  assert.ok(!data.error.includes('private database details'));
});
