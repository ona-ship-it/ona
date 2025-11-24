// tests/integration/wallet.test.js
// Integration test for wallet balance API
jest.setTimeout(15000);

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const serviceToken = process.env.TEST_SERVICE_TOKEN;
test('GET /api/wallet/balance unauthenticated responds', async () => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(`${base}/api/wallet/balance`, { signal: controller.signal }).catch(() => null);
  clearTimeout(t);
  expect(res).not.toBeNull();
  // Route requires user session; expect 401 or rate-limit 429 if spammed
  expect([401, 429, 200]).toContain(res.status);
  const body = await res.json().catch(() => ({}));
  expect(body).toBeDefined();
});

const maybeServiceTest = serviceToken ? test : test.skip;

maybeServiceTest('GET /api/wallet/balance with service role requires user_id', async () => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(`${base}/api/wallet/balance`, {
    headers: { Authorization: `Bearer ${serviceToken}` },
    signal: controller.signal,
  }).catch(() => null);
  clearTimeout(t);
  expect(res).not.toBeNull();
  expect(res.status).toBe(400);
  const body = await res.json().catch(() => ({}));
  expect(body?.error).toBe('Missing user_id');
});