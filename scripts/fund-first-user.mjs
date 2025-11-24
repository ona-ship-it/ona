// Funds the first auth user with fiat to satisfy escrow checks
// Uses service role to bypass RLS and call canonical public RPCs

import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Try multiple env files to match existing project conventions
const candidateEnvFiles = [
  '.env.local',
  '.env.development.local',
  '.env',
];

for (const file of candidateEnvFiles) {
  const p = path.join(process.cwd(), file);
  if (existsSync(p)) {
    dotenvConfig({ path: p });
    break;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  // List users via Admin API to get a deterministic creator_id
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (usersError) {
    console.error('Failed to list users:', usersError.message);
    process.exit(1);
  }
  const firstUser = usersData?.users?.[0];
  if (!firstUser) {
    console.error('No users found in auth.users.');
    process.exit(1);
  }
  const userId = firstUser.id;
  console.log('Selected user for funding:', userId);

  // Ensure wallet exists via public canonical function
  const { data: ensured, error: ensureErr } = await supabase.rpc('ensure_user_wallet', { user_uuid: userId });
  if (ensureErr) {
    console.error('ensure_user_wallet failed:', ensureErr.message);
    process.exit(1);
  }
  console.log('Wallet ensured for user:', ensured || userId);

  // Fund fiat balance sufficiently to pass escrow (use generous amount)
  const amountToAdd = 100; // adjust if diagnostic requires more
  const { data: funded, error: fundErr } = await supabase.rpc('add_funds_to_wallet_fiat', {
    user_uuid: userId,
    amount_to_add: amountToAdd,
  });
  if (fundErr) {
    console.error('add_funds_to_wallet_fiat failed:', fundErr.message);
    process.exit(1);
  }
  console.log('Fiat funding success:', funded);

  // Fallback: if RPC reported false (no rows updated), perform direct update with service role
  if (funded === false) {
    console.log('Fallback: directly updating public.wallets fiat balance');
    const { error: updErr } = await supabase
      .from('wallets')
      .update({ balance_fiat: 100 })
      .eq('user_id', userId);
    if (updErr) {
      console.warn('Direct update failed:', updErr.message);
    } else {
      console.log('Direct update succeeded for public.wallets');
    }
  }

  // Mirror funding into onagui schema to satisfy policies that reference onagui.wallets
  const { error: ensureOngErr } = await supabase.rpc('onagui.ensure_user_wallet', { user_uuid: userId });
  if (ensureOngErr) {
    console.warn('onagui.ensure_user_wallet warn:', ensureOngErr.message);
  } else {
    console.log('onagui wallet ensured for user:', userId);
  }

  const { data: fundedOng, error: fundOngErr } = await supabase.rpc('onagui.add_funds_to_wallet_fiat', {
    user_uuid: userId,
    amount_to_add: amountToAdd,
  });
  if (fundOngErr) {
    console.warn('onagui.add_funds_to_wallet_fiat warn:', fundOngErr.message);
  } else {
    console.log('onagui fiat funding success:', fundedOng);
  }

  console.log('Funding complete. You can now run diagnose-giveaways.mjs');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});