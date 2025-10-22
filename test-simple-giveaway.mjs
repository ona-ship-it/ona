import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_USER_ID = 'b5b32b5d-e800-42ae-9d0b-4a77e70c4aa3';

async function testSimpleGiveaway() {
  console.log('🧪 Testing simple giveaway creation...');
  
  try {
    // Create a simple giveaway without wallet dependencies
    const giveawayData = {
      title: 'Test Admin Giveaway',
      description: 'Testing admin giveaway visibility on main page',
      prize_amount: 100,
      ticket_price: 1,
      status: 'active',
      creator_id: ADMIN_USER_ID,
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Creating giveaway with data:', giveawayData);
    
    const { data: giveaway, error: createError } = await supabase
      .from('giveaways')
      .insert(giveawayData)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating giveaway:', createError.message);
      console.log('Full error:', createError);
      return;
    }
    
    console.log('✅ Giveaway created successfully:', giveaway);
    
    // Now test fetching active giveaways (like the main page does)
    console.log('🔍 Testing giveaway visibility on main page...');
    
    const { data: activeGiveaways, error: fetchError } = await supabase
      .from('giveaways')
      .select('*')
      .in('status', ['active'])
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.log('❌ Error fetching active giveaways:', fetchError.message);
      return;
    }
    
    console.log('📋 Active giveaways found:', activeGiveaways.length);
    
    const ourGiveaway = activeGiveaways.find(g => g.id === giveaway.id);
    
    if (ourGiveaway) {
      console.log('✅ SUCCESS: Admin giveaway is visible on main page!');
      console.log('📄 Giveaway details:', {
        id: ourGiveaway.id,
        title: ourGiveaway.title,
        status: ourGiveaway.status,
        creator_id: ourGiveaway.creator_id
      });
    } else {
      console.log('❌ ISSUE: Admin giveaway is NOT visible on main page');
      console.log('🔍 All active giveaways:');
      activeGiveaways.forEach((g, i) => {
        console.log(`  ${i + 1}. ${g.title} (${g.status}) - Creator: ${g.creator_id}`);
      });
    }
    
    // Clean up - delete the test giveaway
    console.log('🧹 Cleaning up test giveaway...');
    const { error: deleteError } = await supabase
      .from('giveaways')
      .delete()
      .eq('id', giveaway.id);
    
    if (deleteError) {
      console.log('⚠️  Could not delete test giveaway:', deleteError.message);
    } else {
      console.log('✅ Test giveaway cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSimpleGiveaway();