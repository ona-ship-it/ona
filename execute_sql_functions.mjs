import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeSQLFunctions() {
  try {
    console.log('🚀 Starting SQL functions creation...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create_missing_sql_functions.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual function creation statements
    const functionStatements = sqlContent
      .split('CREATE OR REPLACE FUNCTION')
      .filter(stmt => stmt.trim().length > 0)
      .map((stmt, index) => {
        if (index === 0) return stmt; // First part might not start with CREATE
        return 'CREATE OR REPLACE FUNCTION' + stmt;
      })
      .filter(stmt => stmt.includes('FUNCTION'));

    console.log(`📝 Found ${functionStatements.length} function definitions`);
    
    // Execute each function creation
    for (let i = 0; i < functionStatements.length; i++) {
      const statement = functionStatements[i].trim();
      if (!statement) continue;
      
      console.log(`\n⚡ Creating function ${i + 1}/${functionStatements.length}...`);
      
      try {
        // Try to execute using raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (response.ok) {
          console.log(`   ✅ Function created successfully`);
        } else {
          const errorText = await response.text();
          console.log(`   ⚠️ Response not OK: ${response.status}`);
          console.log(`   Error: ${errorText}`);
        }
      } catch (err) {
        console.log(`   ⚠️ Error creating function: ${err.message}`);
      }
    }

    console.log('\n🎉 SQL functions creation completed!');
    
    // Test the get_user_balance function
    console.log('\n🔍 Testing get_user_balance function...');
    try {
      const { data, error } = await supabase.rpc('get_user_balance', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        p_currency: 'USDT'
      });
      
      if (error) {
        console.log('❌ Function test failed:', error.message);
      } else {
        console.log('✅ get_user_balance function is working! Test result:', data);
      }
    } catch (err) {
      console.log('❌ Function test error:', err.message);
    }

  } catch (error) {
    console.error('❌ Failed to execute SQL functions:', error.message);
    process.exit(1);
  }
}

executeSQLFunctions();