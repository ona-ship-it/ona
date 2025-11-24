import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function check(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options).catch(err => ({ ok: false, status: 0, error: err.message }));
  let body = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, ok: res.ok, body };
}

async function run() {
  console.log('▶ API Integration Tests');

  // Wallet balance: unauthenticated should be 401
  const bal = await check('/api/wallet/balance');
  console.log('wallet/balance (unauth):', bal.status, bal.body?.error || bal.body);

  // Giveaways list: should be ok
  const list = await check('/api/giveaways/list');
  console.log('giveaways/list:', list.status, list.body?.ok === true ? 'ok' : list.body?.error || list.body);

  // Join giveaway: unauthenticated should be 401
  const join = await check('/api/giveaways/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ giveawayId: '00000000-0000-0000-0000-000000000000' }) // placeholder
  });
  console.log('giveaways/join (unauth):', join.status, join.body?.error || join.body);

  // Admin endpoints: unauthorized should be 401
  const draw = await check('/api/giveaways/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ giveawayId: '00000000-0000-0000-0000-000000000000' }) });
  console.log('giveaways/draw (unauth):', draw.status, draw.body?.error || draw.body);

  const finalize = await check('/api/giveaways/finalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ giveawayId: '00000000-0000-0000-0000-000000000000' }) });
  console.log('giveaways/finalize (unauth):', finalize.status, finalize.body?.error || finalize.body);

  const repick = await check('/api/giveaways/repick', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ giveawayId: '00000000-0000-0000-0000-000000000000' }) });
  console.log('giveaways/repick (unauth):', repick.status, repick.body?.error || repick.body);

  console.log('\nℹ️ For authenticated tests, log in via the app and rerun using your browser or a cookie-aware harness.');
}

run().catch(err => {
  console.error('Integration tests failed:', err);
  process.exit(1);
});