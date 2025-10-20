import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetAdminPassword() {
  try {
    console.log('🔍 Checking admin users...')
    
    // Get admin users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }
    
    console.log(`📊 Found ${users.users.length} users`)
    
    // Find admin users (richtheocrypto@gmail.com and samiraeddaoudi88@gmail.com)
    const adminEmails = ['richtheocrypto@gmail.com', 'samiraeddaoudi88@gmail.com']
    const adminUsers = users.users.filter(user => adminEmails.includes(user.email))
    
    console.log(`👑 Found ${adminUsers.length} admin users:`)
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`)
    })
    
    // Reset password for each admin user
    const newPassword = 'password123'
    
    for (const user of adminUsers) {
      console.log(`\n🔄 Resetting password for ${user.email}...`)
      
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
        email_confirm: true // Ensure email is confirmed
      })
      
      if (error) {
        console.error(`❌ Error updating ${user.email}:`, error.message)
      } else {
        console.log(`✅ Successfully reset password for ${user.email}`)
        console.log(`   New password: ${newPassword}`)
      }
    }
    
    console.log('\n🎉 Password reset complete!')
    console.log('You can now try signing in with:')
    adminUsers.forEach(user => {
      console.log(`  Email: ${user.email}`)
      console.log(`  Password: ${newPassword}`)
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

resetAdminPassword()