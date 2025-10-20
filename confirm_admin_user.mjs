import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmAdminUser() {
  const adminEmail = 'richtheocrypto@gmail.com';
  
  console.log('🚀 Confirming admin user:', adminEmail);
  console.log('=' .repeat(50));

  try {
    // 1. Get the user from auth.users
    console.log('1. Getting user from auth.users...');
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    const user = authUsers.users.find(u => u.email === adminEmail);
    if (!user) {
      console.error('❌ User not found in auth.users');
      console.log('💡 Creating a new confirmed admin user...');
      
      // Create a new confirmed user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'admin123',
        email_confirm: true, // This confirms the email immediately
        user_metadata: {
          role: 'admin'
        }
      });

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        return;
      }

      console.log('✅ New confirmed admin user created:', newUser.user.id);
      return;
    }

    console.log('✅ User found:', user.id);
    console.log('   Email confirmed:', user.email_confirmed_at ? '✅ Yes' : '❌ No');

    // 2. If user exists but is not confirmed, confirm them
    if (!user.email_confirmed_at) {
      console.log('\n2. Confirming user email...');
      
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          email_confirm: true
        }
      );

      if (updateError) {
        console.error('❌ Error confirming user:', updateError.message);
        return;
      }

      console.log('✅ User email confirmed successfully');
    } else {
      console.log('✅ User email already confirmed');
    }

    // 3. Ensure user has admin metadata
    console.log('\n3. Setting admin metadata...');
    
    const { data: metadataUser, error: metadataError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'
        }
      }
    );

    if (metadataError) {
      console.error('❌ Error setting metadata:', metadataError.message);
    } else {
      console.log('✅ Admin metadata set');
    }

    // 4. Create/update profile record
    console.log('\n4. Creating/updating profile...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: adminEmail,
        username: adminEmail.split('@')[0],
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.log('⚠️  Profile update failed:', profileError.message);
      console.log('   This might be expected if the profiles table doesn\'t exist yet');
    } else {
      console.log('✅ Profile created/updated:', profile);
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 ADMIN USER CONFIRMATION COMPLETE!');
    console.log('=' .repeat(50));
    console.log('The admin user can now sign in without email confirmation.');
    console.log('Try signing in again with:');
    console.log('  Email:', adminEmail);
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

confirmAdminUser();