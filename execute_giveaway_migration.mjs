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

async function executeGiveawayMigration() {
  console.log('🚀 Starting giveaway winner review migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251101_giveaway_winner_review.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    
    // First, let's check if the columns already exist
    console.log('\n🔍 Checking current database state...');
    
    try {
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'giveaways')
        .eq('table_schema', 'public')
        .in('column_name', ['temp_winner_id', 'winner_id', 'escrow_status', 'status']);
      
      if (columnError) {
        console.log('⚠️  Could not check existing columns:', columnError.message);
      } else {
        const existingColumns = columns?.map(c => c.column_name) || [];
        console.log('📋 Existing columns:', existingColumns);
        
        if (existingColumns.length >= 4) {
          console.log('✅ All required columns already exist! Migration may have been applied already.');
          return;
        }
      }
    } catch (err) {
      console.log('⚠️  Could not check existing columns, proceeding with migration...');
    }

    // Since RPC methods are not available, we'll provide manual instructions
    console.log('\n📋 MANUAL MIGRATION REQUIRED');
    console.log('=' .repeat(50));
    console.log('The migration needs to be applied manually through Supabase SQL Editor.');
    console.log('\n📝 Steps to apply the migration:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the following SQL script:');
    console.log('\n' + '='.repeat(50));
    console.log(migrationSQL);
    console.log('='.repeat(50));
    console.log('\n4. Click "Run" to execute the migration');
    console.log('5. Verify the migration was successful by checking:');
    console.log('   - giveaways table has new columns: temp_winner_id, winner_id, escrow_status, status');
    console.log('   - giveaway_audit table was created');
    console.log('   - New functions were created: pick_giveaway_winner, finalize_giveaway_winner, etc.');

    // Save the SQL to a separate file for easy copying
    const outputPath = path.join(__dirname, 'APPLY_GIVEAWAY_MIGRATION.sql');
    fs.writeFileSync(outputPath, migrationSQL);
    console.log(`\n💾 Migration SQL saved to: ${outputPath}`);
    console.log('You can also copy the SQL from this file.');

  } catch (error) {
    console.error('\n❌ Error reading migration file:');
    console.error(error.message);
    process.exit(1);
  }
}

executeGiveawayMigration();