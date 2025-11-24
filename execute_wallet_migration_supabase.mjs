import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  try {
    console.log('🚀 Starting wallet migration using Supabase client...');
    
    // First, let's try to create the tables one by one using simple queries
    const migrations = [
      {
        name: 'Create user_wallets table',
        sql: `CREATE TABLE IF NOT EXISTS user_wallets (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          network varchar NOT NULL,
          address text NOT NULL,
          encrypted_private_key text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          UNIQUE(user_id, network)
        )`
      },
      {
        name: 'Create deposit_transactions table',
        sql: `CREATE TABLE IF NOT EXISTS deposit_transactions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES auth.users(id),
          network varchar NOT NULL,
          tx_hash text NOT NULL UNIQUE,
          from_address text,
          to_address text,
          amount numeric(24,8) NOT NULL,
          currency varchar NOT NULL,
          confirmations integer DEFAULT 0,
          status varchar DEFAULT 'pending',
          metadata jsonb,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        )`
      },
      {
        name: 'Create deposit_scan_status table',
        sql: `CREATE TABLE IF NOT EXISTS deposit_scan_status (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          network varchar NOT NULL UNIQUE,
          last_scanned_block bigint DEFAULT 0,
          last_scanned_tx timestamptz DEFAULT now(),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        )`
      },
      {
        name: 'Create withdrawal_requests table',
        sql: `CREATE TABLE IF NOT EXISTS withdrawal_requests (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES auth.users(id),
          amount numeric(24,8) NOT NULL,
          currency varchar NOT NULL DEFAULT 'USDT',
          to_address text NOT NULL,
          status varchar DEFAULT 'pending',
          tx_hash text,
          metadata jsonb,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        )`
      },
      {
        name: 'Add role column to app_users',
        sql: `ALTER TABLE app_users ADD COLUMN IF NOT EXISTS role varchar DEFAULT 'user'`
      }
    ];
    
    console.log(`📝 Executing ${migrations.length} migration steps...`);
    
    // Execute each migration using the REST API directly
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log(`\n⚡ ${i + 1}/${migrations.length}: ${migration.name}`);
      
      try {
        // Use fetch to call the SQL directly via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          },
          body: JSON.stringify({ sql: migration.sql })
        });
        
        if (response.ok) {
          console.log(`✅ ${migration.name} completed successfully`);
        } else {
          const errorText = await response.text();
          console.log(`⚠️  ${migration.name} failed: ${errorText}`);
          
          // Try alternative approach for this specific migration
          if (migration.name.includes('role column')) {
            console.log('🔄 Trying alternative approach for role column...');
            // We'll handle this differently since it might already exist
          }
        }
      } catch (err) {
        console.log(`⚠️  ${migration.name} failed:`, err.message);
      }
    }
    
    // Now let's verify the tables exist by trying to query them
    console.log('\n🔍 Verifying migration results...');
    
    const tables = ['user_wallets', 'deposit_transactions', 'deposit_scan_status', 'withdrawal_requests'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ Table ${table} not accessible:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table} check failed:`, err.message);
      }
    }
    
    // Check if role column was added to app_users
    try {
      const { data: roleCheck, error: roleError } = await supabase
        .from('app_users')
        .select('role')
        .limit(1);
        
      if (roleError) {
        console.log(`❌ Role column not accessible:`, roleError.message);
      } else {
        console.log(`✅ Role column exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ Role column check failed:`, err.message);
    }
    
    console.log('\n🎉 Migration verification completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If tables were created successfully, regenerate Supabase types');
    console.log('2. Run TypeScript build to check for remaining errors');
    console.log('3. Test the wallet endpoints');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

executeMigration();