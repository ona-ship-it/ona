import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_USER_ID = 'b5b32b5d-e800-42ae-9d0b-4a77e70c4aa3';

async function createAdminWallet() {
  console.log('🚀 Creating admin wallet...');
  
  try {
    // First, check if onagui.wallets table exists
    const { data: walletCheck, error: walletError } = await supabase
      .from('onagui.wallets')
      .select('*')
      .limit(1);
    
    if (walletError) {
      console.log('⚠️  onagui.wallets table does not exist, trying to create it...');
      
      // Try to create the wallet record in a different way
      // First check if we can access any wallet-related functions
      const { data: funcData, error: funcError } = await supabase
        .rpc('onagui.ensure_user_wallet', { user_uuid: ADMIN_USER_ID });
      
      if (funcError) {
        console.log('❌ onagui.ensure_user_wallet function not available:', funcError.message);
        
        // Try to create wallet manually in public schema
        console.log('🔧 Attempting to create wallet in public schema...');
        
        const { data: publicWallet, error: publicError } = await supabase
          .from('wallets')
          .upsert({
            user_id: ADMIN_USER_ID,
            balance_fiat: 10000.00, // Give admin $10,000 starting balance
            balance_tickets: 1000,   // Give admin 1000 tickets
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (publicError) {
          console.log('❌ Could not create wallet in public schema:', publicError.message);
          
          // Last resort: try to create the table first
          console.log('🔧 Attempting to create wallets table...');
          
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS public.wallets (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              balance_fiat NUMERIC(15,2) DEFAULT 0.00,
              balance_tickets INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id)
            );
          `;
          
          const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
          
          if (createError) {
            console.log('❌ Could not create wallets table:', createError.message);
            console.log('📋 Please run this SQL manually in Supabase SQL editor:');
            console.log(createTableSQL);
            console.log('\nThen run this script again.');
            return;
          }
          
          // Try creating wallet again
          const { data: retryWallet, error: retryError } = await supabase
            .from('wallets')
            .upsert({
              user_id: ADMIN_USER_ID,
              balance_fiat: 10000.00,
              balance_tickets: 1000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
          
          if (retryError) {
            console.log('❌ Still could not create wallet:', retryError.message);
            return;
          }
          
          console.log('✅ Admin wallet created successfully:', retryWallet);
        } else {
          console.log('✅ Admin wallet created in public schema:', publicWallet);
        }
      } else {
        console.log('✅ Admin wallet created via onagui function:', funcData);
      }
    } else {
      console.log('✅ onagui.wallets table exists, checking for admin wallet...');
      
      const { data: existingWallet, error: checkError } = await supabase
        .from('onagui.wallets')
        .select('*')
        .eq('user_id', ADMIN_USER_ID)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.log('❌ Error checking for existing wallet:', checkError.message);
        return;
      }
      
      if (existingWallet) {
        console.log('✅ Admin wallet already exists:', existingWallet);
      } else {
        // Create wallet in onagui schema
        const { data: newWallet, error: createError } = await supabase
          .from('onagui.wallets')
          .insert({
            user_id: ADMIN_USER_ID,
            balance_fiat: 10000.00,
            balance_tickets: 1000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (createError) {
          console.log('❌ Could not create wallet in onagui schema:', createError.message);
          return;
        }
        
        console.log('✅ Admin wallet created in onagui schema:', newWallet);
      }
    }
    
    console.log('🎉 Admin wallet setup complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createAdminWallet();