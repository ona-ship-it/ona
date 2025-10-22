import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyEscrowSystem() {
  console.log('=== Implementing Giveaway Escrow System ===\n');
  
  try {
    // Read the SQL file
    const sqlContent = readFileSync('implement-escrow-system.sql', 'utf8');
    
    console.log('📄 SQL script loaded successfully');
    console.log('⚠️  Note: This script requires direct database access to execute DDL statements\n');
    
    // Test current database access
    console.log('🔍 Testing current database access...\n');
    
    // Check if wallets table exists
    console.log('1. Checking if wallets table exists...');
    try {
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id')
        .limit(1);
      
      if (walletsError) {
        if (walletsError.code === 'PGRST106') {
          console.log('   ❌ Wallets table does not exist yet');
        } else {
          console.log(`   ❌ Error accessing wallets: ${walletsError.message}`);
        }
      } else {
        console.log('   ✅ Wallets table exists and is accessible');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Check if giveaways table has prize_amount column
    console.log('\n2. Checking giveaways table structure...');
    try {
      const { data: giveaways, error: giveawaysError } = await supabase
        .from('giveaways')
        .select('id, title, prize_amount')
        .limit(1);
      
      if (giveawaysError) {
        if (giveawaysError.message.includes('prize_amount')) {
          console.log('   ❌ prize_amount column does not exist on giveaways table');
        } else {
          console.log(`   ❌ Error: ${giveawaysError.message}`);
        }
      } else {
        console.log('   ✅ Giveaways table accessible');
        if (giveaways && giveaways.length > 0 && 'prize_amount' in giveaways[0]) {
          console.log('   ✅ prize_amount column exists');
        } else {
          console.log('   ❌ prize_amount column may not exist');
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Check current RLS policies
    console.log('\n3. Checking current RLS policies...');
    try {
      // This would require a custom function or direct SQL access
      console.log('   ⚠️  Policy checking requires direct database access');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n=== SQL Script to Execute ===');
    console.log('Please run the following SQL script in your Supabase SQL editor:\n');
    console.log('📁 File: implement-escrow-system.sql');
    console.log('📝 Content preview:');
    console.log('```sql');
    console.log(sqlContent.substring(0, 500) + '...');
    console.log('```\n');
    
    console.log('=== After Running the SQL Script ===');
    console.log('The escrow system will provide:');
    console.log('✅ Wallet table for user balances');
    console.log('✅ Admin bypass for giveaway creation');
    console.log('✅ Balance checking for non-admin users');
    console.log('✅ Helper functions for wallet management');
    console.log('✅ RLS policies for security\n');
    
  } catch (error) {
    console.error('❌ Error reading SQL file:', error);
  }
}

async function testEscrowFunctionality() {
  console.log('=== Testing Escrow System (Post-Implementation) ===\n');
  
  try {
    // Test 1: Check if wallets table is accessible
    console.log('1. Testing wallets table access...');
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .limit(5);
    
    if (walletsError) {
      console.log(`   ❌ Wallets table error: ${walletsError.message}`);
    } else {
      console.log(`   ✅ Wallets table accessible (${wallets.length} records found)`);
    }
    
    // Test 2: Check if giveaways table has prize_amount
    console.log('\n2. Testing giveaways table with prize_amount...');
    const { data: giveaways, error: giveawaysError } = await supabase
      .from('giveaways')
      .select('id, title, prize_amount')
      .limit(3);
    
    if (giveawaysError) {
      console.log(`   ❌ Giveaways error: ${giveawaysError.message}`);
    } else {
      console.log(`   ✅ Giveaways table accessible with prize_amount (${giveaways.length} records)`);
      if (giveaways.length > 0) {
        console.log(`   📊 Sample data:`, giveaways[0]);
      }
    }
    
    // Test 3: Try to call helper functions (if they exist)
    console.log('\n3. Testing helper functions...');
    try {
      const { data, error } = await supabase.rpc('ensure_user_wallet', {
        user_uuid: '00000000-0000-0000-0000-000000000000'
      });
      
      if (error) {
        console.log(`   ❌ Helper function error: ${error.message}`);
      } else {
        console.log('   ✅ Helper functions are working');
      }
    } catch (error) {
      console.log(`   ❌ Helper function test failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Testing error:', error);
  }
}

// Run the implementation
console.log('🚀 Starting Escrow System Implementation...\n');
applyEscrowSystem()
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('📋 NEXT STEPS:');
    console.log('1. Run the SQL script in Supabase SQL editor');
    console.log('2. Test the escrow functionality');
    console.log('3. Integrate wallet management in your app');
    console.log('4. Add admin interface for fund management');
    console.log('='.repeat(60));
  })
  .catch(console.error);