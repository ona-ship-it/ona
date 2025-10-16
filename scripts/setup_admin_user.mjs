// Setup test user with admin privileges
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
function loadEnvLocal() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (match) {
        const key = match[1];
        let value = match[2];
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    });
  } catch (_) {
    // ignore
  }
}

async function main() {
  loadEnvLocal();
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  const testUserId = '87a61fd8-73f1-4bb4-8777-845c2258718f';
  const testUserEmail = 'e2e.user.1760573088907@mailinator.com';

  try {
    console.log('Setting up test user with admin privileges...');

    // First, create the user in Supabase auth
    console.log('1. Creating user in Supabase auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'StrongPass123!',
      user_metadata: {
        username: 'test_admin_user'
      },
      email_confirm: true // Auto-confirm email
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.code === 'email_exists') {
        console.log('✓ User already exists in auth system');
      } else {
        console.error('Error creating auth user:', authError);
        process.exit(1);
      }
    } else {
      console.log('✓ User created successfully in auth system');
    }

    // Insert into app_users table with admin rank
    console.log('2. Creating app_users entry with admin rank...');
    const { data: appUserData, error: appUserError } = await supabase
      .from('app_users')
      .upsert({
        id: testUserId,
        email: testUserEmail,
        username: 'test_admin_user',
        current_rank: 'vip',  // Set rank to vip (highest available rank)
        reputation_points: 1000
      });

    if (appUserError) {
      console.error('Error creating app_users entry:', appUserError);
      process.exit(1);
    } else {
      console.log('✓ app_users entry created successfully with admin rank');
    }

    console.log('\\n✅ Test user setup completed!');
    console.log('User ID:', testUserId);
    console.log('Email:', testUserEmail);
    console.log('Password: StrongPass123!');
    console.log('Rank: admin (gives admin privileges)');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main();