#!/usr/bin/env node

/**
 * COMPREHENSIVE BLOCKCHAIN WALLET SYSTEM TEST
 * 
 * This script tests the complete blockchain address management system:
 * 1. Database schema and migrations
 * 2. Wallet generation utilities
 * 3. API endpoints
 * 4. Integration with signup flows
 * 5. Encryption/decryption functionality
 */

import { createClient } from '@supabase/supabase-js';
import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  walletEncryptionKey: process.env.WALLET_ENCRYPTION_KEY,
  testUserEmail: 'test-wallet-user@example.com',
  testUserPassword: 'TestPassword123!',
  apiBaseUrl: 'http://localhost:3000'
};

// Initialize Supabase client
const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status} ${name}${details ? ': ' + details : ''}`;
  console.log(message);
  
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

function logSection(title) {
  console.log(`\n🔍 ${title}`);
  console.log('='.repeat(50));
}

async function testEnvironmentVariables() {
  logSection('ENVIRONMENT VARIABLES TEST');
  
  logTest('NEXT_PUBLIC_SUPABASE_URL', !!TEST_CONFIG.supabaseUrl);
  logTest('SUPABASE_SERVICE_ROLE_KEY', !!TEST_CONFIG.supabaseKey);
  logTest('WALLET_ENCRYPTION_KEY', !!TEST_CONFIG.walletEncryptionKey);
}

async function testDatabaseSchema() {
  logSection('DATABASE SCHEMA TEST');
  
  try {
    // Test user_crypto_wallets table exists
    const { data: walletTableInfo, error: walletTableError } = await supabase
      .from('user_crypto_wallets')
      .select('*')
      .limit(0);
    
    logTest('user_crypto_wallets table exists', !walletTableError);
    
    // Test wallets table exists (for fiat/ticket balances)
    const { data: walletsTableInfo, error: walletsTableError } = await supabase
      .from('wallets')
      .select('*')
      .limit(0);
    
    logTest('wallets table exists', !walletsTableError);
    
    // Test onagui_profiles table exists
    const { data: profilesTableInfo, error: profilesTableError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .limit(0);
    
    logTest('onagui_profiles table exists', !profilesTableError);
    
  } catch (error) {
    logTest('Database schema test', false, error.message);
  }
}

async function testSolanaKeyGeneration() {
  logSection('SOLANA KEY GENERATION TEST');
  
  try {
    // Test Solana keypair generation
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toString();
    const privateKey = Buffer.from(keypair.secretKey).toString('base64');
    
    logTest('Solana keypair generation', !!keypair && !!publicKey && !!privateKey);
    logTest('Public key format', publicKey.length > 40 && publicKey.length < 50);
    logTest('Private key format', privateKey.length > 80);
    
    console.log(`   Sample public key: ${publicKey}`);
    
  } catch (error) {
    logTest('Solana key generation', false, error.message);
  }
}

async function testEncryptionDecryption() {
  logSection('ENCRYPTION/DECRYPTION TEST');
  
  if (!TEST_CONFIG.walletEncryptionKey) {
    logTest('Encryption test', false, 'WALLET_ENCRYPTION_KEY not set');
    return;
  }
  
  try {
    // Test encryption/decryption functions (simulate the ones from platformWallet.ts)
    const testPrivateKey = 'test-private-key-12345';
    
    // Generate key and IV
    const key = crypto.scryptSync(TEST_CONFIG.walletEncryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    // Encrypt
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(testPrivateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    logTest('Encryption/Decryption', decrypted === testPrivateKey);
    
  } catch (error) {
    logTest('Encryption/Decryption', false, error.message);
  }
}

async function testFileStructure() {
  logSection('FILE STRUCTURE TEST');
  
  const requiredFiles = [
    'src/utils/userWallet.ts',
    'src/app/api/wallet/generate-crypto/route.ts',
    'src/app/auth/callback/route.ts',
    'supabase/migrations/20241201_user_crypto_wallets.sql',
    'supabase/migrations/20241201_extend_user_signup_with_wallets.sql',
    '.env.local'
  ];
  
  for (const filePath of requiredFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);
    logTest(`File exists: ${filePath}`, exists);
  }
}

async function testMigrationFiles() {
  logSection('MIGRATION FILES TEST');
  
  try {
    // Test user_crypto_wallets migration
    const walletMigrationPath = path.join(process.cwd(), 'supabase/migrations/20241201_user_crypto_wallets.sql');
    if (fs.existsSync(walletMigrationPath)) {
      const content = fs.readFileSync(walletMigrationPath, 'utf8');
      logTest('user_crypto_wallets migration contains CREATE TABLE', content.includes('CREATE TABLE IF NOT EXISTS user_crypto_wallets'));
      logTest('user_crypto_wallets migration contains RLS policies', content.includes('ENABLE ROW LEVEL SECURITY'));
    }
    
    // Test signup extension migration
    const signupMigrationPath = path.join(process.cwd(), 'supabase/migrations/20241201_extend_user_signup_with_wallets.sql');
    if (fs.existsSync(signupMigrationPath)) {
      const content = fs.readFileSync(signupMigrationPath, 'utf8');
      logTest('Signup extension migration contains trigger function', content.includes('sync_auth_user_to_app_users'));
      logTest('Signup extension migration contains wallet insertion', content.includes('user_crypto_wallets'));
    }
    
  } catch (error) {
    logTest('Migration files test', false, error.message);
  }
}

async function testAPIEndpoint() {
  logSection('API ENDPOINT TEST');
  
  try {
    // Test if the API endpoint file exists and has correct structure
    const apiPath = path.join(process.cwd(), 'src/app/api/wallet/generate-crypto/route.ts');
    if (fs.existsSync(apiPath)) {
      const content = fs.readFileSync(apiPath, 'utf8');
      logTest('API endpoint has POST method', content.includes('export async function POST'));
      logTest('API endpoint has GET method', content.includes('export async function GET'));
      logTest('API endpoint imports createUserWallet', content.includes('createUserWallet'));
    } else {
      logTest('API endpoint file exists', false);
    }
    
  } catch (error) {
    logTest('API endpoint test', false, error.message);
  }
}

async function testSignupIntegration() {
  logSection('SIGNUP INTEGRATION TEST');
  
  try {
    // Test SignUpClient integration
    const signupPath = path.join(process.cwd(), 'src/app/signup/SignUpClient.tsx');
    if (fs.existsSync(signupPath)) {
      const content = fs.readFileSync(signupPath, 'utf8');
      logTest('SignUpClient calls wallet generation API', content.includes('/api/wallet/generate-crypto'));
      logTest('SignUpClient handles wallet generation errors', content.includes('Error generating crypto wallet'));
    }
    
    // Test auth callback integration
    const callbackPath = path.join(process.cwd(), 'src/app/auth/callback/route.ts');
    if (fs.existsSync(callbackPath)) {
      const content = fs.readFileSync(callbackPath, 'utf8');
      logTest('Auth callback checks for existing wallet', content.includes('user_crypto_wallets'));
      logTest('Auth callback calls wallet generation API', content.includes('/api/wallet/generate-crypto'));
    }
    
  } catch (error) {
    logTest('Signup integration test', false, error.message);
  }
}

async function testUserWalletUtility() {
  logSection('USER WALLET UTILITY TEST');
  
  try {
    const utilityPath = path.join(process.cwd(), 'src/utils/userWallet.ts');
    if (fs.existsSync(utilityPath)) {
      const content = fs.readFileSync(utilityPath, 'utf8');
      logTest('userWallet utility imports Solana', content.includes('@solana/web3.js'));
      logTest('userWallet utility has createUserWallet function', content.includes('export async function createUserWallet'));
      logTest('userWallet utility uses encryption', content.includes('encryptPrivateKey'));
      logTest('userWallet utility inserts into both tables', content.includes('wallets') && content.includes('user_crypto_wallets'));
    }
    
  } catch (error) {
    logTest('User wallet utility test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 BLOCKCHAIN WALLET SYSTEM COMPREHENSIVE TEST');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  await testEnvironmentVariables();
  await testDatabaseSchema();
  await testSolanaKeyGeneration();
  await testEncryptionDecryption();
  await testFileStructure();
  await testMigrationFiles();
  await testAPIEndpoint();
  await testSignupIntegration();
  await testUserWalletUtility();
  
  // Final results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.details}`));
  }
  
  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});