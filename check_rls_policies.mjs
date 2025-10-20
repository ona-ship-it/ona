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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  try {
    console.log('=== Checking RLS Policies for giveaways table ===\n');
    
    // Check if RLS is enabled on the giveaways table
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'giveaways' })
      .single();
    
    if (tableError) {
      console.log('Could not get table info via RPC, trying direct query...');
      
      // Alternative approach - check pg_tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_name', 'giveaways');
      
      if (tablesError) {
        console.log('❌ Could not check table info:', tablesError.message);
      } else {
        console.log('✅ Table exists:', tables.length > 0);
      }
    }
    
    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'giveaways');
    
    if (policiesError) {
      console.log('❌ Could not check RLS policies:', policiesError.message);
      console.log('Error details:', policiesError);
    } else {
      console.log('✅ RLS Policies found:', policies.length);
      if (policies.length > 0) {
        policies.forEach(policy => {
          console.log(`  - Policy: ${policy.policyname}`);
          console.log(`    Command: ${policy.cmd}`);
          console.log(`    Roles: ${policy.roles}`);
          console.log(`    Expression: ${policy.qual}`);
          console.log('');
        });
      } else {
        console.log('  No RLS policies found for giveaways table');
      }
    }
    
    // Try to create a public read policy
    console.log('=== Creating public read policy ===');
    const { data: createPolicy, error: createError } = await supabase.rpc('create_policy_sql', {
      sql: `
        CREATE POLICY "Public read access for giveaways" ON giveaways
        FOR SELECT USING (true);
      `
    });
    
    if (createError) {
      console.log('❌ Could not create policy via RPC, trying direct SQL...');
      
      // Try direct SQL execution
      const { data: sqlResult, error: sqlError } = await supabase
        .rpc('exec_sql', {
          sql: `
            DROP POLICY IF EXISTS "Public read access for giveaways" ON giveaways;
            CREATE POLICY "Public read access for giveaways" ON giveaways
            FOR SELECT USING (true);
          `
        });
      
      if (sqlError) {
        console.log('❌ Could not execute SQL:', sqlError.message);
        console.log('Manual SQL needed:');
        console.log(`
-- Run this SQL in your Supabase SQL editor:
DROP POLICY IF EXISTS "Public read access for giveaways" ON giveaways;
CREATE POLICY "Public read access for giveaways" ON giveaways
FOR SELECT USING (true);
        `);
      } else {
        console.log('✅ Policy created successfully');
      }
    } else {
      console.log('✅ Policy created successfully');
    }
    
  } catch (error) {
    console.error('❌ Check failed with exception:', error);
    console.log('\nManual steps needed:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Policies');
    console.log('3. Find the giveaways table');
    console.log('4. Create a new policy with:');
    console.log('   - Policy name: "Public read access for giveaways"');
    console.log('   - Allowed operation: SELECT');
    console.log('   - Target roles: public');
    console.log('   - USING expression: true');
  }
}

checkRLSPolicies();