import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from common locations
const envCandidates = ['.env.local', '.env.development.local', '.env', '.env.production.local'];
let loaded = false;
for (const path of envCandidates) {
  try {
    dotenv.config({ path });
    loaded = true;
    break;
  } catch {}
}
if (!loaded) dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('Listing auth users to select the first one...');
  const { data: usersPage, error: usersErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (usersErr) {
    console.error('Failed to list users:', usersErr.message);
    process.exit(1);
  }
  const firstUser = usersPage?.users?.[0];
  if (!firstUser) {
    console.error('No users found. Cannot promote.');
    process.exit(1);
  }
  const userId = firstUser.id;
  const email = firstUser.email || 'N/A';
  console.log(`Promoting first user to admin: ${email} (${userId})`);

  // Ensure profile exists
  const now = new Date().toISOString();
  const { error: upsertErr } = await supabase
    .from('onagui_profiles')
    .upsert({ id: userId, is_admin: true, updated_at: now }, { onConflict: 'id' });
  if (upsertErr) {
    console.error('Failed to upsert onagui_profiles:', upsertErr.message);
    process.exit(1);
  }
  console.log('Profile upserted with is_admin=true. Verifying RPC is_admin_user...');

  const { data: isAdmin, error: rpcErr } = await supabase.rpc('is_admin_user', { user_uuid: userId });
  if (rpcErr) {
    console.warn('RPC is_admin_user check failed:', rpcErr.message);
  } else {
    console.log(`is_admin_user(${userId}) => ${isAdmin}`);
  }

  console.log('✅ Promotion complete.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});