import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingTables() {
  console.log('🔍 Checking Existing Tables and Structures\n');
  
  const tablesToCheck = [
    'giveaways',
    'profiles', 
    'wallets',
    'users',
    'auth.users'
  ];
  
  for (const tableName of tablesToCheck) {
    console.log(`\n📋 Checking table: ${tableName}`);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Table exists`);
        if (data && data.length > 0) {
          console.log('   📊 Columns:');
          Object.keys(data[0]).forEach(col => {
            console.log(`      - ${col}: ${typeof data[0][col]} (${data[0][col] === null ? 'null' : 'has value'})`);
          });
        } else {
          console.log('   📊 Table is empty, trying to get structure...');
          // Try to insert and rollback to see structure
          try {
            const { error: insertError } = await supabase
              .from(tableName)
              .insert({});
            if (insertError) {
              console.log(`   📝 Insert error reveals structure: ${insertError.message}`);
            }
          } catch (e) {
            console.log(`   📝 Structure check failed: ${e.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
  }
  
  // Check if we can access auth.users
  console.log('\n🔐 Checking auth.users access...');
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log(`   ❌ Auth users error: ${authError.message}`);
    } else {
      console.log(`   ✅ Auth users accessible, found ${authUsers.users.length} users`);
      if (authUsers.users.length > 0) {
        console.log('   📊 Auth user structure:');
        const user = authUsers.users[0];
        console.log(`      - id: ${user.id}`);
        console.log(`      - email: ${user.email}`);
        console.log(`      - user_metadata: ${JSON.stringify(Object.keys(user.user_metadata || {}))}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
  }
  
  console.log('\n🏁 Table check complete!');
}

checkExistingTables();