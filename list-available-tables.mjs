import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  console.log('🔍 Testing table accessibility...\n');
  
  const tablesToTest = [
    'giveaways',
    'wallets', 
    'profiles',
    'user_roles',
    'platform_wallets',
    'users'
  ];
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible (${data ? data.length : 0} rows in sample)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n🔧 Testing RPC functions...\n');
  
  const functionsToTest = [
    { name: 'ensure_user_wallet', params: { p_user_id: '00000000-0000-0000-0000-000000000000' }},
    { name: 'is_admin_user', params: { p_user: '00000000-0000-0000-0000-000000000000' }},
    { name: 'add_funds_to_wallet', params: { p_user_id: '00000000-0000-0000-0000-000000000000', p_amount: 10 }},
    { name: 'deduct_funds_from_wallet', params: { p_user_id: '00000000-0000-0000-0000-000000000000', p_amount: 10 }}
  ];
  
  for (const func of functionsToTest) {
    try {
      const { data, error } = await supabase.rpc(func.name, func.params);
      
      if (error) {
        // Function exists if we get parameter errors rather than "not found" errors
        if (error.message.includes('schema cache') || error.message.includes('not found')) {
          console.log(`❌ ${func.name}: function not found`);
        } else {
          console.log(`✅ ${func.name}: accessible (${error.message})`);
        }
      } else {
        console.log(`✅ ${func.name}: accessible and working`);
      }
    } catch (err) {
      console.log(`❌ ${func.name}: ${err.message}`);
    }
  }
}

listTables();