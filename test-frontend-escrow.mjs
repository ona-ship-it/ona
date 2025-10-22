import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables for frontend testing');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('Check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions
function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`🎨 ${title}`);
  console.log('='.repeat(60));
}

function logTest(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

// Test functions
async function testComponentFiles() {
  logSection('Testing Component Files');
  
  const componentsToCheck = [
    {
      path: 'src/components/WalletBalance.tsx',
      name: 'WalletBalance Component',
      requiredContent: [
        'ensure_user_wallet',
        'useState',
        'useEffect',
        'balance',
        'loading'
      ]
    },
    {
      path: 'src/components/AdminWalletManager.tsx',
      name: 'AdminWalletManager Component',
      requiredContent: [
        'add_funds_to_wallet',
        'selectedUser',
        'amount',
        'searchTerm'
      ]
    },
    {
      path: 'src/components/NewGiveawayClient.tsx',
      name: 'NewGiveawayClient Component',
      requiredContent: [
        'WalletBalance',
        'prize_amount',
        'escrow_amount',
        'walletBalance'
      ]
    }
  ];

  let allComponentsExist = true;

  for (const component of componentsToCheck) {
    try {
      const filePath = path.join(process.cwd(), component.path);
      
      if (!fs.existsSync(filePath)) {
        logTest(component.name, false, 'File does not exist');
        allComponentsExist = false;
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const missingContent = component.requiredContent.filter(
        content => !fileContent.includes(content)
      );

      if (missingContent.length === 0) {
        logTest(component.name, true, 'All required content found');
      } else {
        logTest(component.name, false, `Missing: ${missingContent.join(', ')}`);
        allComponentsExist = false;
      }

    } catch (error) {
      logTest(component.name, false, `Error reading file: ${error.message}`);
      allComponentsExist = false;
    }
  }

  return allComponentsExist;
}

async function testSupabaseIntegration() {
  logSection('Testing Supabase Frontend Integration');
  
  try {
    // Test if we can connect to Supabase with anon key
    const { data, error } = await supabase
      .from('onagui.giveaways')
      .select('id')
      .limit(1);

    if (error) {
      logTest('Supabase connection', false, `Error: ${error.message}`);
      return false;
    }

    logTest('Supabase connection', true, 'Successfully connected with anon key');

    // Test if RPC functions are accessible (they should fail without auth, but should exist)
    const { error: rpcError } = await supabase.rpc('onagui.ensure_user_wallet');
    
    // We expect this to fail due to no auth, but the function should exist
    const functionExists = rpcError && !rpcError.message.includes('function onagui.ensure_user_wallet() does not exist');
    
    logTest('RPC functions accessible', functionExists, 
      functionExists ? 'Functions exist (auth required)' : 'Functions may not exist');

    return true;
  } catch (error) {
    logTest('Supabase integration', false, `Error: ${error.message}`);
    return false;
  }
}

async function testTypeDefinitions() {
  logSection('Testing TypeScript Definitions');
  
  try {
    const typesPath = path.join(process.cwd(), 'src/types/giveaways.ts');
    
    if (!fs.existsSync(typesPath)) {
      logTest('Giveaways types file', false, 'File does not exist');
      return false;
    }

    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    const requiredTypes = [
      'prize_amount',
      'escrow_amount',
      'CreateGiveawayPayload'
    ];

    const missingTypes = requiredTypes.filter(type => !typesContent.includes(type));

    if (missingTypes.length === 0) {
      logTest('TypeScript definitions', true, 'All required types found');
      return true;
    } else {
      logTest('TypeScript definitions', false, `Missing: ${missingTypes.join(', ')}`);
      return false;
    }

  } catch (error) {
    logTest('TypeScript definitions', false, `Error: ${error.message}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  logSection('Testing Environment Variables');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const optionalVars = [
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let allRequired = true;

  requiredVars.forEach(varName => {
    const exists = !!envVars[varName];
    logTest(`${varName}`, exists, exists ? 'Set' : 'Missing');
    if (!exists) allRequired = false;
  });

  optionalVars.forEach(varName => {
    const exists = !!envVars[varName];
    logTest(`${varName} (optional)`, true, exists ? 'Set' : 'Not set');
  });

  return allRequired;
}

async function testPackageDependencies() {
  logSection('Testing Package Dependencies');
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      logTest('package.json', false, 'File does not exist');
      return false;
    }

    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };

    const requiredPackages = [
      '@supabase/supabase-js',
      'react',
      'next',
      'lucide-react'
    ];

    let allDependenciesExist = true;

    requiredPackages.forEach(pkg => {
      const exists = !!dependencies[pkg];
      logTest(`${pkg}`, exists, exists ? `v${dependencies[pkg]}` : 'Missing');
      if (!exists) allDependenciesExist = false;
    });

    return allDependenciesExist;
  } catch (error) {
    logTest('Package dependencies', false, `Error: ${error.message}`);
    return false;
  }
}

async function analyzeCodeQuality() {
  logSection('Code Quality Analysis');
  
  const filesToAnalyze = [
    'src/components/WalletBalance.tsx',
    'src/components/AdminWalletManager.tsx',
    'src/components/NewGiveawayClient.tsx'
  ];

  let overallQuality = true;

  for (const filePath of filesToAnalyze) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      
      if (!fs.existsSync(fullPath)) {
        logTest(`${filePath} analysis`, false, 'File does not exist');
        overallQuality = false;
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for common React patterns
      const hasUseClient = content.includes("'use client'");
      const hasProperImports = content.includes('import') && content.includes('from');
      const hasErrorHandling = content.includes('try') || content.includes('catch') || content.includes('error');
      const hasTypeScript = content.includes(': ') && (content.includes('interface') || content.includes('type'));
      
      const qualityScore = [hasUseClient, hasProperImports, hasErrorHandling, hasTypeScript]
        .filter(Boolean).length;
      
      const passed = qualityScore >= 3;
      logTest(`${filePath} quality`, passed, `Score: ${qualityScore}/4`);
      
      if (!passed) overallQuality = false;

    } catch (error) {
      logTest(`${filePath} analysis`, false, `Error: ${error.message}`);
      overallQuality = false;
    }
  }

  return overallQuality;
}

async function generateFrontendTestReport() {
  logSection('Frontend Escrow Integration Test Report');
  
  const testResults = {
    componentFiles: await testComponentFiles(),
    supabaseIntegration: await testSupabaseIntegration(),
    typeDefinitions: await testTypeDefinitions(),
    environmentVariables: await testEnvironmentVariables(),
    packageDependencies: await testPackageDependencies(),
    codeQuality: await analyzeCodeQuality()
  };

  // Summary
  logSection('Frontend Test Summary');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);

  console.log(`📊 Frontend Test Results: ${passedTests}/${totalTests} passed (${successRate}%)`);
  console.log('');

  Object.entries(testResults).forEach(([testName, passed]) => {
    logTest(testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), passed);
  });

  // Recommendations
  logSection('Frontend Integration Recommendations');
  
  if (testResults.componentFiles) {
    console.log('✅ All required components are present');
  } else {
    console.log('❌ Some components are missing or incomplete');
    console.log('   - Ensure WalletBalance.tsx is properly implemented');
    console.log('   - Verify AdminWalletManager.tsx exists and functions');
    console.log('   - Check NewGiveawayClient.tsx integration');
  }

  if (testResults.supabaseIntegration) {
    console.log('✅ Supabase integration is working');
  } else {
    console.log('❌ Supabase integration issues detected');
    console.log('   - Check environment variables');
    console.log('   - Verify RLS policies allow frontend access');
  }

  if (testResults.typeDefinitions) {
    console.log('✅ TypeScript definitions are complete');
  } else {
    console.log('❌ TypeScript definitions need updates');
    console.log('   - Add missing escrow-related types');
    console.log('   - Update giveaway interfaces');
  }

  console.log('\n🧪 Manual Testing Checklist:');
  console.log('   □ Load giveaway creation page');
  console.log('   □ Verify wallet balance displays correctly');
  console.log('   □ Test escrow warning messages');
  console.log('   □ Try creating giveaway with insufficient funds');
  console.log('   □ Test admin bypass functionality');
  console.log('   □ Verify AdminWalletManager works');
  console.log('   □ Check error handling and user feedback');

  return passedTests === totalTests;
}

// Main execution
async function main() {
  console.log('🎨 Starting Frontend Escrow Integration Tests');
  console.log(`📅 ${new Date().toISOString()}`);
  
  try {
    const success = await generateFrontendTestReport();
    
    if (success) {
      console.log('\n🎉 All frontend tests passed! Ready for manual testing.');
    } else {
      console.log('\n⚠️  Some frontend tests failed. Please review and fix issues.');
    }
    
  } catch (error) {
    logError(`Frontend test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
// Run the main function directly
main().catch(console.error);

export { main as runFrontendEscrowTests };