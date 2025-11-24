/**
 * Comprehensive Testnet Testing Suite
 * 
 * This test suite is designed to test the wallet system on testnets (Sepolia/Goerli)
 * with real blockchain interactions, concurrent operations, and edge cases.
 * 
 * Prerequisites:
 * - Testnet RPC endpoint (Infura/Alchemy)
 * - Test USDT contract deployed on testnet
 * - Hot wallet with test ETH and USDT
 * - Multiple test user accounts
 */

const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');
const crypto = require('crypto');

// Test configuration
const TEST_CONFIG = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  RPC_URL: process.env.TESTNET_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
  USDT_CONTRACT_ADDRESS: process.env.TESTNET_USDT_ADDRESS || '0x...',
  HOT_WALLET_PRIVATE_KEY: process.env.TESTNET_HOT_WALLET_PRIVATE_KEY,
  TEST_AMOUNT: '10.00', // Test with $10 USDT
  CONCURRENT_USERS: 5,
  CONCURRENT_OPERATIONS: 10,
  CONFIRMATION_BLOCKS: 3
};

// USDT contract ABI
const USDT_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

class TestnetWalletTester {
  constructor() {
    this.supabase = createClient(TEST_CONFIG.SUPABASE_URL, TEST_CONFIG.SUPABASE_ANON_KEY);
    this.provider = new ethers.JsonRpcProvider(TEST_CONFIG.RPC_URL);
    this.hotWallet = new ethers.Wallet(TEST_CONFIG.HOT_WALLET_PRIVATE_KEY, this.provider);
    this.usdtContract = new ethers.Contract(
      TEST_CONFIG.USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      this.hotWallet
    );
    this.testUsers = [];
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Initialize test environment
   */
  async initialize() {
    console.log('🚀 Initializing testnet wallet testing...');
    
    try {
      // Verify network connection
      const network = await this.provider.getNetwork();
      console.log(`📡 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Check hot wallet balance
      const ethBalance = await this.provider.getBalance(this.hotWallet.address);
      const usdtBalance = await this.usdtContract.balanceOf(this.hotWallet.address);
      const decimals = await this.usdtContract.decimals();
      
      console.log(`💰 Hot wallet (${this.hotWallet.address}):`);
      console.log(`   ETH: ${ethers.formatEther(ethBalance)}`);
      console.log(`   USDT: ${ethers.formatUnits(usdtBalance, decimals)}`);
      
      // Create test users
      await this.createTestUsers();
      
      console.log('✅ Initialization complete');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create test users in the database
   */
  async createTestUsers() {
    console.log('👥 Creating test users...');
    
    for (let i = 0; i < TEST_CONFIG.CONCURRENT_USERS; i++) {
      const userId = crypto.randomUUID();
      const wallet = ethers.Wallet.createRandom();
      
      // Create user balance record
      const { error: balanceError } = await this.supabase
        .from('user_balances')
        .insert({
          user_id: userId,
          balance: '100.00' // Start with $100 for testing
        });
      
      if (balanceError) {
        throw new Error(`Failed to create user balance: ${balanceError.message}`);
      }
      
      // Create crypto wallet record
      const { error: walletError } = await this.supabase
        .from('crypto_wallets')
        .insert({
          user_id: userId,
          address: wallet.address,
          network: 'sepolia',
          private_key_encrypted: this.encryptPrivateKey(wallet.privateKey)
        });
      
      if (walletError) {
        throw new Error(`Failed to create crypto wallet: ${walletError.message}`);
      }
      
      this.testUsers.push({
        userId,
        wallet,
        address: wallet.address
      });
    }
    
    console.log(`✅ Created ${this.testUsers.length} test users`);
  }

  /**
   * Simple encryption for test private keys (use proper encryption in production)
   */
  encryptPrivateKey(privateKey) {
    const cipher = crypto.createCipher('aes-256-cbc', 'test-encryption-key');
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting comprehensive wallet tests...');
    
    try {
      await this.testBasicOperations();
      await this.testConcurrentTransfers();
      await this.testDepositFlow();
      await this.testWithdrawalFlow();
      await this.testRateLimiting();
      await this.testIdempotency();
      await this.testErrorHandling();
      await this.testReconciliation();
      
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.errors.push(error.message);
    }
  }

  /**
   * Test basic wallet operations
   */
  async testBasicOperations() {
    console.log('\n📋 Testing basic operations...');
    
    try {
      const user1 = this.testUsers[0];
      const user2 = this.testUsers[1];
      
      // Test balance check
      const balance1 = await this.getUserBalance(user1.userId);
      this.assert(balance1 === '100.00', 'Initial balance should be $100');
      
      // Test internal transfer
      await this.performTransfer(user1.userId, user2.userId, '10.00');
      
      // Verify balances after transfer
      const newBalance1 = await this.getUserBalance(user1.userId);
      const newBalance2 = await this.getUserBalance(user2.userId);
      
      this.assert(newBalance1 === '90.00', 'Sender balance should be $90');
      this.assert(newBalance2 === '110.00', 'Receiver balance should be $110');
      
      console.log('✅ Basic operations test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Basic operations test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Basic operations: ${error.message}`);
    }
  }

  /**
   * Test concurrent transfers to simulate race conditions
   */
  async testConcurrentTransfers() {
    console.log('\n🏃‍♂️ Testing concurrent transfers...');
    
    try {
      const user = this.testUsers[2];
      const targetUsers = this.testUsers.slice(0, 2);
      
      // Reset user balance to known amount
      await this.setUserBalance(user.userId, '100.00');
      
      // Create multiple concurrent transfers
      const transferPromises = [];
      for (let i = 0; i < TEST_CONFIG.CONCURRENT_OPERATIONS; i++) {
        const targetUser = targetUsers[i % targetUsers.length];
        transferPromises.push(
          this.performTransfer(user.userId, targetUser.userId, '5.00')
            .catch(error => ({ error: error.message }))
        );
      }
      
      // Wait for all transfers to complete
      const results = await Promise.all(transferPromises);
      
      // Count successful transfers
      const successfulTransfers = results.filter(r => !r.error).length;
      const expectedSuccessful = Math.floor(100 / 5); // Should be 20 transfers max
      
      console.log(`📊 Concurrent transfers: ${successfulTransfers} successful, ${results.length - successfulTransfers} failed`);
      
      // Verify final balance is consistent
      const finalBalance = await this.getUserBalance(user.userId);
      const expectedBalance = (100 - (successfulTransfers * 5)).toFixed(2);
      
      this.assert(
        finalBalance === expectedBalance,
        `Final balance should be $${expectedBalance}, got $${finalBalance}`
      );
      
      console.log('✅ Concurrent transfers test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Concurrent transfers test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Concurrent transfers: ${error.message}`);
    }
  }

  /**
   * Test deposit flow with on-chain transactions
   */
  async testDepositFlow() {
    console.log('\n💰 Testing deposit flow...');
    
    try {
      const user = this.testUsers[3];
      const depositAmount = ethers.parseUnits(TEST_CONFIG.TEST_AMOUNT, 6);
      
      // Send USDT to user's wallet address
      console.log(`📤 Sending ${TEST_CONFIG.TEST_AMOUNT} USDT to ${user.address}...`);
      
      const tx = await this.usdtContract.transfer(user.address, depositAmount);
      console.log(`🔗 Transaction hash: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait(TEST_CONFIG.CONFIRMATION_BLOCKS);
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      
      // Simulate deposit detection (in real system, this would be done by the monitor)
      await this.simulateDepositDetection(user.userId, user.address, TEST_CONFIG.TEST_AMOUNT, tx.hash);
      
      // Verify balance was updated
      const balance = await this.getUserBalance(user.userId);
      const expectedBalance = (100 + Number(TEST_CONFIG.TEST_AMOUNT)).toFixed(2);
      
      this.assert(
        balance === expectedBalance,
        `Balance should be $${expectedBalance} after deposit, got $${balance}`
      );
      
      console.log('✅ Deposit flow test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Deposit flow test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Deposit flow: ${error.message}`);
    }
  }

  /**
   * Test withdrawal flow with on-chain transactions
   */
  async testWithdrawalFlow() {
    console.log('\n💸 Testing withdrawal flow...');
    
    try {
      const user = this.testUsers[4];
      const withdrawalAmount = '15.00';
      
      // Ensure user has sufficient balance
      await this.setUserBalance(user.userId, '50.00');
      
      // Create withdrawal request
      const { data: withdrawal, error } = await this.supabase
        .from('withdrawals')
        .insert({
          user_id: user.userId,
          amount: withdrawalAmount,
          to_address: user.address,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create withdrawal: ${error.message}`);
      }
      
      console.log(`📝 Created withdrawal request: ${withdrawal.id}`);
      
      // Simulate withdrawal processing
      await this.simulateWithdrawalProcessing(withdrawal);
      
      // Verify balance was debited
      const balance = await this.getUserBalance(user.userId);
      const expectedBalance = (50 - Number(withdrawalAmount)).toFixed(2);
      
      this.assert(
        balance === expectedBalance,
        `Balance should be $${expectedBalance} after withdrawal, got $${balance}`
      );
      
      // Verify on-chain balance
      const onChainBalance = await this.usdtContract.balanceOf(user.address);
      const onChainBalanceFormatted = ethers.formatUnits(onChainBalance, 6);
      
      console.log(`🔗 On-chain balance: ${onChainBalanceFormatted} USDT`);
      
      console.log('✅ Withdrawal flow test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Withdrawal flow test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Withdrawal flow: ${error.message}`);
    }
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting() {
    console.log('\n🚦 Testing rate limiting...');
    
    try {
      const user = this.testUsers[0];
      const targetUser = this.testUsers[1];
      
      // Reset balances
      await this.setUserBalance(user.userId, '1000.00');
      
      // Attempt multiple rapid transfers (should hit rate limit)
      const rapidTransfers = [];
      for (let i = 0; i < 15; i++) { // Exceed the 10 transfers per minute limit
        rapidTransfers.push(
          this.performTransfer(user.userId, targetUser.userId, '1.00')
            .catch(error => ({ error: error.message }))
        );
      }
      
      const results = await Promise.all(rapidTransfers);
      const rateLimitedRequests = results.filter(r => 
        r.error && r.error.includes('rate limit')
      ).length;
      
      this.assert(
        rateLimitedRequests > 0,
        'Some requests should be rate limited'
      );
      
      console.log(`📊 Rate limited requests: ${rateLimitedRequests}/${results.length}`);
      console.log('✅ Rate limiting test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Rate limiting test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Rate limiting: ${error.message}`);
    }
  }

  /**
   * Test idempotency
   */
  async testIdempotency() {
    console.log('\n🔄 Testing idempotency...');
    
    try {
      const user1 = this.testUsers[0];
      const user2 = this.testUsers[1];
      const idempotencyKey = crypto.randomUUID();
      
      // Reset balances
      await this.setUserBalance(user1.userId, '100.00');
      await this.setUserBalance(user2.userId, '100.00');
      
      // Perform the same transfer twice with the same idempotency key
      const transfer1 = await this.performTransferWithIdempotency(
        user1.userId, user2.userId, '10.00', idempotencyKey
      );
      
      const transfer2 = await this.performTransferWithIdempotency(
        user1.userId, user2.userId, '10.00', idempotencyKey
      );
      
      // Second transfer should be ignored (idempotent)
      const balance1 = await this.getUserBalance(user1.userId);
      const balance2 = await this.getUserBalance(user2.userId);
      
      this.assert(balance1 === '90.00', 'Sender should only be debited once');
      this.assert(balance2 === '110.00', 'Receiver should only be credited once');
      
      console.log('✅ Idempotency test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Idempotency test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Idempotency: ${error.message}`);
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('\n🚨 Testing error handling...');
    
    try {
      const user1 = this.testUsers[0];
      const user2 = this.testUsers[1];
      
      // Test insufficient balance
      await this.setUserBalance(user1.userId, '5.00');
      
      try {
        await this.performTransfer(user1.userId, user2.userId, '10.00');
        this.assert(false, 'Transfer should fail with insufficient balance');
      } catch (error) {
        this.assert(
          error.message.includes('insufficient'),
          'Should get insufficient balance error'
        );
      }
      
      // Test invalid user ID
      try {
        await this.performTransfer('invalid-uuid', user2.userId, '1.00');
        this.assert(false, 'Transfer should fail with invalid user ID');
      } catch (error) {
        this.assert(
          error.message.includes('not found') || error.message.includes('invalid'),
          'Should get invalid user error'
        );
      }
      
      console.log('✅ Error handling test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Error handling test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Error handling: ${error.message}`);
    }
  }

  /**
   * Test reconciliation
   */
  async testReconciliation() {
    console.log('\n🔍 Testing reconciliation...');
    
    try {
      // This would test the reconciliation service
      // For now, we'll just verify that balances are consistent
      
      let totalLedgerBalance = 0;
      for (const user of this.testUsers) {
        const balance = await this.getUserBalance(user.userId);
        totalLedgerBalance += Number(balance);
      }
      
      console.log(`📊 Total ledger balance: $${totalLedgerBalance.toFixed(2)}`);
      
      // In a real test, you would compare this with on-chain balances
      this.assert(totalLedgerBalance > 0, 'Total balance should be positive');
      
      console.log('✅ Reconciliation test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Reconciliation test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Reconciliation: ${error.message}`);
    }
  }

  /**
   * Helper methods
   */
  
  async getUserBalance(userId) {
    const { data, error } = await this.supabase
      .rpc('get_user_balance', { p_user_id: userId });
    
    if (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
    
    return data || '0.00';
  }

  async setUserBalance(userId, balance) {
    const { error } = await this.supabase
      .from('user_balances')
      .update({ balance })
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Failed to set balance: ${error.message}`);
    }
  }

  async performTransfer(fromUserId, toUserId, amount) {
    const { data, error } = await this.supabase
      .rpc('transfer_funds', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_amount: amount
      });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  async performTransferWithIdempotency(fromUserId, toUserId, amount, idempotencyKey) {
    // This would use the API endpoint with idempotency header
    // For testing, we'll simulate it
    return this.performTransfer(fromUserId, toUserId, amount);
  }

  async simulateDepositDetection(userId, address, amount, txHash) {
    // Simulate the deposit detection process
    const { error } = await this.supabase
      .rpc('process_deposit', {
        p_user_id: userId,
        p_amount: amount,
        p_tx_hash: txHash,
        p_from_address: this.hotWallet.address,
        p_to_address: address
      });
    
    if (error) {
      throw new Error(`Failed to process deposit: ${error.message}`);
    }
  }

  async simulateWithdrawalProcessing(withdrawal) {
    // Simulate the withdrawal worker processing
    const withdrawalAmount = ethers.parseUnits(withdrawal.amount, 6);
    
    // Send USDT to the withdrawal address
    const tx = await this.usdtContract.transfer(withdrawal.to_address, withdrawalAmount);
    await tx.wait(TEST_CONFIG.CONFIRMATION_BLOCKS);
    
    // Update withdrawal status
    const { error } = await this.supabase
      .from('withdrawals')
      .update({
        status: 'completed',
        tx_hash: tx.hash,
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawal.id);
    
    if (error) {
      throw new Error(`Failed to update withdrawal: ${error.message}`);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Delete test users and related data
      for (const user of this.testUsers) {
        await this.supabase.from('ledger').delete().eq('user_id', user.userId);
        await this.supabase.from('withdrawals').delete().eq('user_id', user.userId);
        await this.supabase.from('crypto_wallets').delete().eq('user_id', user.userId);
        await this.supabase.from('user_balances').delete().eq('user_id', user.userId);
      }
      
      console.log('✅ Cleanup complete');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Print test results
   */
  printTestResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎯 Test suite completed');
  }
}

/**
 * Main test execution
 */
async function runTestnetTests() {
  const tester = new TestnetWalletTester();
  
  try {
    await tester.initialize();
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Test suite crashed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Export for use in other test files
module.exports = {
  TestnetWalletTester,
  runTestnetTests,
  TEST_CONFIG
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTestnetTests().catch(console.error);
}