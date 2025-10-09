// Verify that onagui_profiles entry exists for a given user id
// Usage: node scripts/verify_profile.js <user_id>

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
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node scripts/verify_profile.js <user_id>');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  try {
    const { data, error } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('PROFILE_QUERY_ERROR:', error.message);
      process.exit(1);
    }

    if (data) {
      console.log('PROFILE_FOUND_JSON:' + JSON.stringify(data));
    } else {
      console.log('PROFILE_NOT_FOUND');
      process.exit(2);
    }
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
}

main();