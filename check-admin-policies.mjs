import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminPolicies() {
  console.log('=== Checking Admin Policies ===\n');
  
  // Let's try to access the giveaways table directly to understand the current setup
  console.log('1. Checking current giveaways in the database...');
  const { data: giveaways, error: giveawaysError } = await supabase
    .from('giveaways')
    .select('*')
    .limit(5);
  
  if (giveawaysError) {
    console.error('Error accessing giveaways table:', giveawaysError);
    console.log('This might indicate RLS is blocking access or table doesn\'t exist');
  } else {
    console.log(`Found ${giveaways.length} giveaways in the database`);
    if (giveaways.length > 0) {
      console.log('Sample giveaway structure:', Object.keys(giveaways[0]));
    }
  }
  
  console.log('\n2. Checking current tickets in the database...');
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .limit(5);
  
  if (ticketsError) {
    console.error('Error accessing tickets table:', ticketsError);
    console.log('This might indicate RLS is blocking access or table doesn\'t exist');
  } else {
    console.log(`Found ${tickets.length} tickets in the database`);
    if (tickets.length > 0) {
      console.log('Sample ticket structure:', Object.keys(tickets[0]));
    }
  }
  
  console.log('\n3. Testing admin access by trying to create a test giveaway...');
  const testGiveaway = {
    title: 'Test Admin Giveaway',
    description: 'Testing admin access',
    prize_amount: 100,
    ticket_price: 1, // Using correct column name
    ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    photo_url: 'https://example.com/test.jpg', // Using correct column name
    creator_id: '00000000-0000-0000-0000-000000000000', // Test UUID
    status: 'active'
  };
  
  const { data: createResult, error: createError } = await supabase
    .from('giveaways')
    .insert(testGiveaway)
    .select()
    .single();
  
  if (createError) {
    console.error('Error creating test giveaway:', createError);
    console.log('This shows what RLS policies are currently blocking admin access');
  } else {
    console.log('Successfully created test giveaway:', createResult.id);
    
    // Clean up the test giveaway
    const { error: deleteError } = await supabase
      .from('giveaways')
      .delete()
      .eq('id', createResult.id);
    
    if (deleteError) {
      console.error('Error deleting test giveaway:', deleteError);
    } else {
      console.log('Successfully cleaned up test giveaway');
    }
  }
}

checkAdminPolicies().catch(console.error);