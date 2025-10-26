#!/usr/bin/env node

/**
 * DEBUG ADMIN REDIRECTION ISSUE
 * 
 * This script tests the admin authentication flow to identify
 * why admin redirection is failing.
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

console.log('🔍 Starting Admin Redirection Debug...\n');

async function debugAdminRedirection() {
  try {
    // 1. Check admin users
    console.log('1️⃣ Checking admin users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    const adminEmails = ['richtheocrypto@gmail.com', 'samiraeddaoudi88@gmail.com'];
    const adminUsers = users.users.filter(user => adminEmails.includes(user.email));
    
    console.log(`   Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.id})`);
      console.log(`     Metadata:`, JSON.stringify(user.user_metadata, null, 2));
      console.log(`     App Metadata:`, JSON.stringify(user.app_metadata, null, 2));
    });

    // 2. Test RPC function
    console.log('\n2️⃣ Testing is_admin_user RPC function...');
    for (const user of adminUsers) {
      try {
        const { data: isAdmin, error: rpcError } = await supabase
          .rpc('is_admin_user', { user_uuid: user.id });
        
        if (rpcError) {
          console.log(`   ❌ RPC Error for ${user.email}:`, rpcError);
        } else {
          console.log(`   ${isAdmin ? '✅' : '❌'} ${user.email}: ${isAdmin}`);
        }
      } catch (exception) {
        console.log(`   💥 RPC Exception for ${user.email}:`, exception.message);
      }
    }

    // 3. Check profiles table
    console.log('\n3️⃣ Checking onagui_profiles table...');
    for (const user of adminUsers) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('onagui_profiles')
          .select('id, onagui_type, is_admin')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.log(`   ❌ Profile Error for ${user.email}:`, profileError);
        } else {
          console.log(`   ${profile ? '✅' : '❌'} ${user.email}:`, profile);
        }
      } catch (exception) {
        console.log(`   💥 Profile Exception for ${user.email}:`, exception.message);
      }
    }

    // 4. Check user roles
    console.log('\n4️⃣ Checking user roles...');
    for (const user of adminUsers) {
      try {
        const { data: userRoles, error: roleError } = await supabase
          .from('onagui.user_roles')
          .select(`
            user_id,
            roles:onagui.roles(name)
          `)
          .eq('user_id', user.id);
        
        if (roleError) {
          console.log(`   ❌ Role Error for ${user.email}:`, roleError);
        } else {
          console.log(`   ${userRoles?.length ? '✅' : '❌'} ${user.email}:`, userRoles);
        }
      } catch (exception) {
        console.log(`   💥 Role Exception for ${user.email}:`, exception.message);
      }
    }

    // 5. Test emergency whitelist
    console.log('\n5️⃣ Testing emergency whitelist...');
    const emergencyEmails = [
      process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      'richtheocrypto@gmail.com'
    ].filter(Boolean);
    
    console.log(`   Emergency emails: ${emergencyEmails.join(', ')}`);
    
    for (const user of adminUsers) {
      const isInWhitelist = emergencyEmails.includes(user.email);
      console.log(`   ${isInWhitelist ? '✅' : '❌'} ${user.email}: ${isInWhitelist ? 'In whitelist' : 'Not in whitelist'}`);
    }

    // 6. Check environment variables
    console.log('\n6️⃣ Checking environment variables...');
    console.log(`   NEXT_PUBLIC_ADMIN_EMAIL: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'NOT SET'}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET'}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`);

  } catch (error) {
    console.error('💥 Critical error:', error);
  }
}

// Run the debug
debugAdminRedirection().then(() => {
  console.log('\n🎯 Debug completed!');
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});