import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyEscrowSQL() {
  console.log('🚀 Applying Escrow System SQL...\n');
  
  try {
    // Read the SQL file
    const sqlContent = readFileSync('implement-escrow-system-fixed.sql', 'utf8');
    
    console.log('📄 SQL script loaded successfully');
    console.log(`📏 Script length: ${sqlContent.length} characters\n`);
    
    // Try to execute the SQL using the service role
    console.log('🔧 Attempting to execute SQL...');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n${i + 1}/${statements.length}: Executing statement...`);
      console.log(`📄 Statement preview: ${statement.substring(0, 100)}...`);
      
      try {
        // Try using raw SQL execution
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n🏁 Execution complete:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All SQL statements executed successfully!');
      console.log('🧪 Now testing function access...\n');
      
      // Test function access
      await testFunctionAccess();
    } else {
      console.log('\n⚠️  Some statements failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  }
}

async function testFunctionAccess() {
  console.log('🧪 Testing function access after SQL application...\n');
  
  const testUuid = '00000000-0000-0000-0000-000000000000';
  
  const functions = [
    'ensure_user_wallet',
    'is_admin_user',
    'add_funds_to_wallet_fiat',
    'deduct_funds_from_wallet_fiat'
  ];
  
  for (const funcName of functions) {
    try {
      console.log(`🔍 Testing: ${funcName}`);
      
      const { data, error } = await supabase.rpc(funcName, {
        user_uuid: testUuid,
        ...(funcName.includes('add_funds') && { amount_to_add: 10 }),
        ...(funcName.includes('deduct_funds') && { amount_to_deduct: 5 })
      });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Function accessible, returned: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
  }
}

applyEscrowSQL();