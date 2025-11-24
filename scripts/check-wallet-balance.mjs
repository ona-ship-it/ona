import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const candidateEnvFiles = ['.env.local', '.env.development.local', '.env'];
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
  console.error('Missing Supabase env');
  process.exit(1);
}
const supabase = createClient(url, serviceKey);

async function main() {
  const { data: usersPage, error: usersErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (usersErr) {
    console.error('Users list error:', usersErr.message);
    process.exit(1);
  }
  const userId = usersPage?.users?.[0]?.id;
  if (!userId) {
    console.error('No users found');
    process.exit(1);
  }
  console.log('Checking balances for user:', userId);

  const { data: pubWallet, error: pubErr } = await supabase
    .from('wallets')
    .select('user_id,balance_fiat,balance_tickets')
    .eq('user_id', userId)
    .maybeSingle();
  console.log('public.wallets:', pubWallet, pubErr?.message || null);

  const { data: onaWallet, error: onaErr } = await supabase
    .from('onagui.wallets')
    .select('user_id,balance_fiat,balance_tickets')
    .eq('user_id', userId)
    .maybeSingle();
  console.log('onagui.wallets:', onaWallet, onaErr?.message || null);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});