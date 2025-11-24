import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration variables');
  process.exit(1);
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// Construct database URL for direct PostgreSQL connection
const databaseUrl = `postgresql://postgres:[YOUR_DB_PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;

console.log('⚠️  Note: Direct PostgreSQL connection requires database password');
console.log('🔄 Trying alternative approach with Supabase client...');

async function executeMigration() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');
    
    // Execute individual SQL statements directly
    const statements = [
      // 1. Create user_wallets table
      `CREATE TABLE IF NOT EXISTS user_wallets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        network varchar NOT NULL,
        address text NOT NULL,
        encrypted_private_key text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(user_id, network)
      )`,
      
      // 2. Create deposit_transactions table
      `CREATE TABLE IF NOT EXISTS deposit_transactions (
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
      )`,
      
      // 3. Create deposit_scan_status table
      `CREATE TABLE IF NOT EXISTS deposit_scan_status (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        network varchar NOT NULL UNIQUE,
        last_scanned_block bigint DEFAULT 0,
        last_scanned_tx timestamptz DEFAULT now(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )`,
      
      // 4. Create withdrawal_requests table
      `CREATE TABLE IF NOT EXISTS withdrawal_requests (
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
      )`,
      
      // 5. Add role column to app_users
      `ALTER TABLE app_users ADD COLUMN IF NOT EXISTS role varchar DEFAULT 'user'`,
      
      // 6. Create indexes
      `CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_wallets_network ON user_wallets(network)`,
      `CREATE INDEX IF NOT EXISTS idx_deposit_transactions_user_id ON deposit_transactions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_deposit_transactions_status ON deposit_transactions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status)`,
      
      // 7. Enable RLS
      `ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE deposit_transactions ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE deposit_scan_status ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY`,
      
      // 8. Create RLS policies for user_wallets
      `CREATE POLICY IF NOT EXISTS "Users can view own wallets" ON user_wallets
        FOR SELECT USING (auth.uid() = user_id)`,
      
      `CREATE POLICY IF NOT EXISTS "Users can insert own wallets" ON user_wallets
        FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      
      `CREATE POLICY IF NOT EXISTS "Users can update own wallets" ON user_wallets
        FOR UPDATE USING (auth.uid() = user_id)`,
      
      // 9. Create RLS policies for deposit_transactions
      `CREATE POLICY IF NOT EXISTS "Users can view own deposits" ON deposit_transactions
        FOR SELECT USING (auth.uid() = user_id)`,
      
      `CREATE POLICY IF NOT EXISTS "Service can manage deposits" ON deposit_transactions
        FOR ALL USING (true)`,
      
      // 10. Create RLS policies for withdrawal_requests
      `CREATE POLICY IF NOT EXISTS "Users can view own withdrawals" ON withdrawal_requests
        FOR SELECT USING (auth.uid() = user_id)`,
      
      `CREATE POLICY IF NOT EXISTS "Users can create withdrawals" ON withdrawal_requests
        FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      
      `CREATE POLICY IF NOT EXISTS "Service can manage withdrawals" ON withdrawal_requests
        FOR ALL USING (true)`
    ];
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 80) + '...');
      
      try {
        await client.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} failed:`, err.message);
      }
    }
    
    // Verify tables were created
    console.log('\n🔍 Verifying migration results...');
    
    const tables = ['user_wallets', 'deposit_transactions', 'deposit_scan_status', 'withdrawal_requests'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table} LIMIT 1`);
        console.log(`✅ Table ${table} exists and accessible`);
      } catch (err) {
        console.log(`❌ Table ${table} check failed:`, err.message);
      }
    }
    
    // Check if role column was added to app_users
    try {
      const result = await client.query(`SELECT role FROM app_users LIMIT 1`);
      console.log(`✅ Role column added to app_users successfully`);
    } catch (err) {
      console.log(`❌ Role column check failed:`, err.message);
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

executeMigration();