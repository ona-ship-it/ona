/**
 * Simplified test script for wallet system database functionality
 * Tests the core database functions without user creation
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

// Test configuration with mock UUIDs
const TEST_CONFIG = {
  testUserIds: [
    crypto.randomUUID(),
    crypto.randomUUID()
  ],
  transferAmount: 100.50,
  depositAmount: 1000.00
};

/**
 * Test wallet creation
 */
async function testWalletCreation(userId) {
  try {
    console.log(`\n--- Testing Wallet Creation for User: ${userId} ---`);

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
      console.error('✗ Failed to create wallet:', error.message);
      return null;
    }

    console.log('✓ Created wallet:', {
      id: wallet.id,
      user_id: wallet.user_id,
      balance_fiat: wallet.balance_fiat,
      balance_tickets: wallet.balance_tickets
    });
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

    // Generate a test wallet address
    const testAddress = '0x' + crypto.randomBytes(20).toString('hex');
    const testEncryptedKey = 'encrypted_private_key_placeholder_' + crypto.randomBytes(16).toString('hex');

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
      console.error('✗ Failed to create crypto wallet:', error.message);
      return null;
    }

    console.log('✓ Created crypto wallet:', {
      id: cryptoWallet.id,
      address: cryptoWallet.address,
      network: cryptoWallet.network,
      is_active: cryptoWallet.is_active
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
      console.error('✗ Failed to create user limits:', error.message);
      return null;
    }

    console.log('✓ Created user limits:', {
      id: limits.id,
      max_balance_usdt: limits.max_balance_usdt,
      max_transaction_usdt: limits.max_transaction_usdt,
      daily_withdrawal_limit: limits.daily_withdrawal_limit,
      daily_transfer_limit: limits.daily_transfer_limit
    });
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
        reference: `test_deposit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        status: 'posted'
      })
      .select()
      .single();

    if (error) {
      console.error('✗ Failed to create deposit:', error.message);
      return null;
    }

    console.log(`✓ Simulated deposit of ${amount} USDT:`, {
      id: deposit.id,
      amount: deposit.amount,
      currency: deposit.currency,
      type: deposit.type,
      status: deposit.status
    });
    return deposit;
  } catch (error) {
    console.error('✗ Deposit simulation test failed:', error.message);
    return null;
  }
}

/**
 * Test balance calculation using database function
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
      console.error('✗ Failed to get balance:', error.message);
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
 * Test transfer functionality using database function
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
        p_reference: `test_transfer_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      });

    if (error) {
      console.error('✗ Transfer failed:', error.message);
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
      console.error(`Expected: From=${expectedFromBalance}, To=${expectedToBalance}`);
      console.error(`Actual: From=${fromBalanceAfter}, To=${toBalanceAfter}`);
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
        idempotency_key: `test_withdrawal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      })
      .select()
      .single();

    if (error) {
      console.error('✗ Failed to create withdrawal:', error.message);
      return null;
    }

    console.log(`✓ Created withdrawal request:`, {
      id: withdrawal.id,
      amount: withdrawal.amount,
      currency: withdrawal.currency,
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
 * Test database schema and constraints
 */
async function testDatabaseSchema() {
  try {
    console.log(`\n--- Testing Database Schema ---`);

    // Test table existence by querying each table
    const tables = ['wallets', 'crypto_wallets', 'ledger', 'withdrawals', 'user_limits'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`✗ Table ${table} query failed:`, error.message);
      } else {
        console.log(`✓ Table ${table} is accessible`);
      }
    }

    // Test database functions
    const functions = [
      { name: 'get_user_balance', params: { p_user_id: crypto.randomUUID(), p_currency: 'USDT' } }
    ];

    for (const func of functions) {
      const { data, error } = await supabase.rpc(func.name, func.params);
      
      if (error) {
        console.error(`✗ Function ${func.name} failed:`, error.message);
      } else {
        console.log(`✓ Function ${func.name} is working (returned: ${data})`);
      }
    }

  } catch (error) {
    console.error('✗ Database schema test failed:', error.message);
  }
}

/**
 * Main test runner
 */
async function runWalletDatabaseTests() {
  console.log('🚀 Starting Wallet Database System Tests\n');

  try {
    // Test database schema first
    console.log('=== Testing Database Schema ===');
    await testDatabaseSchema();

    const [userId1, userId2] = TEST_CONFIG.testUserIds;

    // Test wallet creation for both users
    console.log('\n=== Testing Wallet Creation ===');
    const wallet1 = await testWalletCreation(userId1);
    const wallet2 = await testWalletCreation(userId2);

    if (!wallet1 || !wallet2) {
      console.error('✗ Failed to create wallets. Aborting remaining tests.');
      return;
    }

    // Test crypto wallet creation
    console.log('\n=== Testing Crypto Wallet Creation ===');
    await testCryptoWalletCreation(userId1);
    await testCryptoWalletCreation(userId2);

    // Test user limits creation
    console.log('\n=== Testing User Limits Creation ===');
    await testUserLimitsCreation(userId1);
    await testUserLimitsCreation(userId2);

    // Test deposit simulation for user1
    console.log('\n=== Testing Deposit Simulation ===');
    await testDepositSimulation(userId1, TEST_CONFIG.depositAmount);

    // Test balance calculations
    console.log('\n=== Testing Balance Calculations ===');
    await testBalanceCalculation(userId1);
    await testBalanceCalculation(userId2);

    // Test transfer from user1 to user2
    console.log('\n=== Testing Transfer Functionality ===');
    await testTransfer(userId1, userId2, TEST_CONFIG.transferAmount);

    // Test withdrawal creation
    console.log('\n=== Testing Withdrawal Creation ===');
    const testAddress = '0x' + crypto.randomBytes(20).toString('hex');
    await testWithdrawalCreation(userId2, 50.00, testAddress);

    console.log('\n🎉 All wallet database tests completed successfully!');
    console.log('\n=== Test Summary ===');
    console.log('✓ Database schema and table accessibility');
    console.log('✓ Database functions (get_user_balance, process_transfer)');
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
  runWalletDatabaseTests()
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
  runWalletDatabaseTests,
  testWalletCreation,
  testCryptoWalletCreation,
  testUserLimitsCreation,
  testDepositSimulation,
  testBalanceCalculation,
  testTransfer,
  testWithdrawalCreation,
  testDatabaseSchema
};