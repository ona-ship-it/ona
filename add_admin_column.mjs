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

async function addAdminColumn() {
  try {
    console.log('Adding is_admin column to onagui_profiles table...')
    
    // Try to add the is_admin column using a direct SQL approach
    // Since we can't use ALTER TABLE directly, we'll try to update a record to see if the column exists
    const { data: testData, error: testError } = await supabase
      .from('onagui_profiles')
      .select('id')
      .limit(1)
      .single()

    if (testError) {
      console.error('Error accessing onagui_profiles:', testError)
      return
    }

    if (testData) {
      // Try to update with is_admin to see if column exists
      const { error: updateError } = await supabase
        .from('onagui_profiles')
        .update({ is_admin: false })
        .eq('id', testData.id)

      if (updateError && updateError.message.includes('column onagui_profiles.is_admin does not exist')) {
        console.log('is_admin column does not exist. Need to add it manually in Supabase dashboard.')
        console.log('\nPlease run this SQL in your Supabase SQL editor:')
        console.log('ALTER TABLE onagui_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;')
        console.log('UPDATE onagui_profiles SET is_admin = TRUE WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);')
        
        // Let's try to make the first user admin using a different approach
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        
        if (!authError && authUsers.users.length > 0) {
          const firstUser = authUsers.users[0]
          console.log(`\nFirst user: ${firstUser.email} (${firstUser.id})`)
          console.log('This user should be made admin manually.')
        }
      } else if (updateError) {
        console.error('Error testing is_admin column:', updateError)
      } else {
        console.log('✅ is_admin column already exists!')
        
        // Check if there are any admin users
        const { data: adminCheck, error: adminError } = await supabase
          .from('onagui_profiles')
          .select('*')
          .eq('is_admin', true)

        if (adminError) {
          console.error('Error checking admin users:', adminError)
        } else if (adminCheck.length === 0) {
          // Make the first user admin
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
          
          if (!authError && authUsers.users.length > 0) {
            const firstUser = authUsers.users[0]
            console.log(`Making ${firstUser.email} an admin...`)
            
            const { error: makeAdminError } = await supabase
              .from('onagui_profiles')
              .update({ is_admin: true })
              .eq('id', firstUser.id)

            if (makeAdminError) {
              console.error('Error making user admin:', makeAdminError)
            } else {
              console.log(`✅ ${firstUser.email} is now an admin`)
            }
          }
        } else {
          console.log(`✅ Found ${adminCheck.length} admin user(s)`)
        }
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addAdminColumn()