#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Admin emails to ensure have proper admin status
const ADMIN_EMAILS = [
  'richtheocrypto@gmail.com',
  'samiraeddaoudi88@gmail.com'
];

async function updateAdminUsers() {
  try {
    console.log('🔧 Starting admin user update process...');

    // 1. Find admin users in auth.users
    console.log('\n1️⃣ Finding admin users in auth.users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const adminUsers = users.users.filter(user => 
      ADMIN_EMAILS.includes(user.email?.toLowerCase())
    );

    if (adminUsers.length === 0) {
      console.log('   ⚠️ No admin users found in auth.users');
      return;
    }

    console.log(`   Found ${adminUsers.length} admin users in auth.users:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });

    // 2. Use the existing is_admin_user function to verify admin status
    console.log('\n2️⃣ Checking current admin status...');
    for (const user of adminUsers) {
      const { data: isAdmin, error: adminCheckError } = await supabase
        .rpc('is_admin_user', { user_id: user.id });

      if (adminCheckError) {
        console.log(`   ⚠️ Could not check admin status for ${user.email}: ${adminCheckError.message}`);
      } else {
        console.log(`   ${user.email}: ${isAdmin ? '✅ Already admin' : '❌ Not admin'}`);
      }
    }

    // 3. Update user metadata to mark as admin
    console.log('\n3️⃣ Updating user metadata...');
    for (const user of adminUsers) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            is_admin: true,
            admin_level: 'super',
            role: 'admin'
          }
        }
      );

      if (updateError) {
        console.log(`   ❌ Failed to update metadata for ${user.email}: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated metadata for ${user.email}`);
      }
    }

    // 4. Verify final admin status
    console.log('\n4️⃣ Verifying final admin status...');
    for (const user of adminUsers) {
      const { data: isAdmin, error: adminCheckError } = await supabase
        .rpc('is_admin_user', { user_id: user.id });

      if (adminCheckError) {
        console.log(`   ⚠️ Could not verify admin status for ${user.email}: ${adminCheckError.message}`);
      } else {
        console.log(`   ${user.email}: ${isAdmin ? '✅ Confirmed admin' : '❌ Still not admin'}`);
      }
    }

    console.log('\n🎉 Admin user update process completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Processed ${adminUsers.length} admin users`);
    console.log('   - Updated user metadata with admin flags');
    console.log('   - Admin status is determined by the is_admin_user() function');
    console.log('   - This function checks multiple sources: roles, profiles, and emergency whitelist');

  } catch (error) {
    console.error('❌ Error updating admin users:', error.message);
    process.exit(1);
  }
}

// Run the update
updateAdminUsers();