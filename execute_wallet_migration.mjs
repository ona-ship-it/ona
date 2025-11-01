import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeWalletMigration() {
  console.log('🚀 Starting wallet system migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250125_create_missing_wallet_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('📝 SQL content preview:');
    console.log(migrationSQL.substring(0, 300) + '...\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔧 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   SQL: ${statement.substring(0, 100)}...`);
        
        try {
          // Use the SQL editor approach - execute raw SQL
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });

          if (error) {
            // If RPC fails, try using the REST API directly
            console.log('   RPC failed, trying direct SQL execution...');
            
            // For table creation, we can use a different approach
            if (statement.includes('CREATE TABLE')) {
              console.log('   ⚠️ Table creation may need manual execution in Supabase dashboard');
              console.log(`   SQL: ${statement};`);
            } else if (statement.includes('ALTER TABLE')) {
              console.log('   ⚠️ Table alteration may need manual execution in Supabase dashboard');
              console.log(`   SQL: ${statement};`);
            } else {
              console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`   ❌ Error in statement ${i + 1}:`, err.message);
          console.log(`   📋 Manual SQL needed: ${statement};`);
        }
      }
    }

    console.log('\n🎉 Migration execution completed!');
    
    // Verify the migration results
    console.log('\n🔍 Verifying migration results...');
    
    // Check if user_wallets table exists
    try {
      const { data: walletsData, error: walletsError } = await supabase
        .from('user_wallets')
        .select('*')
        .limit(1);

      if (walletsError) {
        console.log('❌ user_wallets table check failed:', walletsError.message);
      } else {
        console.log('✅ user_wallets table exists and is accessible');
      }
    } catch (err) {
      console.log('❌ user_wallets table verification failed:', err.message);
    }

    // Check if deposit_transactions table exists
    try {
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposit_transactions')
        .select('*')
        .limit(1);

      if (depositsError) {
        console.log('❌ deposit_transactions table check failed:', depositsError.message);
      } else {
        console.log('✅ deposit_transactions table exists and is accessible');
      }
    } catch (err) {
      console.log('❌ deposit_transactions table verification failed:', err.message);
    }

    // Check if deposit_scan_status table exists
    try {
      const { data: scanData, error: scanError } = await supabase
        .from('deposit_scan_status')
        .select('*')
        .limit(1);

      if (scanError) {
        console.log('❌ deposit_scan_status table check failed:', scanError.message);
      } else {
        console.log('✅ deposit_scan_status table exists and is accessible');
      }
    } catch (err) {
      console.log('❌ deposit_scan_status table verification failed:', err.message);
    }

    // Check if withdrawal_requests table exists
    try {
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .limit(1);

      if (withdrawalError) {
        console.log('❌ withdrawal_requests table check failed:', withdrawalError.message);
      } else {
        console.log('✅ withdrawal_requests table exists and is accessible');
      }
    } catch (err) {
      console.log('❌ withdrawal_requests table verification failed:', err.message);
    }

    // Check if app_users has role column
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('app_users')
        .select('id, role')
        .limit(1);

      if (usersError) {
        console.log('❌ app_users role column check failed:', usersError.message);
      } else {
        console.log('✅ app_users table has role column');
      }
    } catch (err) {
      console.log('❌ app_users role column verification failed:', err.message);
    }

    console.log('\n📋 Migration Summary:');
    console.log('   - user_wallets: per-user on-chain/deposit addresses');
    console.log('   - deposit_transactions: record of on-chain deposits detected');
    console.log('   - deposit_scan_status: track scanning progress/last block scanned');
    console.log('   - withdrawal_requests: user requested withdrawals');
    console.log('   - app_users.role: user role column added');

    console.log('\n⚠️ Note: If any table creation failed, run the SQL manually in Supabase Dashboard > SQL Editor');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

executeWalletMigration();