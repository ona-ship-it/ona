import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGiveawayQuery() {
  console.log('🔍 Testing giveaway query...\n');

  try {
    // First, let's check the table structure
    console.log('1. Checking giveaways table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('giveaways')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error checking table structure:', tableError);
      return;
    }

    console.log('✅ Table accessible, sample structure:', 
      tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : 'No data');

    // Test the exact query from the review page
    console.log('\n2. Testing the exact query from review page...');
    const { data, error } = await supabase
      .from('giveaways')
      .select('id, title, temp_winner_id, winner_id, status, prize_amount, ends_at')
      .eq('status', 'review_pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Query error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Query successful!');
      console.log('📊 Results:', data?.length || 0, 'giveaways found');
      if (data && data.length > 0) {
        console.log('Sample data:', JSON.stringify(data[0], null, 2));
      }
    }

    // Test a simpler query to isolate the issue
    console.log('\n3. Testing simpler query without status filter...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('giveaways')
      .select('id, title, status')
      .limit(5);

    if (simpleError) {
      console.error('❌ Simple query error:', simpleError);
    } else {
      console.log('✅ Simple query successful!');
      console.log('Available statuses:', simpleData?.map(g => g.status).filter((v, i, a) => a.indexOf(v) === i));
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testGiveawayQuery();