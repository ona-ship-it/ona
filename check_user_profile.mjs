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

async function checkUserProfiles() {
  try {
    console.log('🔍 Checking onagui_profiles table...')
    
    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('onagui_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }

    console.log(`✅ Found ${profiles.length} profiles:`)
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile:`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Email: ${profile.email || 'N/A'}`)
      console.log(`   Username: ${profile.username || 'N/A'}`)
      console.log(`   Display Name: ${profile.display_name || 'N/A'}`)
      console.log(`   Avatar: ${profile.avatar_url || 'N/A'}`)
      console.log(`   Created: ${profile.created_at}`)
      console.log(`   Updated: ${profile.updated_at}`)
    })

    // Check auth.users table for comparison
    console.log('\n🔍 Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log(`✅ Found ${authUsers.users.length} auth users:`)
    authUsers.users.slice(0, 3).forEach((user, index) => {
      console.log(`\n${index + 1}. Auth User:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Provider: ${user.app_metadata?.provider || 'N/A'}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`)
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkUserProfiles()