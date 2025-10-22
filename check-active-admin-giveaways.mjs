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

async function checkActiveAdminGiveaways() {
  console.log('🔍 Checking for active admin giveaways...\n');
  
  try {
    // Get all active giveaways created by admin
    const { data: adminGiveaways, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('creator_id', ADMIN_USER_ID)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
    
    console.log(`📊 Found ${adminGiveaways.length} active admin giveaway(s)\n`);
    
    if (adminGiveaways.length === 0) {
      console.log('✅ No active admin giveaways found');
      console.log('💡 You can create a new giveaway through the admin panel');
    } else {
      console.log('🎯 Active Admin Giveaways:');
      console.log('=' .repeat(60));
      
      adminGiveaways.forEach((giveaway, index) => {
        console.log(`\n${index + 1}. ${giveaway.title}`);
        console.log(`   ID: ${giveaway.id}`);
        console.log(`   Prize: $${giveaway.prize_amount}`);
        console.log(`   Ticket Price: $${giveaway.ticket_price}`);
        console.log(`   Status: ${giveaway.status}`);
        console.log(`   Escrow Status: ${giveaway.escrow_status}`);
        console.log(`   Created: ${new Date(giveaway.created_at).toLocaleDateString()}`);
        console.log(`   Ends: ${new Date(giveaway.ends_at).toLocaleDateString()}`);
        console.log(`   Is Active: ${giveaway.is_active}`);
      });
    }
    
    // Also check all giveaways by admin (including non-active)
    console.log('\n' + '='.repeat(60));
    console.log('📋 All Admin Giveaways (any status):');
    
    const { data: allAdminGiveaways, error: allError } = await supabase
      .from('giveaways')
      .select('id, title, status, created_at')
      .eq('creator_id', ADMIN_USER_ID)
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.log('⚠️  Could not fetch all admin giveaways:', allError.message);
    } else {
      console.log(`\nTotal admin giveaways: ${allAdminGiveaways.length}`);
      
      const statusCounts = allAdminGiveaways.reduce((acc, g) => {
        acc[g.status] = (acc[g.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
      if (allAdminGiveaways.length > 0) {
        console.log('\nRecent giveaways:');
        allAdminGiveaways.slice(0, 5).forEach((g, i) => {
          console.log(`   ${i + 1}. ${g.title} (${g.status}) - ${new Date(g.created_at).toLocaleDateString()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking admin giveaways:', error.message);
  }
}

checkActiveAdminGiveaways();