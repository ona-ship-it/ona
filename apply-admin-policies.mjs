import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyAdminPolicies() {
  console.log('=== Applying Admin Bypass Policies ===\n');
  
  try {
    // Read the SQL file
    const sqlContent = readFileSync('add-admin-bypass-policies.sql', 'utf8');
    
    // Split the SQL into individual statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.toLowerCase().includes('create policy')) {
        const policyName = statement.match(/CREATE POLICY[^"]*"([^"]+)"/i)?.[1] || 'unknown';
        console.log(`${i + 1}. Creating policy: ${policyName}`);
        
        try {
          // For policies, we need to use a different approach since Supabase client doesn't support raw SQL
          // Let's try using the REST API directly
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (response.ok) {
            console.log(`   ✅ Policy created successfully`);
          } else {
            const error = await response.text();
            console.log(`   ❌ Error: ${error}`);
          }
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      } else if (statement.toLowerCase().includes('select')) {
        console.log(`${i + 1}. Running verification query...`);
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`   ✅ Query executed successfully`);
            console.log(`   Result:`, JSON.stringify(result, null, 2));
          } else {
            const error = await response.text();
            console.log(`   ❌ Error: ${error}`);
          }
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
      
      console.log(''); // Add spacing
    }
    
    console.log('=== Policy Application Complete ===');
    
  } catch (error) {
    console.error('Error reading SQL file:', error);
  }
}

// Alternative approach: Apply policies one by one with manual SQL
async function applyPoliciesManually() {
  console.log('\n=== Applying Policies Manually ===\n');
  
  const policies = [
    {
      name: 'giveaways_admin_bypass',
      table: 'onagui.giveaways',
      sql: `
        CREATE POLICY IF NOT EXISTS "giveaways_admin_bypass" ON onagui.giveaways
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM onagui.user_roles ur
              JOIN onagui.roles r ON ur.role_id = r.id
              WHERE ur.user_id = auth.uid() AND r.name = 'admin'
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM onagui.user_roles ur
              JOIN onagui.roles r ON ur.role_id = r.id
              WHERE ur.user_id = auth.uid() AND r.name = 'admin'
            )
          );
      `
    },
    {
      name: 'admins_full_access_tickets',
      table: 'onagui.tickets',
      sql: `
        CREATE POLICY IF NOT EXISTS "admins_full_access_tickets" ON onagui.tickets
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM onagui.user_roles ur
              JOIN onagui.roles r ON ur.role_id = r.id
              WHERE ur.user_id = auth.uid() AND r.name = 'admin'
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM onagui.user_roles ur
              JOIN onagui.roles r ON ur.role_id = r.id
              WHERE ur.user_id = auth.uid() AND r.name = 'admin'
            )
          );
      `
    }
  ];
  
  for (const policy of policies) {
    console.log(`Creating policy: ${policy.name} on ${policy.table}`);
    
    try {
      // Since exec_sql might not exist, let's try a different approach
      // We'll use the Supabase client to test if we can access the tables first
      console.log('   Testing table access...');
      
      const tableName = policy.table.split('.')[1]; // Extract table name without schema
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Cannot access table ${tableName}: ${error.message}`);
      } else {
        console.log(`   ✅ Table ${tableName} is accessible`);
        console.log(`   ⚠️  Policy creation requires direct database access`);
        console.log(`   📝 SQL to run manually:`);
        console.log(`   ${policy.sql.trim()}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Add spacing
  }
}

// Run both approaches
applyAdminPolicies()
  .then(() => applyPoliciesManually())
  .catch(console.error);