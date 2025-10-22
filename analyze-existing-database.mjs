import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeExistingDatabase() {
  console.log('🔍 Analyzing Existing Database Structure\n');
  
  try {
    // 1. Check existing tables
    console.log('1. Checking existing tables...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_type', 'BASE TABLE')
        .in('table_schema', ['public', 'onagui']);
      
      if (tablesError) {
        console.log(`   ❌ Error getting tables: ${tablesError.message}`);
      } else {
        console.log('   ✅ Existing tables:');
        tables.forEach(table => {
          console.log(`      - ${table.table_schema}.${table.table_name}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // 2. Check giveaways table structure
    console.log('\n2. Analyzing giveaways table structure...');
    try {
      const { data: giveaways, error: giveawaysError } = await supabase
        .from('giveaways')
        .select('*')
        .limit(1);
      
      if (giveawaysError) {
        console.log(`   ❌ Error: ${giveawaysError.message}`);
      } else {
        console.log('   ✅ Giveaways table exists');
        if (giveaways.length > 0) {
          console.log('   📊 Existing columns:');
          Object.keys(giveaways[0]).forEach(col => {
            console.log(`      - ${col}`);
          });
        }
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // 3. Check profiles table structure
    console.log('\n3. Analyzing profiles table structure...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.log(`   ❌ Error: ${profilesError.message}`);
      } else {
        console.log('   ✅ Profiles table exists');
        if (profiles.length > 0) {
          console.log('   📊 Existing columns:');
          Object.keys(profiles[0]).forEach(col => {
            console.log(`      - ${col}`);
          });
        }
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // 4. Check for existing schemas
    console.log('\n4. Checking existing schemas...');
    try {
      const { data: schemas, error: schemasError } = await supabase
        .from('information_schema.schemata')
        .select('schema_name')
        .not('schema_name', 'like', 'pg_%')
        .not('schema_name', 'eq', 'information_schema');
      
      if (schemasError) {
        console.log(`   ❌ Error: ${schemasError.message}`);
      } else {
        console.log('   ✅ Existing schemas:');
        schemas.forEach(schema => {
          console.log(`      - ${schema.schema_name}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // 5. Check existing functions
    console.log('\n5. Checking existing functions...');
    try {
      const { data: functions, error: functionsError } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_schema, routine_type')
        .eq('routine_type', 'FUNCTION')
        .in('routine_schema', ['public', 'onagui']);
      
      if (functionsError) {
        console.log(`   ❌ Error: ${functionsError.message}`);
      } else {
        console.log('   ✅ Existing functions:');
        functions.forEach(func => {
          console.log(`      - ${func.routine_schema}.${func.routine_name}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // 6. Check RLS policies
    console.log('\n6. Checking RLS policies...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('policyname, tablename, schemaname');
      
      if (policiesError) {
        console.log(`   ❌ Error: ${policiesError.message}`);
      } else {
        console.log('   ✅ Existing RLS policies:');
        policies.forEach(policy => {
          console.log(`      - ${policy.schemaname}.${policy.tablename}: ${policy.policyname}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    // 7. Check column details for giveaways
    console.log('\n7. Getting detailed giveaways column information...');
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'giveaways')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.log(`   ❌ Error: ${columnsError.message}`);
      } else {
        console.log('   ✅ Giveaways table column details:');
        columns.forEach(col => {
          console.log(`      - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    console.log('\n🏁 Database analysis complete!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  }
}

analyzeExistingDatabase();