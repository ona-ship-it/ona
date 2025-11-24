// tests/integration/giveaways.test.js
// Basic integration tests for Giveaways API
jest.setTimeout(15000);

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Giveaways API', () => {
  test('GET /api/giveaways list works', async () => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 14000);
    const res = await fetch(`${base}/api/giveaways`, { signal: controller.signal });
    clearTimeout(t);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('POST /api/giveaways/:id/claim-free requires auth', async () => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 14000);
    const res = await fetch(`${base}/api/giveaways/test-giveaway-id/claim-free`, { method: 'POST', signal: controller.signal });
    clearTimeout(t);
    expect(res.status).toBe(401);
  });
});