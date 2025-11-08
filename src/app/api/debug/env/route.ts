import { NextResponse } from 'next/server';

export async function GET() {
  const keys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'RPC_URL',
    'ETHEREUM_RPC_URL',
    'TESTNET_RPC_URL',
    'USDT_CONTRACT_ADDRESS',
    'TESTNET_USDT_ADDRESS',
    'HOT_WALLET_PRIVATE_KEY',
    'TESTNET_HOT_WALLET_PRIVATE_KEY',
    'ENCRYPTION_KEY',
    'WALLET_ENCRYPTION_KEY',
  ];

  const env = Object.fromEntries(
    keys.map((k) => [k, process.env[k] ? true : false])
  );

  return NextResponse.json({ ok: true, env });
}