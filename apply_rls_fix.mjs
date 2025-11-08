import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyRLSFix() {
  try {
    console.log('🔧 Applying RLS infinite recursion fix...\n');
    
    // Step 1: Test basic connection
    console.log('1. Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('roles')
      .select('count')
      .limit(0);
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
    } else {
      console.log('✅ Connection successful');
    }
    
    // Step 2: Test the giveaway query directly to identify the exact issue
    console.log('2. Testing giveaway query...');
    const { data: giveaways, error: giveawayError } = await supabase
      .from('giveaways')
      .select('id, title, status, temp_winner_id')
      .eq('status', 'review_pending')
      .limit(5);
    
    if (giveawayError) {
      console.log('❌ Giveaway query error:', giveawayError.message);
      console.log('Error details:', giveawayError);
      
      // Try without status filter
      console.log('3. Trying query without status filter...');
      const { data: allGiveaways, error: allError } = await supabase
        .from('giveaways')
        .select('id, title, temp_winner_id')
        .limit(5);
      
      if (allError) {
        console.log('❌ All giveaways query error:', allError.message);
        console.log('Error details:', allError);
      } else {
        console.log('✅ Query without status works:', allGiveaways?.length || 0, 'records');
        console.log('Sample data:', allGiveaways?.[0]);
      }
    } else {
      console.log('✅ Giveaway query works:', giveaways?.length || 0, 'records');
      console.log('Sample data:', giveaways?.[0]);
    }
    
    // Step 3: Check table structure
    console.log('4. Checking giveaways table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('giveaways')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table structure check failed:', tableError.message);
    } else {
      console.log('✅ Table accessible, columns:', Object.keys(tableInfo?.[0] || {}));
    }
    
    console.log('\n🎯 RLS diagnosis completed!');
    
  } catch (error) {
    console.error('❌ Failed to diagnose RLS issue:', error.message);
    process.exit(1);
  }
}

applyRLSFix();