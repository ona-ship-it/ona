import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Function to check admin status (mimicking the app's logic)
async function checkAdminStatus(userId) {
  try {
    // Get user from auth.users
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('Error fetching user:', error);
      return false;
    }

    if (!user) {
      console.log('User not found');
      return false;
    }

    // Check user metadata for admin status
    const isAdmin = user.user_metadata?.is_admin === true || 
                   user.user_metadata?.admin_role === 'admin';
    
    return {
      isAdmin,
      metadata: user.user_metadata,
      email: user.email
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing admin recognition for richtheocrypto@gmail.com...\n');
  
  const userId = 'b5b32b5d-e800-42ae-9d0b-4a77e70c4aa3';
  const email = 'richtheocrypto@gmail.com';
  
  console.log(`User ID: ${userId}`);
  console.log(`Email: ${email}\n`);
  
  // Test admin status check
  const adminCheck = await checkAdminStatus(userId);
  
  if (adminCheck === false) {
    console.log('❌ Admin check failed');
    return;
  }
  
  console.log('📋 Admin Status Check Results:');
  console.log(`   Email: ${adminCheck.email}`);
  console.log(`   Is Admin: ${adminCheck.isAdmin ? '✅ YES' : '❌ NO'}`);
  console.log(`   Metadata:`, JSON.stringify(adminCheck.metadata, null, 2));
  
  // Check profile in onagui_profiles
  console.log('\n📋 Profile Check:');
  const { data: profile, error: profileError } = await supabase
    .from('onagui_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.log(`   ❌ Profile error: ${profileError.message}`);
  } else if (profile) {
    console.log(`   ✅ Profile found`);
    console.log(`   Profile data:`, JSON.stringify(profile, null, 2));
  } else {
    console.log(`   ⚠️  No profile found`);
  }
  
  // Final assessment
  console.log('\n🎯 FINAL ASSESSMENT:');
  if (adminCheck.isAdmin) {
    console.log('✅ richtheocrypto@gmail.com WILL BE RECOGNIZED AS ADMIN');
    console.log('✅ Admin access should work in the application');
  } else {
    console.log('❌ richtheocrypto@gmail.com WILL NOT be recognized as admin');
    console.log('❌ Admin access will be denied');
  }
}

main().catch(console.error);