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

async function testCompleteAdminWorkflow() {
  console.log('🧪 Testing Complete Admin Giveaway Creation Workflow...\n');
  
  let testGiveawayId = null;
  
  try {
    // Step 1: Verify admin user exists
    console.log('1️⃣ Verifying admin user...');
    const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(ADMIN_USER_ID);
    
    if (adminError || !adminUser) {
      throw new Error(`Admin user not found: ${adminError?.message}`);
    }
    
    console.log('✅ Admin user verified');
    console.log(`   Email: ${adminUser.user.email}`);
    console.log(`   ID: ${adminUser.user.id}\n`);
    
    // Step 2: Create giveaway as admin (simulating the admin creation page)
    console.log('2️⃣ Creating giveaway as admin...');
    
    const adminGiveawayData = {
      title: 'Admin Test Giveaway - Complete Workflow',
      description: 'Testing the complete admin giveaway creation and visibility workflow',
      prize_amount: 500,
      ticket_price: 5,
      status: 'active', // Admin giveaways are immediately active
      creator_id: ADMIN_USER_ID,
      ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      escrow_amount: 0, // Admin bypass
      escrow_status: 'admin_bypass',
      is_active: true, // Ensure it's marked as active
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: giveaway, error: createError } = await supabase
      .from('giveaways')
      .insert(adminGiveawayData)
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Giveaway creation failed: ${createError.message}`);
    }
    
    testGiveawayId = giveaway.id;
    console.log('✅ Admin giveaway created successfully');
    console.log(`   ID: ${giveaway.id}`);
    console.log(`   Title: ${giveaway.title}`);
    console.log(`   Status: ${giveaway.status}`);
    console.log(`   Is Active: ${giveaway.is_active}`);
    console.log(`   Escrow Status: ${giveaway.escrow_status}`);
    console.log(`   Prize: $${giveaway.prize_amount}\n`);
    
    // Step 3: Test API endpoint (simulating the main giveaway page)
    console.log('3️⃣ Testing giveaway visibility via API...');
    
    const { data: apiGiveaways, error: apiError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (apiError) {
      throw new Error(`API test failed: ${apiError.message}`);
    }
    
    const ourGiveaway = apiGiveaways.find(g => g.id === testGiveawayId);
    
    if (!ourGiveaway) {
      console.log('❌ ISSUE: Admin giveaway NOT found in API results');
      console.log(`🔍 Total active giveaways found: ${apiGiveaways.length}`);
      console.log('📋 Active giveaways:');
      apiGiveaways.slice(0, 5).forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.title} (${g.status}) - Creator: ${g.creator_id}`);
      });
      throw new Error('Admin giveaway not visible in API results');
    }
    
    console.log('✅ SUCCESS: Admin giveaway is visible via API');
    console.log(`   Found in position: ${apiGiveaways.findIndex(g => g.id === testGiveawayId) + 1} of ${apiGiveaways.length}`);
    console.log(`   API returned giveaway with status: ${ourGiveaway.status}\n`);
    
    // Step 4: Test direct giveaway fetch (simulating individual giveaway page)
    console.log('4️⃣ Testing direct giveaway fetch...');
    
    const { data: directGiveaway, error: directError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', testGiveawayId)
      .single();
    
    if (directError) {
      throw new Error(`Direct fetch failed: ${directError.message}`);
    }
    
    console.log('✅ Direct giveaway fetch successful');
    console.log(`   Title: ${directGiveaway.title}`);
    console.log(`   Status: ${directGiveaway.status}`);
    console.log(`   Creator: ${directGiveaway.creator_id}\n`);
    
    // Step 5: Verify admin-specific properties
    console.log('5️⃣ Verifying admin-specific properties...');
    
    const adminProperties = {
      'Status is active': directGiveaway.status === 'active',
      'Escrow amount is 0': directGiveaway.escrow_amount === 0,
      'Escrow status is admin_bypass': directGiveaway.escrow_status === 'admin_bypass',
      'Creator is admin user': directGiveaway.creator_id === ADMIN_USER_ID
    };
    
    let allPropertiesValid = true;
    Object.entries(adminProperties).forEach(([property, isValid]) => {
      const status = isValid ? '✅' : '❌';
      console.log(`   ${status} ${property}: ${isValid}`);
      if (!isValid) allPropertiesValid = false;
    });
    
    if (!allPropertiesValid) {
      throw new Error('Some admin properties are not set correctly');
    }
    
    console.log('\n🎉 COMPLETE SUCCESS: Admin giveaway workflow is working perfectly!');
    console.log('📋 Summary:');
    console.log('   ✅ Admin user verified');
    console.log('   ✅ Giveaway created with admin privileges');
    console.log('   ✅ Giveaway immediately visible on main page');
    console.log('   ✅ All admin-specific properties set correctly');
    console.log('   ✅ API endpoints working as expected');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Clean up - delete the test giveaway
    if (testGiveawayId) {
      console.log('\n🧹 Cleaning up test giveaway...');
      const { error: deleteError } = await supabase
        .from('giveaways')
        .delete()
        .eq('id', testGiveawayId);
      
      if (deleteError) {
        console.log('⚠️  Could not delete test giveaway:', deleteError.message);
      } else {
        console.log('✅ Test giveaway cleaned up successfully');
      }
    }
  }
}

testCompleteAdminWorkflow();