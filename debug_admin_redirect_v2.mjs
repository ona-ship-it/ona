import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.error('❌ Could not load .env.local:', error.message);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define the emergency admin emails as they should be now
const EMERGENCY_ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'richtheocrypto@gmail.com', // Hardcoded fallback
  'samiraeddaoudi88@gmail.com', // Second admin user
].filter(Boolean);

const testEmails = ['richtheocrypto@gmail.com', 'samiraeddaoudi88@gmail.com'];

console.log('🔍 Admin Redirection Debug v2\n');

// Test emergency whitelist
console.log('5️⃣ Testing emergency whitelist...');
console.log(`   Emergency emails: ${EMERGENCY_ADMIN_EMAILS.join(', ')}`);
for (const email of testEmails) {
  const isInWhitelist = EMERGENCY_ADMIN_EMAILS.includes(email);
  console.log(`   ${isInWhitelist ? '✅' : '❌'} ${email}: ${isInWhitelist ? 'In whitelist' : 'Not in whitelist'}`);
}

// Test middleware logic simulation
console.log('\n🔧 Simulating middleware admin check...');
for (const email of testEmails) {
  // Emergency whitelist check (first priority)
  const isEmergencyAdmin = EMERGENCY_ADMIN_EMAILS.includes(email);
  
  if (isEmergencyAdmin) {
    console.log(`   ✅ ${email}: ADMIN via emergency whitelist`);
  } else {
    // Test RPC function
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin_user', { user_email: email });
      if (rpcError) {
        console.log(`   ❌ ${email}: RPC error - ${rpcError.message}`);
      } else if (rpcResult) {
        console.log(`   ✅ ${email}: ADMIN via RPC function`);
      } else {
        console.log(`   ❌ ${email}: NOT ADMIN - RPC returned false`);
      }
    } catch (error) {
      console.log(`   ❌ ${email}: RPC exception - ${error.message}`);
    }
  }
}

console.log('\n🎯 Debug v2 completed!');