import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing Function Access');
console.log('============================================================');

// Test functions with different approaches
const testFunctions = [
  {
    name: 'add_funds_to_wallet (AdminWalletManager function)',
    call: () => supabase.rpc('add_funds_to_wallet', { user_uuid: '00000000-0000-0000-0000-000000000000', amount: 0.01 })
  },
  {
    name: 'ensure_user_wallet (no schema)',
    call: () => supabase.rpc('ensure_user_wallet', { user_uuid: '00000000-0000-0000-0000-000000000000' })
  },
  {
    name: 'onagui.ensure_user_wallet (with schema)',
    call: () => supabase.rpc('onagui.ensure_user_wallet', { user_uuid: '00000000-0000-0000-0000-000000000000' })
  },
  {
    name: 'is_admin_user (no schema)',
    call: () => supabase.rpc('is_admin_user', { user_uuid: '00000000-0000-0000-0000-000000000000' })
  },
  {
    name: 'onagui.is_admin_user (with schema)',
    call: () => supabase.rpc('onagui.is_admin_user', { user_uuid: '00000000-0000-0000-0000-000000000000' })
  }
];

for (const test of testFunctions) {
  try {
    console.log(`\n🔍 Testing: ${test.name}`);
    const { data, error } = await test.call();
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      // Check if it's a "function not found" error vs other errors
      if (error.message.includes('not found') || error.message.includes('schema cache')) {
        console.log('   📝 Function not accessible');
      } else {
        console.log('   ✅ Function exists but returned error (expected for test UUID)');
      }
    } else {
      console.log(`   ✅ Success: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
}

console.log('\n============================================================');
console.log('🏁 Function access test complete');