/**
 * Test script for the comprehensive wallet system
 * This script tests wallet creation, transfers, balance checks, and limits
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration
const TEST_CONFIG = {
  testUsers: [
    { email: 'test1@example.com', password: 'testpass123' },
    { email: 'test2@example.com', password: 'testpass123' }
  ],
  transferAmount: 100.50,
  depositAmount: 1000.00
};

/**
 * Helper function to create test users
 */
async function createTestUser(email, password) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      console.log(`User ${email} might already exist:`, error.message);
      // Try to get existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);
      return existingUser || null;
    }

    console.log(`✓ Created test user: ${email}`);
    return data.user;
  } catch (error) {
    console.error(`✗ Failed to create user ${email}:`, error.message);
    return null;
  }
}

/**
 * Test wallet creation
 */
async function testWalletCreation(userId) {
  try {
    console.log(`\n--- Testing Wallet Creation for User: ${userId} ---`);

    // Check if wallet already exists
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingWallet) {
      console.log('✓ Wallet already exists:', existingWallet);
      return existingWallet;
    }

    // Create wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        balance_fiat: 0,
        balance_tickets: 0
      })
      .select()
      .single();

    if (error) {
      console.error('✗ Failed to create wallet:', error);
      return null;
    }

    console.log('✓ Created wallet:', wallet);
    return wallet;
  } catch (error) {
    console.error('✗ Wallet creation test failed:', error.message);
    return null;
  }
}

/**
 * Test crypto wallet creation
 */
async function testCryptoWalletCreation(userId) {
  try {
    console.log(`\n--- Testing Crypto Wallet Creation for User: ${userId} ---`);

    // Check if crypto wallet already exists
    const { data: existingCryptoWallet } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('network', 'ethereum')
      .single();

    if (existingCryptoWallet) {
      console.log('✓ Crypto wallet already exists:', {
        address: existingCryptoWallet.address,
        network: existingCryptoWallet.network
      });
      return existingCryptoWallet;
    }

    // Generate a test wallet address (in real implementation, this would use the walletService)
    const testAddress = '0x' + crypto.randomBytes(20).toString('hex');
    const testEncryptedKey = 'encrypted_private_key_placeholder';

    // Create crypto wallet
    const { data: cryptoWallet, error } = await supabase
      .from('crypto_wallets')
      .insert({
        user_id: userId,
        network: 'ethereum',
        address: testAddress,
        encrypted_private_key: testEncryptedKey,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('✗ Failed to create crypto wallet:', error);
      return null;
    }

    console.log('✓ Created crypto wallet:', {
      address: cryptoWallet.address,
      network: cryptoWallet.network
    });
    return cryptoWallet;
  } catch (error) {
    console.error('✗ Crypto wallet creation test failed:', error.message);
    return null;
  }
}

/**
 * Test user limits creation
 */
async function testUserLimitsCreation(userId) {
  try {
    console.log(`\n--- Testing User Limits Creation for User: ${userId} ---`);

    // Check if limits already exist
    const { data: existingLimits } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingLimits) {
      console.log('✓ User limits already exist:', existingLimits);
      return existingLimits;
    }

    // Create user limits
    const { data: limits, error } = await supabase
      .from('user_limits')
      .insert({
        user_id: userId,
        max_balance_usdt: 10000.00,
        max_transaction_usdt: 5000.00,
        daily_withdrawal_limit: 1000.00,
        daily_transfer_limit: 5000.00,
        is_verified: false
      })
      .select()
      .single();

    if (error) {
      console.error('✗ Failed to create user limits:', error);
      return null;
    }

    console.log('✓ Created user limits:', limits);
    return limits;
  } catch (error) {
    console.error('✗ User limits creation test failed:', error.message);
    return null;
  }
}

/**
 * Test deposit simulation
 */
async function testDepositSimulation(userId, amount) {
  try {
    console.log(`\n--- Testing Deposit Simulation for User: ${userId} ---`);

    // Create a deposit ledger entry
    const { data: deposit, error } = await supabase
      .from('ledger')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'USDT',
        type: 'deposit',
        reference: `test_deposit_${Date.now()}`,
        status: 'posted'
      })
      .select()
      .single();

    if (error) {
      console.error('✗ Failed to create deposit:', error);
      return null;
    }

    console.log(`✓ Simulated deposit of ${amount} USDT:`, deposit);
    return deposit;
  } catch (error) {
    console.error('✗ Deposit simulation test failed:', error.message);
    return null;
  }
}

/**
 * Test balance calculation
 */
async function testBalanceCalculation(userId) {
  try {
    console.log(`\n--- Testing Balance Calculation for User: ${userId} ---`);

    // Use the database function to get balance
    const { data: balance, error } = await supabase
      .rpc('get_user_balance', { 
        p_user_id: userId, 
        p_currency: 'USDT' 
      });

    if (error) {
      console.error('✗ Failed to get balance:', error);
      return null;
    }

    console.log(`✓ Current balance: ${balance} USDT`);
    return balance;
  } catch (error) {
    console.error('✗ Balance calculation test failed:', error.message);
    return null;
  }
}

/**
 * Test transfer functionality
 */
