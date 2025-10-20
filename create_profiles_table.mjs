import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndCreateProfilesTable() {
  try {
    console.log('Checking existing tables...')
    
    // Check if profiles table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('Could not query information_schema, trying direct approach...')
    } else {
      console.log('Existing tables:', tables.map(t => t.table_name))
    }

    // Try to query profiles table directly
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('Profiles table does not exist. Creating it...')
      
      // Create profiles table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            avatar_url TEXT,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Enable RLS
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

          -- Create policies
          CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
            FOR SELECT USING (true);

          CREATE POLICY "Users can insert their own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);

          CREATE POLICY "Users can update their own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);

          -- Create function to handle new user registration
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO public.profiles (id, email, full_name)
            VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;

          -- Create trigger for new user registration
          DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `
      })

      if (createError) {
        console.error('Error creating profiles table:', createError)
        
        // Try alternative approach using direct SQL
        console.log('Trying alternative SQL execution...')
        const { error: altError } = await supabase
          .from('profiles')
          .insert([]) // This will fail but might give us better error info
        
        console.log('Alternative error:', altError)
      } else {
        console.log('✅ Profiles table created successfully!')
      }
    } else if (profilesError) {
      console.error('Error checking profiles table:', profilesError)
    } else {
      console.log('✅ Profiles table already exists')
      console.log('Sample profiles:', profilesTest)
    }

    // Now check/create admin user
    console.log('\nChecking for admin users...')
    
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return
    }

    console.log(`Found ${authUsers.users.length} auth users`)

    // Check profiles for each user
    for (const user of authUsers.users) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log(`Creating profile for user: ${user.email}`)
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            is_admin: false
          })

        if (insertError) {
          console.error(`Error creating profile for ${user.email}:`, insertError)
        } else {
          console.log(`✅ Profile created for ${user.email}`)
        }
      } else if (profileError) {
        console.error(`Error checking profile for ${user.email}:`, profileError)
      } else {
        console.log(`Profile exists for ${user.email}, is_admin: ${profile.is_admin}`)
      }
    }

    // Make the first user an admin if no admin exists
    const { data: adminCheck, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true)
      .limit(1)

    if (adminError) {
      console.error('Error checking for admin users:', adminError)
    } else if (adminCheck.length === 0 && authUsers.users.length > 0) {
      // Make the first user an admin
      const firstUser = authUsers.users[0]
      console.log(`Making ${firstUser.email} an admin...`)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', firstUser.id)

      if (updateError) {
        console.error('Error making user admin:', updateError)
      } else {
        console.log(`✅ ${firstUser.email} is now an admin`)
      }
    } else {
      console.log(`✅ Admin user(s) already exist: ${adminCheck.length}`)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkAndCreateProfilesTable()