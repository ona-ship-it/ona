#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required env vars');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!SUPABASE_ANON_KEY);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('🧪 Running signup ➜ confirm email ➜ sign-in test');

  // Use a unique, disposable email
  const email = `test+${Date.now()}@example.com`;
  const password = 'P@ssw0rd123!';
  const desiredRedirect = '/account';
  const callbackUrl = `${SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(desiredRedirect)}`;

  console.log('1) Generating signup confirmation link (service role)...');
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: { redirectTo: callbackUrl },
  });

  if (linkError) {
    console.error('❌ generateLink error:', linkError);
    process.exit(1);
  }

  const actionLink = linkData?.properties?.action_link;
  if (!actionLink) {
    console.error('❌ No action_link returned from generateLink');
    process.exit(1);
  }
  console.log('   ✅ Action link generated');
  console.log('   ↪', actionLink);

  console.log('2) Simulating user click on confirmation link (follow redirects)...');
  const res = await fetch(actionLink, { redirect: 'follow' });
  const finalUrl = res.url;
  console.log('   ✅ Final redirect URL:', finalUrl);

  const urlObj = new URL(finalUrl);
  const code = urlObj.searchParams.get('code');
  const type = urlObj.searchParams.get('type');
  if (!code) {
    console.error('❌ No `code` param found after confirmation redirect');
    console.error('   Note: If redirectTo points to `/verify`, ensure that route exists and captures `code`.');
    process.exit(1);
  }
  console.log('   ✅ Confirmation produced code:', code, `(type=${type})`);

  console.log('3) Exchanging code for session (anon client)...');
  const { data: exchange, error: exchangeErr } = await anon.auth.exchangeCodeForSession(code);
  if (exchangeErr) {
    console.error('❌ exchangeCodeForSession error:', exchangeErr);
    process.exit(1);
  }
  const sessionUser = exchange?.session?.user;
  if (!sessionUser) {
    console.error('❌ No user in exchanged session');
    process.exit(1);
  }
  console.log('   ✅ Session established for:', sessionUser.email, 'id=', sessionUser.id);

  console.log('4) Verifying email confirmation status via admin listUsers...');
  const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) {
    console.error('❌ listUsers error:', listErr);
  } else {
    const found = (usersList?.users || []).find(u => u.email === email);
    if (found) {
      console.log('   🔎 Supabase auth.users entry:');
      console.log('   - email_confirmed_at:', found.email_confirmed_at || 'null');
      console.log('   - created_at:', found.created_at);
      console.log('   - last_sign_in_at:', found.last_sign_in_at || 'null');
    } else {
      console.log('   ⚠️ user not found in listUsers; using session data only');
    }
  }

  console.log('5) Cleanup: deleting test user to avoid clutter...');
  try {
    await admin.auth.admin.deleteUser(sessionUser.id);
    console.log('   ✅ Test user deleted');
  } catch (delErr) {
    console.warn('   ⚠️ Failed to delete test user:', delErr?.message || delErr);
  }

  console.log('\n🎉 Flow validated: signup link confirmed, code exchanged, session established.');
}

run().catch((err) => {
  console.error('💥 Unexpected test error:', err?.message || err);
  process.exit(1);
});