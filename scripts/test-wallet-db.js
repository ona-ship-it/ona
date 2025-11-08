// scripts/test-wallet-db.js — basic sanity checks (tables, RPCs, sample user)
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
    console.log('Checking wallet tables and RPCs...');

    const checks = [
      { sql: "SELECT to_regclass('public.user_wallets') as table_exists" , name:'user_wallets' },
      { sql: "SELECT to_regclass('public.wallets_fiat') as table_exists" , name:'wallets_fiat' },
      { sql: "SELECT proname FROM pg_proc WHERE proname = 'deduct_funds_from_wallet_fiat'" , name:'rpc_deduct_funds_from_wallet_fiat' },
      { sql: "SELECT proname FROM pg_proc WHERE proname = 'ensure_user_wallet'" , name:'rpc_ensure_user_wallet' },
    ];

    for (const c of checks) {
      const r = await client.query(c.sql);
      console.log(`${c.name}:`, r.rows[0]);
    }

    // sample user tests - pick a real admin or test user UUID
    const userId = process.env.TEST_USER_UUID;
    if (!userId) {
      console.log('Skipping wallet RPC functional tests (set TEST_USER_UUID to run them)');
      return;
    }

    console.log('Ensuring wallet for user:', userId);
    let res = await client.query(
      'SELECT public.ensure_user_wallet($1::uuid) as ensured', [userId]
    );
    console.log('ensure_user_wallet result:', res.rows[0]);

    console.log('Trying a small deduction (should fail if no balance):');
    res = await client.query(
      'SELECT public.deduct_funds_from_wallet_fiat(user_uuid => $1::uuid, amount_to_deduct => $2::numeric) AS ok', [userId, 1.00]
    );
    console.log('deduct result:', res.rows[0]);
  } catch (err) {
    console.error('Error running checks:', err);
  } finally {
    await client.end();
  }
}

run();