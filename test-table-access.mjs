import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// Test different table access patterns
const tests = ['giveaways', 'wallets', 'profiles'];
for (const table of tests) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`✅ ${table}: ${error ? error.message : 'accessible'}`);
  } catch (e) {
    console.log(`❌ ${table}: ${e.message}`);
  }
}

// Test RPC functions
const rpcTests = ['ensure_user_wallet', 'is_admin_user'];
for (const func of rpcTests) {
  try {
    const { data, error } = await supabase.rpc(func, { p_user_id: '00000000-0000-0000-0000-000000000000' });
    console.log(`✅ RPC ${func}: ${error ? error.message : 'callable'}`);
  } catch (e) {
    console.log(`❌ RPC ${func}: ${e.message}`);
  }
}