// scripts/test-wallet-final.js — emulate top-up + deduction + rollback
const { Client } = require('pg');

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('Please set SUPABASE_DB_URL or DATABASE_URL');
  process.exit(1);
}

const client = new Client({ connectionString: url });

async function run() {
  await client.connect();
  try {
    const userId = process.env.TEST_USER_UUID;
    if (!userId) {
      throw new Error('Set TEST_USER_UUID env var to run test');
    }

    await client.query('BEGIN');

    // ensure wallet
    await client.query('SELECT public.ensure_user_wallet($1::uuid)', [userId]);

    // credit wallet manually (transactional test)
    console.log('Adding +50 to fiat_balance (transactional test)');
    await client.query(
      'UPDATE user_wallets SET fiat_balance = COALESCE(fiat_balance, 0) + 50 WHERE user_id = $1::uuid',
      [userId]
    );

    // attempt deduction
    const { rows } = await client.query(
      'SELECT public.deduct_funds_from_wallet_fiat(user_uuid => $1::uuid, amount_to_deduct => $2::numeric) AS ok',
      [userId, 10.00]
    );
    console.log('deduct result:', rows[0]);

    // check balance
    const bal = await client.query('SELECT fiat_balance FROM user_wallets WHERE user_id = $1::uuid', [userId]);
    console.log('balance after deduction (in-transaction):', bal.rows[0]);

    console.log('Rolling back (to avoid permanent test changes)');
    await client.query('ROLLBACK');
  } catch (err) {
    console.error('Error:', err);
    await client.query('ROLLBACK').catch(()=>{});
  } finally {
    await client.end();
  }
}

run();