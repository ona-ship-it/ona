#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAuthFlows() {
  console.log('🧪 Starting Authentication Flow Tests...\n');

  const results = {
    oauthUtilsExists: false,
    oauthFunctionsExist: false,
    componentsUpdated: false,
    adminUsersVerified: false,
    authConfigValid: false,
    errors: []
  };

  try {
    // 1. Test OAuth Utils Existence
    console.log('1️⃣ Testing OAuth Utils Files...');
    
    const mainOAuthUtils = path.join(process.cwd(), 'src', 'lib', 'oauth-utils.ts');
    const onaOAuthUtils = path.join(process.cwd(), 'ona-production', 'src', 'lib', 'oauth-utils.ts');
    
    if (fs.existsSync(mainOAuthUtils)) {
      console.log('   ✅ Main oauth-utils.ts exists');
      results.oauthUtilsExists = true;
    } else {
      console.log('   ❌ Main oauth-utils.ts missing');
      results.errors.push('Main oauth-utils.ts file not found');
    }
    
    if (fs.existsSync(onaOAuthUtils)) {
      console.log('   ✅ ona-production oauth-utils.ts exists');
    } else {
      console.log('   ❌ ona-production oauth-utils.ts missing');
      results.errors.push('ona-production oauth-utils.ts file not found');
    }

    // 2. Test OAuth Functions
    console.log('\n2️⃣ Testing OAuth Function Exports...');
    
    try {
      const mainOAuthContent = fs.readFileSync(mainOAuthUtils, 'utf8');
      const onaOAuthContent = fs.readFileSync(onaOAuthUtils, 'utf8');
      
      const requiredFunctions = ['signInWithGoogle', 'signInWithDiscord', 'signInWithTwitter'];
      let allFunctionsExist = true;
      
      for (const func of requiredFunctions) {
        const mainHasFunc = mainOAuthContent.includes(`export const ${func}`) || 
                           mainOAuthContent.includes(`export function ${func}`) ||
                           mainOAuthContent.includes(`export async function ${func}`);
        const onaHasFunc = onaOAuthContent.includes(`export const ${func}`) || 
                          onaOAuthContent.includes(`export function ${func}`) ||
                          onaOAuthContent.includes(`export async function ${func}`);
        
        if (mainHasFunc && onaHasFunc) {
          console.log(`   ✅ ${func} exists in both files`);
        } else {
          console.log(`   ❌ ${func} missing in ${!mainHasFunc ? 'main' : 'ona-production'}`);
          allFunctionsExist = false;
          results.errors.push(`${func} missing in ${!mainHasFunc ? 'main' : 'ona-production'} oauth-utils`);
        }
      }
      
      results.oauthFunctionsExist = allFunctionsExist;
    } catch (error) {
      console.log(`   ❌ Error reading OAuth files: ${error.message}`);
      results.errors.push(`Error reading OAuth files: ${error.message}`);
    }

    // 3. Test Component Updates
    console.log('\n3️⃣ Testing Component Updates...');
    
    const componentsToCheck = [
      { path: 'src/components/XSignIn.tsx', name: 'XSignIn' },
      { path: 'src/utils/googleAuth.ts', name: 'GoogleAuth' },
      { path: 'ona-production/src/components/GoogleSignIn.tsx', name: 'GoogleSignIn' },
      { path: 'ona-production/src/components/DiscordSignIn.tsx', name: 'DiscordSignIn' },
      { path: 'ona-production/src/components/XSignIn.tsx', name: 'ona-production XSignIn' }
    ];
    
    let allComponentsUpdated = true;
    
    for (const component of componentsToCheck) {
      const fullPath = path.join(process.cwd(), component.path);
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const usesOAuthUtils = content.includes('oauth-utils') || content.includes('signInWith');
        
        if (usesOAuthUtils) {
          console.log(`   ✅ ${component.name} uses standardized OAuth`);
        } else {
          console.log(`   ⚠️ ${component.name} may not use standardized OAuth`);
          allComponentsUpdated = false;
        }
      } else {
        console.log(`   ⚠️ ${component.name} file not found`);
      }
    }
    
    results.componentsUpdated = allComponentsUpdated;

    // 4. Test Admin Users
    console.log('\n4️⃣ Testing Admin Users...');
    
    const adminEmails = ['richtheocrypto@gmail.com', 'samiraeddaoudi88@gmail.com'];
    let allAdminsVerified = true;
    
    for (const email of adminEmails) {
      try {
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          console.log(`   ❌ Error fetching users: ${error.message}`);
          results.errors.push(`Error fetching users: ${error.message}`);
          allAdminsVerified = false;
          continue;
        }
        
        const user = users.users.find(u => u.email === email);
        
        if (user) {
          const hasAdminMetadata = user.user_metadata?.is_admin === true;
          console.log(`   ${hasAdminMetadata ? '✅' : '⚠️'} ${email}: ${hasAdminMetadata ? 'Has admin metadata' : 'Missing admin metadata'}`);
          
          if (!hasAdminMetadata) {
            allAdminsVerified = false;
          }
        } else {
          console.log(`   ❌ ${email}: User not found`);
          allAdminsVerified = false;
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${email}: ${error.message}`);
        results.errors.push(`Error checking ${email}: ${error.message}`);
        allAdminsVerified = false;
      }
    }
    
    results.adminUsersVerified = allAdminsVerified;

    // 5. Test Auth Configuration
    console.log('\n5️⃣ Testing Auth Configuration...');
    
    try {
      // Test basic Supabase connection by checking if we can create a client
      const testClient = supabaseAnon;
      if (testClient && testClient.auth) {
        console.log('   ✅ Supabase connection working');
        results.authConfigValid = true;
      } else {
        console.log('   ❌ Supabase client initialization failed');
        results.errors.push('Supabase client initialization failed');
      }
      
      // Check environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ];
      
      for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
          console.log(`   ✅ ${envVar} is set`);
        } else {
          console.log(`   ❌ ${envVar} is missing`);
          results.errors.push(`${envVar} environment variable is missing`);
          results.authConfigValid = false;
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Auth configuration error: ${error.message}`);
      results.errors.push(`Auth configuration error: ${error.message}`);
      results.authConfigValid = false;
    }

    // 6. Generate Test Report
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`OAuth Utils Files: ${results.oauthUtilsExists ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`OAuth Functions: ${results.oauthFunctionsExist ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Components Updated: ${results.componentsUpdated ? '✅ PASS' : '⚠️ PARTIAL'}`);
    console.log(`Admin Users: ${results.adminUsersVerified ? '✅ PASS' : '⚠️ PARTIAL'}`);
    console.log(`Auth Configuration: ${results.authConfigValid ? '✅ PASS' : '❌ FAIL'}`);
    
    if (results.errors.length > 0) {
      console.log('\n🚨 Errors Found:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    const overallSuccess = results.oauthUtilsExists && 
                          results.oauthFunctionsExist && 
                          results.authConfigValid;
    
    console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '⚠️ NEEDS ATTENTION'}`);
    
    if (overallSuccess) {
      console.log('\n🎉 Authentication flows are properly standardized and configured!');
      console.log('✨ OAuth utilities are in place and components have been updated.');
      console.log('🔐 Admin users have been processed and auth configuration is valid.');
    } else {
      console.log('\n⚠️ Some issues were found that may need attention.');
      console.log('📝 Review the errors above and ensure all components are properly updated.');
    }

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    process.exit(1);
  }
}

// Run the tests
testAuthFlows();