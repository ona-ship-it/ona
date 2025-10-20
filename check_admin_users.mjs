import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminUsers() {
  try {
    console.log('Checking admin users in auth.users...')
    
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return
    }
    
    console.log(`Found ${authUsers.users.length} users in auth.users:`)
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`)
      console.log('---')
    })
    
    // Check profiles table if it exists
    console.log('\nChecking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.log('Profiles table error (might not exist):', profilesError.message)
    } else {
      console.log(`Found ${profiles.length} profiles:`)
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.id}`)
        console.log(`   Role: ${profile.role || 'No role set'}`)
        console.log(`   Email: ${profile.email || 'No email'}`)
        console.log('---')
      })
    }
    
    // Check onagui.app_users if it exists
    console.log('\nChecking onagui.app_users table...')
    const { data: appUsers, error: appUsersError } = await supabase
      .from('onagui.app_users')
      .select('*')
    
    if (appUsersError) {
      console.log('onagui.app_users table error (might not exist):', appUsersError.message)
    } else {
      console.log(`Found ${appUsers.length} app users:`)
      appUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`)
        console.log(`   Role: ${user.role || 'No role set'}`)
        console.log(`   Email: ${user.email || 'No email'}`)
        console.log('---')
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAdminUsers()