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

async function testOnaguiIntegration() {
    console.log('🧪 Testing ONAGUI Schema Integration...\n');

    try {
        // Test 1: Check if onagui schema functions are accessible
        console.log('1️⃣ Testing onagui schema function access...');
        
        const onaguiFunctions = [
            'ensure_user_wallet',
            'is_admin_user',
            'add_funds_to_wallet_fiat',
            'deduct_funds_from_wallet_fiat',
            'add_funds_to_wallet_tickets',
            'deduct_funds_from_wallet_tickets'
        ];

        for (const funcName of onaguiFunctions) {
            try {
                // Try to call the function with dummy parameters to see if it exists
                const { error } = await supabase.rpc(`onagui.${funcName}`, {});
                if (error && !error.message.includes('wrong number of arguments')) {
                    console.log(`   ❌ onagui.${funcName}: ${error.message}`);
                } else {
                    console.log(`   ✅ onagui.${funcName}: Accessible`);
                }
            } catch (err) {
                console.log(`   ❌ onagui.${funcName}: ${err.message}`);
            }
        }

        // Test 2: Check if onagui.wallets table exists
        console.log('\n2️⃣ Testing onagui.wallets table access...');
        try {
            const { data, error } = await supabase
                .from('onagui.wallets')
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`   ❌ onagui.wallets: ${error.message}`);
            } else {
                console.log(`   ✅ onagui.wallets: Accessible (${data?.length || 0} records found)`);
            }
        } catch (err) {
            console.log(`   ❌ onagui.wallets: ${err.message}`);
        }

        // Test 3: Check if public wrapper functions would work
        console.log('\n3️⃣ Testing public wrapper function compatibility...');
        
        const publicWrappers = [
            'ensure_user_wallet',
            'is_admin_user',
            'add_funds_to_wallet_fiat',
            'deduct_funds_from_wallet_fiat',
            'add_funds_to_wallet_tickets',
            'deduct_funds_from_wallet_tickets',
            'add_funds_to_wallet'
        ];

        for (const funcName of publicWrappers) {
            try {
                const { error } = await supabase.rpc(funcName, {});
                if (error && !error.message.includes('wrong number of arguments')) {
                    console.log(`   ❌ public.${funcName}: ${error.message}`);
                } else {
                    console.log(`   ✅ public.${funcName}: Would work after SQL application`);
                }
            } catch (err) {
                console.log(`   ❌ public.${funcName}: ${err.message}`);
            }
        }

        // Test 4: Check giveaways table structure
        console.log('\n4️⃣ Testing giveaways table structure...');
        try {
            const { data, error } = await supabase
                .from('giveaways')
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`   ❌ giveaways table: ${error.message}`);
            } else {
                console.log(`   ✅ giveaways table: Accessible`);
                if (data && data.length > 0) {
                    const columns = Object.keys(data[0]);
                    console.log(`   📋 Columns: ${columns.join(', ')}`);
                    
                    const hasEscrowStatus = columns.includes('escrow_status');
                    const hasEscrowAmount = columns.includes('escrow_amount');
                    
                    console.log(`   ${hasEscrowStatus ? '✅' : '❌'} escrow_status column: ${hasEscrowStatus ? 'Present' : 'Missing'}`);
                    console.log(`   ${hasEscrowAmount ? '✅' : '❌'} escrow_amount column: ${hasEscrowAmount ? 'Present' : 'Missing'}`);
                }
            }
        } catch (err) {
            console.log(`   ❌ giveaways table: ${err.message}`);
        }

        // Test 5: Check auth.users for admin metadata
        console.log('\n5️⃣ Testing auth.users admin metadata...');
        try {
            const { data: users, error } = await supabase.auth.admin.listUsers();
            
            if (error) {
                console.log(`   ❌ auth.users: ${error.message}`);
            } else {
                console.log(`   ✅ auth.users: Accessible (${users.users?.length || 0} users found)`);
                
                const adminUsers = users.users?.filter(user => 
                    user.user_metadata?.is_admin || user.raw_user_meta_data?.is_admin
                ) || [];
                
                console.log(`   👑 Admin users found: ${adminUsers.length}`);
                adminUsers.forEach(user => {
                    console.log(`      - ${user.email} (ID: ${user.id})`);
                });
            }
        } catch (err) {
            console.log(`   ❌ auth.users: ${err.message}`);
        }

        console.log('\n📊 Integration Test Summary:');
        console.log('   • The SQL script is designed to work with your existing onagui schema');
        console.log('   • It creates public wrapper functions that call onagui functions');
        console.log('   • It adds escrow columns to the giveaways table if missing');
        console.log('   • It integrates with your existing wallet and admin systems');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Apply the READY_TO_PASTE_ESCROW_SQL.sql script');
        console.log('   2. Run this test again to verify integration');
        console.log('   3. Test the escrow workflow with actual giveaway creation');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testOnaguiIntegration();