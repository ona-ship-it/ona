// tests/integration/admin-wallet.test.js
// Integration tests for Admin Wallet Balance API
jest.setTimeout(10000);

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const serviceToken = process.env.TEST_SERVICE_TOKEN;

test('GET /api/admin/wallet/balance missing Authorization returns 401', async () => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 9000);
  const res = await fetch(`${base}/api/admin/wallet/balance`, { signal: controller.signal }).catch(() => null);
  clearTimeout(t);
  expect(res).not.toBeNull();
  expect(res.status).toBe(401);
  const body = await res.json().catch(() => ({}));
  expect(body?.error).toMatch(/Authorization|unauthorized/i);
});

const maybeServiceTest = serviceToken ? test : test.skip;

maybeServiceTest('GET /api/admin/wallet/balance with token but missing user_id returns 400 or 403', async () => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 9000);
  const res = await fetch(`${base}/api/admin/wallet/balance`, {
    headers: { Authorization: `Bearer ${serviceToken}` },
    signal: controller.signal,
  }).catch(() => null);
  clearTimeout(t);
  expect(res).not.toBeNull();
  // If token matches server service key -> 400; if not -> 403
  expect([400, 403]).toContain(res.status);
  const body = await res.json().catch(() => ({}));
  expect(["Missing user_id parameter", "Unauthorized"]).toContain(body?.error);
});