import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkOnaguiProfiles() {
  try {
    console.log('Checking onagui_profiles table...')
    
    // Check if onagui_profiles table exists and what columns it has
    const { data: profiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .limit(5)

    if (profilesError) {
      console.error('Error checking onagui_profiles table:', profilesError)
      return
    }

    console.log(`✅ Found onagui_profiles table with ${profiles.length} records`)
    if (profiles.length > 0) {
      console.log('Sample profile structure:', Object.keys(profiles[0]))
      console.log('Sample profiles:')
      profiles.forEach(profile => {
        console.log(`- ID: ${profile.id}, Email: ${profile.email || 'N/A'}, Admin: ${profile.is_admin || false}`)
      })
    }

    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return
    }

    console.log(`\nFound ${authUsers.users.length} auth users`)

    // Check if each auth user has a profile
    for (const user of authUsers.users) {
      const { data: existingProfile, error: checkError } = await supabase
        .from('onagui_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log(`Creating profile for user: ${user.email}`)
        const { error: insertError } = await supabase
          .from('onagui_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error(`Error creating profile for ${user.email}:`, insertError)
        } else {
          console.log(`✅ Profile created for ${user.email}`)
        }
      } else if (checkError) {
        console.error(`Error checking profile for ${user.email}:`, checkError)
      } else {
        console.log(`Profile exists for ${user.email}, is_admin: ${existingProfile.is_admin || false}`)
      }
    }

    // Check if there are any admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('is_admin', true)

    if (adminError) {
      console.error('Error checking for admin users:', adminError)
    } else if (adminUsers.length === 0 && authUsers.users.length > 0) {
      // Make the first user an admin
      const firstUser = authUsers.users[0]
      console.log(`\nNo admin users found. Making ${firstUser.email} an admin...`)
      
      const { error: updateError } = await supabase
        .from('onagui_profiles')
        .update({ 
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', firstUser.id)

      if (updateError) {
        console.error('Error making user admin:', updateError)
      } else {
        console.log(`✅ ${firstUser.email} is now an admin`)
      }
    } else {
      console.log(`\n✅ Found ${adminUsers.length} admin user(s):`)
      adminUsers.forEach(admin => {
        console.log(`- ${admin.email || admin.id}`)
      })
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkOnaguiProfiles()