#!/usr/bin/env node

/**
 * FIX SAMIRA ADMIN ACCESS
 * 
 * This script ensures samiraeddaoudi88@gmail.com has proper admin access
 * by checking and updating the necessary database records.
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Fixing Samira Admin Access...\n');

async function fixSamiraAdminAccess() {
  try {
    // 1. Get Samira's user info
    console.log('1️⃣ Getting Samira\'s user info...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    const samiraUser = users.users.find(user => user.email === 'samiraeddaoudi88@gmail.com');
    
    if (!samiraUser) {
      console.error('❌ Samira user not found');
      return;
    }

    console.log(`   ✅ Found Samira: ${samiraUser.email} (${samiraUser.id})`);

    // 2. Check current RPC function result
    console.log('\n2️⃣ Checking current RPC function result...');
    const { data: currentIsAdmin, error: rpcError } = await supabase
      .rpc('is_admin_user', { user_uuid: samiraUser.id });
    
    console.log(`   Current RPC result: ${currentIsAdmin} (Error: ${rpcError ? rpcError.message : 'none'})`);

    // 3. Check if admin_users table exists and has Samira's record
    console.log('\n3️⃣ Checking admin_users table...');
    const { data: adminUsers, error: adminUsersError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', samiraUser.id);
    
    if (adminUsersError) {
      console.log(`   ❌ Error checking admin_users: ${adminUsersError.message}`);
    } else {
      console.log(`   Found ${adminUsers.length} admin_users records for Samira`);
      if (adminUsers.length > 0) {
        console.log(`   Record:`, adminUsers[0]);
      }
    }

    // 4. If no admin record exists, create one
    if (!adminUsersError && adminUsers.length === 0) {
      console.log('\n4️⃣ Creating admin_users record for Samira...');
      const { data: insertResult, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: samiraUser.id,
          email: samiraUser.email,
          is_admin: true,
          admin_level: 'super',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.log(`   ❌ Error creating admin record: ${insertError.message}`);
      } else {
        console.log(`   ✅ Created admin record:`, insertResult[0]);
      }
    }

    // 5. Test RPC function again
    console.log('\n5️⃣ Testing RPC function again...');
    const { data: newIsAdmin, error: newRpcError } = await supabase
      .rpc('is_admin_user', { user_uuid: samiraUser.id });
    
    console.log(`   New RPC result: ${newIsAdmin} (Error: ${newRpcError ? newRpcError.message : 'none'})`);

    // 6. Update user metadata to ensure consistency
    console.log('\n6️⃣ Updating user metadata...');
    const { data: updateResult, error: updateError } = await supabase.auth.admin.updateUserById(
      samiraUser.id,
      {
        user_metadata: {
          ...samiraUser.user_metadata,
          is_admin: true,
          admin_level: 'super',
          role: 'admin'
        }
      }
    );

    if (updateError) {
      console.log(`   ❌ Error updating metadata: ${updateError.message}`);
    } else {
      console.log(`   ✅ Updated user metadata successfully`);
    }

    // 7. Final verification
    console.log('\n7️⃣ Final verification...');
    const { data: finalIsAdmin, error: finalRpcError } = await supabase
      .rpc('is_admin_user', { user_uuid: samiraUser.id });
    
    console.log(`   Final RPC result: ${finalIsAdmin} (Error: ${finalRpcError ? finalRpcError.message : 'none'})`);

    if (finalIsAdmin === true) {
      console.log('\n🎉 SUCCESS: Samira now has admin access!');
    } else {
      console.log('\n⚠️  WARNING: Samira still doesn\'t have admin access via RPC, but emergency whitelist should work');
    }

  } catch (error) {
    console.error('💥 Critical error:', error);
  }
}

// Run the fix
fixSamiraAdminAccess().then(() => {
  console.log('\n🎯 Fix completed!');
}).catch(error => {
  console.error('💥 Fix failed:', error);
  process.exit(1);
});