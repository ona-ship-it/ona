import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGiveawaysTable() {
  try {
    console.log('Checking giveaways table structure...');
    
    // Try to query the giveaways table
    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error querying giveaways table:', error.message);
      
      // Check if table exists by trying to get table info
      console.log('\nChecking if giveaways table exists...');
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'giveaways' });
      
      if (tableError) {
        console.log('Table does not exist or cannot be accessed');
      }
    } else {
      console.log('✅ Giveaways table exists!');
      console.log(`Found ${data.length} giveaways in the table:`);
      
      if (data.length > 0) {
        console.log('\nGiveaway records:');
        data.forEach((giveaway, index) => {
          console.log(`${index + 1}. ${giveaway.title || 'Untitled'}`);
          console.log(`   ID: ${giveaway.id}`);
          console.log(`   Description: ${giveaway.description || 'No description'}`);
          console.log(`   Prize Amount: $${giveaway.prize_amount || 0}`);
          console.log(`   Status: ${giveaway.status || 'Unknown'}`);
          console.log(`   Created: ${giveaway.created_at || 'Unknown'}`);
          console.log('');
        });
      } else {
        console.log('No giveaways found in the table.');
      }
    }

    // Also check for any tables that might contain giveaway data
    console.log('\nChecking for other potential giveaway-related tables...');
    const { data: allTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%giveaway%');

    if (!tablesError && allTables) {
      console.log('Found giveaway-related tables:', allTables.map(t => t.table_name));
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkGiveawaysTable();