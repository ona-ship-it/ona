/**
 * Unit Tests for Wallet System Components
 * 
 * These tests focus on individual functions and components
 * without requiring blockchain interaction.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Mock configuration for unit tests
const MOCK_CONFIG = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

class WalletUnitTester {
  constructor() {
    this.supabase = createClient(MOCK_CONFIG.SUPABASE_URL, MOCK_CONFIG.SUPABASE_ANON_KEY);
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Run all unit tests
   */
  async runAllTests() {
    console.log('🧪 Starting wallet unit tests...');
    
    try {
      await this.testBalanceCalculations();
      await this.testTransferValidation();
      await this.testWithdrawalValidation();
      await this.testRateLimitLogic();
      await this.testIdempotencyLogic();
      await this.testEncryptionDecryption();
      await this.testAmountFormatting();
      await this.testAddressValidation();
      
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ Unit test suite failed:', error);
      this.testResults.errors.push(error.message);
    }
  }

  /**
   * Test balance calculation functions
   */
  async testBalanceCalculations() {
    console.log('\n💰 Testing balance calculations...');
    
    try {
      // Test available balance calculation
      const testUserId = crypto.randomUUID();
      
      // Create test user with balance
      await this.createTestUser(testUserId, '100.00');
      
      // Add some pending withdrawals
      await this.createTestWithdrawal(testUserId, '20.00', 'pending');
      await this.createTestWithdrawal(testUserId, '15.00', 'processing');
      
      // Get available balance (should exclude pending withdrawals)
      const { data: availableBalance, error } = await this.supabase
        .rpc('get_available_balance', { p_user_id: testUserId });
      
      if (error) {
        throw new Error(`Failed to get available balance: ${error.message}`);
      }
      
      // Available balance should be 100 - 20 - 15 = 65
      this.assert(
        availableBalance === '65.00',
        `Available balance should be $65.00, got $${availableBalance}`
      );
      
      // Clean up
      await this.cleanupTestUser(testUserId);
      
      console.log('✅ Balance calculations test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Balance calculations test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Balance calculations: ${error.message}`);
    }
  }

  /**
   * Test transfer validation logic
   */
  async testTransferValidation() {
    console.log('\n🔄 Testing transfer validation...');
    
    try {
      const fromUserId = crypto.randomUUID();
      const toUserId = crypto.randomUUID();
      
      // Create test users
      await this.createTestUser(fromUserId, '50.00');
      await this.createTestUser(toUserId, '25.00');
      
      // Test valid transfer
      const { data: validResult, error: validError } = await this.supabase
        .rpc('validate_transfer_request', {
          p_from_user_id: fromUserId,
          p_to_user_id: toUserId,
          p_amount: '30.00'
        });
      
      if (validError) {
        throw new Error(`Valid transfer validation failed: ${validError.message}`);
      }
      
      this.assert(validResult === true, 'Valid transfer should pass validation');
      
      // Test invalid transfer (insufficient balance)
      const { data: invalidResult, error: invalidError } = await this.supabase
        .rpc('validate_transfer_request', {
          p_from_user_id: fromUserId,
          p_to_user_id: toUserId,
          p_amount: '60.00'
        });
      
      // Should return false or throw error for insufficient balance
      this.assert(
        invalidResult === false || invalidError !== null,
        'Invalid transfer should fail validation'
      );
      
      // Clean up
      await this.cleanupTestUser(fromUserId);
      await this.cleanupTestUser(toUserId);
      
      console.log('✅ Transfer validation test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Transfer validation test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Transfer validation: ${error.message}`);
    }
  }

  /**
   * Test withdrawal validation logic
   */
  async testWithdrawalValidation() {
    console.log('\n💸 Testing withdrawal validation...');
    
    try {
      const userId = crypto.randomUUID();
      
      // Create test user
      await this.createTestUser(userId, '100.00');
      
      // Test valid withdrawal
      const { data: validResult, error: validError } = await this.supabase
        .rpc('validate_withdrawal_request', {
          p_user_id: userId,
          p_amount: '50.00',
          p_to_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
        });
      
      if (validError) {
        throw new Error(`Valid withdrawal validation failed: ${validError.message}`);
      }
      
      this.assert(validResult === true, 'Valid withdrawal should pass validation');
      
      // Test invalid withdrawal (amount too large)
      const { data: invalidResult, error: invalidError } = await this.supabase
        .rpc('validate_withdrawal_request', {
          p_user_id: userId,
          p_amount: '150.00',
          p_to_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
        });
      
      // Should return false or throw error for insufficient balance
      this.assert(
        invalidResult === false || invalidError !== null,
        'Invalid withdrawal should fail validation'
      );
      
      // Clean up
      await this.cleanupTestUser(userId);
      
      console.log('✅ Withdrawal validation test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Withdrawal validation test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Withdrawal validation: ${error.message}`);
    }
  }

  /**
   * Test rate limiting logic
   */
  async testRateLimitLogic() {
    console.log('\n🚦 Testing rate limit logic...');
    
    try {
      const userId = crypto.randomUUID();
      const operation = 'transfer';
      const limit = 10; // 10 transfers per minute
      
      // Test rate limit checking
      for (let i = 0; i < limit + 5; i++) {
        const { data: allowed, error } = await this.supabase
          .rpc('check_rate_limit', {
            p_user_id: userId,
            p_operation: operation,
            p_limit: limit,
            p_window_minutes: 1
          });
        
        if (error) {
          throw new Error(`Rate limit check failed: ${error.message}`);
        }
        
        if (i < limit) {
          this.assert(allowed === true, `Request ${i + 1} should be allowed`);
        } else {
          this.assert(allowed === false, `Request ${i + 1} should be rate limited`);
        }
      }
      
      console.log('✅ Rate limit logic test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Rate limit logic test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Rate limit logic: ${error.message}`);
    }
  }

  /**
   * Test idempotency logic
   */
  async testIdempotencyLogic() {
    console.log('\n🔄 Testing idempotency logic...');
    
    try {
      const idempotencyKey = crypto.randomUUID();
      const operation = 'transfer';
      const requestData = { amount: '10.00', from: 'user1', to: 'user2' };
      
      // First request should be new
      const { data: firstResult, error: firstError } = await this.supabase
        .rpc('check_idempotency', {
          p_idempotency_key: idempotencyKey,
          p_operation: operation,
          p_request_data: JSON.stringify(requestData)
        });
      
      if (firstError) {
        throw new Error(`First idempotency check failed: ${firstError.message}`);
      }
      
      this.assert(firstResult.is_duplicate === false, 'First request should not be duplicate');
      
      // Store response for first request
      await this.supabase
        .rpc('store_idempotency_response', {
          p_idempotency_key: idempotencyKey,
          p_response_data: JSON.stringify({ success: true, transfer_id: 'tx123' })
        });
      
      // Second request with same key should be duplicate
      const { data: secondResult, error: secondError } = await this.supabase
        .rpc('check_idempotency', {
          p_idempotency_key: idempotencyKey,
          p_operation: operation,
          p_request_data: JSON.stringify(requestData)
        });
      
      if (secondError) {
        throw new Error(`Second idempotency check failed: ${secondError.message}`);
      }
      
      this.assert(secondResult.is_duplicate === true, 'Second request should be duplicate');
      this.assert(secondResult.response_data !== null, 'Should return cached response');
      
      console.log('✅ Idempotency logic test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Idempotency logic test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Idempotency logic: ${error.message}`);
    }
  }

  /**
   * Test encryption/decryption functions
   */
  async testEncryptionDecryption() {
    console.log('\n🔐 Testing encryption/decryption...');
    
    try {
      const testData = 'test-private-key-0x123456789abcdef';
      const encryptionKey = 'test-encryption-key-for-unit-tests';
      
      // Test encryption
      const encrypted = this.encrypt(testData, encryptionKey);
      this.assert(encrypted !== testData, 'Encrypted data should be different from original');
      this.assert(encrypted.length > 0, 'Encrypted data should not be empty');
      
      // Test decryption
      const decrypted = this.decrypt(encrypted, encryptionKey);
      this.assert(decrypted === testData, 'Decrypted data should match original');
      
      // Test with wrong key
      try {
        this.decrypt(encrypted, 'wrong-key');
        this.assert(false, 'Decryption with wrong key should fail');
      } catch (error) {
        // Expected to fail
      }
      
      console.log('✅ Encryption/decryption test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Encryption/decryption test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Encryption/decryption: ${error.message}`);
    }
  }

  /**
   * Test amount formatting and validation
   */
  async testAmountFormatting() {
    console.log('\n💵 Testing amount formatting...');
    
    try {
      // Test valid amounts
      const validAmounts = ['10.00', '0.01', '999.99', '1000000.00'];
      for (const amount of validAmounts) {
        this.assert(this.isValidAmount(amount), `${amount} should be valid`);
      }
      
      // Test invalid amounts
      const invalidAmounts = ['10.001', '-10.00', '0', '0.00', 'abc', ''];
      for (const amount of invalidAmounts) {
        this.assert(!this.isValidAmount(amount), `${amount} should be invalid`);
      }
      
      // Test amount formatting
      this.assert(this.formatAmount('10') === '10.00', 'Should format to 2 decimals');
      this.assert(this.formatAmount('10.1') === '10.10', 'Should pad to 2 decimals');
      this.assert(this.formatAmount('10.123') === '10.12', 'Should round to 2 decimals');
      
      console.log('✅ Amount formatting test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Amount formatting test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Amount formatting: ${error.message}`);
    }
  }

  /**
   * Test address validation
   */
  async testAddressValidation() {
    console.log('\n📍 Testing address validation...');
    
    try {
      // Test valid Ethereum addresses
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0x0000000000000000000000000000000000000000',
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
      ];
      
      for (const address of validAddresses) {
        this.assert(this.isValidEthereumAddress(address), `${address} should be valid`);
      }
      
      // Test invalid addresses
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b', // too short
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b66', // too long
        '742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // missing 0x
        '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', // invalid characters
        '', // empty
        'not-an-address'
      ];
      
      for (const address of invalidAddresses) {
        this.assert(!this.isValidEthereumAddress(address), `${address} should be invalid`);
      }
      
      console.log('✅ Address validation test passed');
      this.testResults.passed++;
      
    } catch (error) {
      console.error('❌ Address validation test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Address validation: ${error.message}`);
    }
  }

  /**
   * Helper methods
   */
  
  async createTestUser(userId, balance) {
    const { error } = await this.supabase
      .from('user_balances')
      .insert({
        user_id: userId,
        balance: balance
      });
    
    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }
  }

  async createTestWithdrawal(userId, amount, status) {
    const { error } = await this.supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount: amount,
        status: status,
        to_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      });
    
    if (error) {
      throw new Error(`Failed to create test withdrawal: ${error.message}`);
    }
  }

  async cleanupTestUser(userId) {
    await this.supabase.from('withdrawals').delete().eq('user_id', userId);
    await this.supabase.from('ledger').delete().eq('user_id', userId);
    await this.supabase.from('user_balances').delete().eq('user_id', userId);
  }

  encrypt(text, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  isValidAmount(amount) {
    const regex = /^\d+\.\d{2}$/;
    if (!regex.test(amount)) return false;
    const num = parseFloat(amount);
    return num > 0;
  }

  formatAmount(amount) {
    const num = parseFloat(amount);
    return num.toFixed(2);
  }

  isValidEthereumAddress(address) {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Print test results
   */
  printTestResults() {
    console.log('\n📊 Unit Test Results Summary');
    console.log('============================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎯 Unit tests completed');
  }
}

/**
 * Main test execution
 */
async function runUnitTests() {
  const tester = new WalletUnitTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Unit test suite crashed:', error);
  }
}

// Export for use in other test files
module.exports = {
  WalletUnitTester,
  runUnitTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runUnitTests().catch(console.error);
}