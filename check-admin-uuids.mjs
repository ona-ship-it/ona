import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imnqudqzgbkqtjpkgdxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltbnF1ZHF6Z2JrcXRqcGtnZHhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzI0NzI5NywiZXhwIjoyMDQ4ODIzMjk3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUUIDs() {
    console.log('🔍 Checking Admin UUIDs and Escrow System...\n');

    try {
        // 1. Get all users from auth.users
        console.log('📋 Getting all users from auth.users...');
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.error('❌ Error getting users:', usersError);
            return;
        }

        console.log(`✅ Found ${users.users.length} users:\n`);

        // 2. Check each user and their admin status
        for (const user of users.users) {
            console.log(`👤 User: ${user.email}`);
            console.log(`   UUID: ${user.id}`);
            console.log(`   Admin: ${user.user_metadata?.is_admin || false}`);
            
            // Check if this user is detected as admin by our function
            try {
                const { data: isAdminResult, error: adminError } = await supabase
                    .rpc('is_admin_user', { user_uuid: user.id });
                
                if (adminError) {
                    console.log(`   ⚠️  Admin check error: ${adminError.message}`);
                } else {
                    console.log(`   🔧 Admin function result: ${isAdminResult}`);
                }
            } catch (err) {
                console.log(`   ⚠️  Admin function not accessible: ${err.message}`);
            }

            // Check wallet status
            try {
                const { data: walletData, error: walletError } = await supabase
                    .from('onagui.wallets')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                
                if (walletError && walletError.code !== 'PGRST116') {
                    console.log(`   💰 Wallet error: ${walletError.message}`);
                } else if (walletData) {
                    console.log(`   💰 Wallet balance: $${walletData.balance_fiat || 0}`);
                } else {
                    console.log(`   💰 No wallet found`);
                }
            } catch (err) {
                console.log(`   💰 Wallet check failed: ${err.message}`);
            }
            
            console.log('');
        }

        // 3. Check giveaways table structure
        console.log('📊 Checking giveaways table structure...');
        const { data: giveaways, error: giveawaysError } = await supabase
            .from('giveaways')
            .select('*')
            .limit(1);

        if (giveawaysError) {
            console.error('❌ Error accessing giveaways:', giveawaysError);
        } else {
            console.log('✅ Giveaways table accessible');
            if (giveaways.length > 0) {
                const columns = Object.keys(giveaways[0]);
                console.log('📋 Available columns:', columns.join(', '));
                
                // Check for escrow columns
                const hasEscrowStatus = columns.includes('escrow_status');
                const hasEscrowAmount = columns.includes('escrow_amount');
                
                console.log(`   🔒 escrow_status: ${hasEscrowStatus ? '✅' : '❌'}`);
                console.log(`   💰 escrow_amount: ${hasEscrowAmount ? '✅' : '❌'}`);
            }
        }

        // 4. Test public wrapper functions
        console.log('\n🔧 Testing public wrapper functions...');
        
        const testFunctions = [
            'ensure_user_wallet',
            'is_admin_user', 
            'add_funds_to_wallet_fiat',
            'deduct_funds_from_wallet_fiat',
            'add_funds_to_wallet_tickets',
            'deduct_funds_from_wallet_tickets',
            'add_funds_to_wallet'
        ];

        for (const funcName of testFunctions) {
            try {
                // Just check if function exists by calling with dummy data
                const { error } = await supabase.rpc(funcName, {});
                
                if (error && error.message.includes('function') && error.message.includes('does not exist')) {
                    console.log(`   ❌ ${funcName}: Not found`);
                } else {
                    console.log(`   ✅ ${funcName}: Available`);
                }
            } catch (err) {
                console.log(`   ✅ ${funcName}: Available (parameter error expected)`);
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkAdminUUIDs();