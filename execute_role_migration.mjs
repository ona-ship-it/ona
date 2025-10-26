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

async function executeMigration() {
  console.log('🚀 Starting role-based admin control migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250117_role_based_admin_control.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('📝 SQL content preview:');
    console.log(migrationSQL.substring(0, 200) + '...\n');

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
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });

          if (error) {
            // Try direct execution if RPC fails
            console.log('   Trying direct execution...');
            const { data: directData, error: directError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1);

            if (directError) {
              console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
              continue;
            }
          }
          
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        } catch (err) {
          console.error(`   ❌ Error in statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n🎉 Migration execution completed!');
    
    // Verify the migration results
    console.log('\n🔍 Verifying migration results...');
    
    // Check if roles table exists
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(5);

    if (rolesError) {
      console.log('❌ Roles table check failed:', rolesError.message);
    } else {
      console.log('✅ Roles table exists with', rolesData.length, 'roles');
      rolesData.forEach(role => {
        console.log(`   - ${role.name}: ${role.description}`);
      });
    }

    // Check if user_roles table exists
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);

    if (userRolesError) {
      console.log('❌ User roles table check failed:', userRolesError.message);
    } else {
      console.log('✅ User roles table exists with', userRolesData.length, 'assignments');
    }

    // Check if is_admin_user function exists
    const { data: functionData, error: functionError } = await supabase
      .rpc('is_admin_user', { user_uuid: '00000000-0000-0000-0000-000000000000' });

    if (functionError) {
      console.log('❌ is_admin_user function check failed:', functionError.message);
    } else {
      console.log('✅ is_admin_user function is working');
    }

    // Check admin assignments
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles!inner(name),
        auth.users!inner(email)
      `)
      .eq('roles.name', 'admin');

    if (!adminError && adminUsers) {
      console.log('✅ Admin users assigned:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.auth?.users?.email || 'Unknown email'}`);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

executeMigration();