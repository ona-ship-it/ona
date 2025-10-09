// Create a test user using Supabase Admin API
// Loads env from .env.local and prints created user details

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        // Remove surrounding quotes if present
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  const timestamp = Date.now();
  const email = `e2e.user.${timestamp}@mailinator.com`;
  const password = 'StrongPass123!';

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error('CreateUser error:', error.message);
      process.exit(1);
    }
    const user = data.user;
    const payload = { id: user.id, email, password };
    // Log to console
    console.log('USER_CREATED_JSON:' + JSON.stringify(payload));
    // Persist to file for later steps
    const outPath = path.resolve(__dirname, '.last_test_user.json');
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log('USER_SAVED_TO:' + outPath);
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
}

main();