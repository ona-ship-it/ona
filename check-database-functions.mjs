import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseState() {
  console.log('🔍 Checking Database State\n');
  
  try {
    // Check if wallets table exists
    console.log('1. Checking wallets table...');
    try {
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('*')
        .limit(1);
      
      if (walletsError) {
        if (walletsError.code === 'PGRST106') {
          console.log('   ❌ Wallets table does not exist');
        } else {
          console.log(`   ❌ Error: ${walletsError.message}`);
        }
      } else {
        console.log('   ✅ Wallets table exists');
        console.log(`   📊 Sample data: ${JSON.stringify(wallets)}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // Check if giveaways table has escrow columns
    console.log('\n2. Checking giveaways table structure...');
    try {
      const { data: giveaways, error: giveawaysError } = await supabase
        .from('giveaways')
        .select('id, title, prize_amount, escrow_amount, escrow_status')
        .limit(1);
      
      if (giveawaysError) {
        console.log(`   ❌ Error: ${giveawaysError.message}`);
      } else {
        console.log('   ✅ Giveaways table accessible');
        console.log(`   📊 Columns available: ${Object.keys(giveaways[0] || {}).join(', ')}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // Try to call some basic RPC functions to see what's available
    console.log('\n3. Testing available RPC functions...');
    
    const testFunctions = [
      'version',
      'current_user',
      'current_database',
      'pg_backend_pid'
    ];
    
    for (const func of testFunctions) {
      try {
        const { data, error } = await supabase.rpc(func);
        if (error) {
          console.log(`   ❌ ${func}: ${error.message}`);
        } else {
          console.log(`   ✅ ${func}: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        console.log(`   ❌ ${func}: ${err.message}`);
      }
    }
    
    // Check if we can access any onagui schema objects
    console.log('\n4. Checking onagui schema access...');
    try {
      // Try to access onagui.profiles if it exists
      const { data: profiles, error: profilesError } = await supabase
        .from('onagui.profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.log(`   ❌ onagui.profiles: ${profilesError.message}`);
      } else {
        console.log('   ✅ onagui.profiles accessible');
      }
    } catch (error) {
      console.log(`   ❌ onagui schema access: ${error.message}`);
    }
    
    // Try to check what schemas are available
    console.log('\n5. Checking available schemas...');
    try {
      const { data, error } = await supabase.rpc('current_schemas', { include_implicit: true });
      if (error) {
        console.log(`   ❌ Error getting schemas: ${error.message}`);
      } else {
        console.log(`   📋 Available schemas: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  }
}

checkDatabaseState();