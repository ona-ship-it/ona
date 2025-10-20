#!/usr/bin/env node

/**
 * User ID Synchronization Script
 * 
 * This script helps synchronize user IDs between auth.users and onagui.app_users
 * 
 * Usage:
 *   node scripts/sync-user-ids.js [command]
 * 
 * Commands:
 *   status    - Show current sync status
 *   report    - Generate detailed report
 *   fix-all   - Automatically fix all mismatches (use with caution)
 *   fix-email - Fix a specific email address
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getSyncStatus() {
  try {
    const { data, error } = await supabase
      .from('user_sync_status')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting sync status:', error.message);
    return null;
  }
}

async function showStatus() {
  console.log('📊 Checking user ID sync status...\n');
  
  const status = await getSyncStatus();
  if (!status) return;
  
  const summary = status.reduce((acc, user) => {
    acc[user.sync_status] = (acc[user.sync_status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📈 Summary:');
  Object.entries(summary).forEach(([status, count]) => {
    const emoji = status === 'SYNCED' ? '✅' : status === 'MISMATCHED' ? '⚠️' : '❌';
    console.log(`   ${emoji} ${status}: ${count} users`);
  });
  
  const issues = status.filter(u => u.sync_status !== 'SYNCED');
  if (issues.length > 0) {
    console.log('\n🔍 Users with sync issues:');
    issues.forEach(user => {
      console.log(`   • ${user.email} - ${user.sync_status}`);
      if (user.sync_status === 'MISMATCHED') {
        console.log(`     Auth ID: ${user.auth_user_id}`);
        console.log(`     App ID:  ${user.app_user_id}`);
      }
    });
  }
}

async function generateReport() {
  console.log('📋 Generating detailed sync report...\n');
  
  const status = await getSyncStatus();
  if (!status) return;
  
  console.log('='.repeat(80));
  console.log('USER ID SYNCHRONIZATION REPORT');
  console.log('='.repeat(80));
  
  status.forEach(user => {
    console.log(`\nEmail: ${user.email}`);
    console.log(`Status: ${user.sync_status}`);
    console.log(`Auth ID: ${user.auth_user_id || 'N/A'}`);
    console.log(`App ID: ${user.app_user_id || 'N/A'}`);
    console.log(`Auth Created: ${user.auth_created_at || 'N/A'}`);
    console.log(`App Created: ${user.app_created_at || 'N/A'}`);
    console.log('-'.repeat(40));
  });
}

async function fixUserEmail(email) {
  console.log(`🔧 Fixing user ID mismatch for: ${email}`);
  
  try {
    const { data, error } = await supabase.rpc('fix_user_id_mismatch', {
      p_email: email,
      p_use_auth_id: true
    });
    
    if (error) throw error;
    
    console.log(`✅ Result: ${data}`);
  } catch (error) {
    console.error(`❌ Error fixing user ${email}:`, error.message);
  }
}

async function fixAllMismatches() {
  console.log('⚠️  WARNING: This will automatically fix ALL user ID mismatches!');
  console.log('   This operation will update existing records in your database.');
  console.log('   Make sure you have a backup before proceeding.\n');
  
  // In a real implementation, you'd want to add a confirmation prompt here
  console.log('🔧 Starting automatic fix process...\n');
  
  const status = await getSyncStatus();
  if (!status) return;
  
  const mismatched = status.filter(u => u.sync_status === 'MISMATCHED');
  const missing = status.filter(u => u.sync_status === 'MISSING_IN_APP_USERS');
  
  console.log(`Found ${mismatched.length} mismatched and ${missing.length} missing records`);
  
  // Fix mismatched records
  for (const user of mismatched) {
    await fixUserEmail(user.email);
  }
  
  // Fix missing records
  for (const user of missing) {
    await fixUserEmail(user.email);
  }
  
  console.log('\n✅ Automatic fix process completed!');
  console.log('📊 Run "status" command to verify results.');
}

async function main() {
  const command = process.argv[2] || 'status';
  const email = process.argv[3];
  
  console.log('🔄 User ID Synchronization Tool\n');
  
  switch (command) {
    case 'status':
      await showStatus();
      break;
      
    case 'report':
      await generateReport();
      break;
      
    case 'fix-all':
      await fixAllMismatches();
      break;
      
    case 'fix-email':
      if (!email) {
        console.error('❌ Please provide an email address: node scripts/sync-user-ids.js fix-email user@example.com');
        process.exit(1);
      }
      await fixUserEmail(email);
      break;
      
    default:
      console.log('📖 Available commands:');
      console.log('   status    - Show current sync status');
      console.log('   report    - Generate detailed report');
      console.log('   fix-all   - Automatically fix all mismatches (use with caution)');
      console.log('   fix-email - Fix a specific email address');
      console.log('\nExample: node scripts/sync-user-ids.js status');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getSyncStatus,
  showStatus,
  generateReport,
  fixUserEmail,
  fixAllMismatches
};