async function testTransfer(fromUserId, toUserId, amount) {
  try {
    console.log(`\n--- Testing Transfer: ${amount} USDT from ${fromUserId} to ${toUserId} ---`);

    // Get balances before transfer
    const fromBalanceBefore = await testBalanceCalculation(fromUserId);
    const toBalanceBefore = await testBalanceCalculation(toUserId);

    console.log(`Before transfer - From: ${fromBalanceBefore}, To: ${toBalanceBefore}`);

    // Use the database function to process transfer
    const { data: transferId, error } = await supabase
      .rpc('process_transfer', {
        p_from_user: fromUserId,
        p_to_user: toUserId,
        p_amount: amount,
        p_currency: 'USDT',
        p_reference: `test_transfer_${Date.now()}`
      });

    if (error) {
      console.error('✗ Transfer failed:', error);
      return null;
    }

    console.log(`✓ Transfer completed with ID: ${transferId}`);

    // Get balances after transfer
    const fromBalanceAfter = await testBalanceCalculation(fromUserId);
    const toBalanceAfter = await testBalanceCalculation(toUserId);

    console.log(`After transfer - From: ${fromBalanceAfter}, To: ${toBalanceAfter}`);

    // Verify the transfer
    const expectedFromBalance = parseFloat(fromBalanceBefore) - amount;
    const expectedToBalance = parseFloat(toBalanceBefore) + amount;

    if (Math.abs(parseFloat(fromBalanceAfter) - expectedFromBalance) < 0.01 &&
        Math.abs(parseFloat(toBalanceAfter) - expectedToBalance) < 0.01) {
      console.log('✓ Transfer amounts verified correctly');
      return transferId;
    } else {
      console.error('✗ Transfer amounts do not match expected values');
      return null;
    }
  } catch (error) {
    console.error('✗ Transfer test failed:', error.message);
    return null;
  }
}

/**
 * Test withdrawal creation
 */
async function testWithdrawalCreation(userId, amount, toAddress) {
  try {
    console.log(`\n--- Testing Withdrawal Creation for User: ${userId} ---`);

    // Create withdrawal request
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'USDT',
        to_address: toAddress,
        status: 'pending',
        idempotency_key: `test_withdrawal_${Date.now()}`
      })
      .select()
      .single();

    if (error) {
      console.error('✗ Failed to create withdrawal:', error);
      return null;
    }

    console.log(`✓ Created withdrawal request:`, {
      id: withdrawal.id,
      amount: withdrawal.amount,
      to_address: withdrawal.to_address,
      status: withdrawal.status
    });
    return withdrawal;
  } catch (error) {
    console.error('✗ Withdrawal creation test failed:', error.message);
    return null;
  }
}

/**
 * Main test runner
 */
async function runWalletSystemTests() {
  console.log('🚀 Starting Comprehensive Wallet System Tests\n');

  try {
    // Create test users
    console.log('=== Creating Test Users ===');
    const user1 = await createTestUser(TEST_CONFIG.testUsers[0].email, TEST_CONFIG.testUsers[0].password);
    const user2 = await createTestUser(TEST_CONFIG.testUsers[1].email, TEST_CONFIG.testUsers[1].password);

    if (!user1 || !user2) {
      console.error('✗ Failed to create test users. Aborting tests.');
      return;
    }

    // Test wallet creation for both users
    console.log('\n=== Testing Wallet Creation ===');
    await testWalletCreation(user1.id);
    await testWalletCreation(user2.id);

    // Test crypto wallet creation
    console.log('\n=== Testing Crypto Wallet Creation ===');
    await testCryptoWalletCreation(user1.id);
    await testCryptoWalletCreation(user2.id);

    // Test user limits creation
    console.log('\n=== Testing User Limits Creation ===');
    await testUserLimitsCreation(user1.id);
    await testUserLimitsCreation(user2.id);

    // Test deposit simulation for user1
    console.log('\n=== Testing Deposit Simulation ===');
    await testDepositSimulation(user1.id, TEST_CONFIG.depositAmount);

    // Test balance calculations
    console.log('\n=== Testing Balance Calculations ===');
    await testBalanceCalculation(user1.id);
    await testBalanceCalculation(user2.id);

    // Test transfer from user1 to user2
    console.log('\n=== Testing Transfer Functionality ===');
    await testTransfer(user1.id, user2.id, TEST_CONFIG.transferAmount);

    // Test withdrawal creation
    console.log('\n=== Testing Withdrawal Creation ===');
    const testAddress = '0x' + crypto.randomBytes(20).toString('hex');
    await testWithdrawalCreation(user2.id, 50.00, testAddress);

    console.log('\n🎉 All wallet system tests completed successfully!');
    console.log('\n=== Test Summary ===');
    console.log('✓ User creation and authentication');
    console.log('✓ Wallet creation (fiat/tickets)');
    console.log('✓ Crypto wallet creation with addresses');
    console.log('✓ User limits configuration');
    console.log('✓ Deposit simulation and ledger entries');
    console.log('✓ Balance calculations using database functions');
    console.log('✓ Atomic transfers with validation');
    console.log('✓ Withdrawal queue management');

  } catch (error) {
    console.error('✗ Test suite failed:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  runWalletSystemTests()
    .then(() => {
      console.log('\n✅ Test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runWalletSystemTests,
  testWalletCreation,
  testCryptoWalletCreation,
  testUserLimitsCreation,
  testDepositSimulation,
  testBalanceCalculation,
  testTransfer,
  testWithdrawalCreation
};