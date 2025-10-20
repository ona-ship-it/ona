import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n=== Testing Supabase Connection ===');
    
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('giveaways')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Basic connection failed:', testError.message);
      console.log('Error details:', testError);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Query all giveaways (no filter)
    console.log('\n2. Testing query all giveaways...');
    const { data: allGiveaways, error: allError } = await supabase
      .from('giveaways')
      .select('*');
    
    if (allError) {
      console.log('❌ Query all giveaways failed:', allError.message);
      console.log('Error details:', allError);
    } else {
      console.log('✅ Query all giveaways successful');
      console.log('Total giveaways found:', allGiveaways.length);
      allGiveaways.forEach(g => {
        console.log(`  - ${g.title} (Status: ${g.status})`);
      });
    }
    
    // Test 3: Query active giveaways only
    console.log('\n3. Testing query active giveaways...');
    const { data: activeGiveaways, error: activeError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('status', 'active');
    
    if (activeError) {
      console.log('❌ Query active giveaways failed:', activeError.message);
      console.log('Error details:', activeError);
    } else {
      console.log('✅ Query active giveaways successful');
      console.log('Active giveaways found:', activeGiveaways.length);
      activeGiveaways.forEach(g => {
        console.log(`  - ${g.title} (Prize: $${g.prize_amount})`);
      });
    }
    
    // Test 4: Check RLS policies
    console.log('\n4. Testing with service role key...');
    const supabaseService = createClient(supabaseUrl, envVars.SUPABASE_SERVICE_ROLE_KEY);
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('giveaways')
      .select('*')
      .eq('status', 'active');
    
    if (serviceError) {
      console.log('❌ Service role query failed:', serviceError.message);
    } else {
      console.log('✅ Service role query successful');
      console.log('Service role found active giveaways:', serviceData.length);
    }
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

testConnection();