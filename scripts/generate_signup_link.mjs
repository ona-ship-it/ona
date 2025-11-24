#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://onagui.com';
const EMAIL = process.env.TEST_SIGNUP_EMAIL || `test+${Date.now()}@${process.env.TEST_SIGNUP_DOMAIN || 'onagui.com'}`;
const PASSWORD = process.env.TEST_SIGNUP_PASSWORD || 'P@ssw0rd123!';
const REDIRECT_TO = `${SITE_URL}/verify?email=${encodeURIComponent(EMAIL)}`;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup',
    email: EMAIL,
    password: PASSWORD,
    options: { redirectTo: REDIRECT_TO },
  });
  if (error) {
    console.error('ERROR', error.message || error);
    process.exit(1);
  }
  const url = data?.properties?.action_link;
  if (!url) {
    console.error('No action_link in response');
    process.exit(1);
  }
  // Print only the URL for easy consumption
  console.log(url);
}

main().catch((e) => { console.error('ERROR', e?.message || e); process.exit(1); });