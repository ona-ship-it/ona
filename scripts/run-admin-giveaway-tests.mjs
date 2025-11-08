#!/usr/bin/env node
// Reads browser cookies (Chrome/Edge) for localhost and calls the admin
// giveaway status endpoint to publish/unpublish for a given giveaway ID.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ChromeCookies = require('chrome-cookies-secure');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const val = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

let BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getCookieHeader(url) {
  const getFrom = (browser) => new Promise((resolve, reject) => {
    ChromeCookies.getCookies(url, 'object', { browser }, (err, cookies) => {
      if (err) return reject(err);
      resolve(cookies || {});
    });
  });

  let cookies = {};
  const browsers = ['chrome', 'edge', 'brave'];
  for (const b of browsers) {
    try {
      cookies = await getFrom(b);
      if (cookies['sb-access-token'] || cookies['sb-refresh-token']) break;
    } catch {
      // try next browser
    }
  }

  const access = cookies['sb-access-token'];
  const refresh = cookies['sb-refresh-token'];
  if (!access || !refresh) {
    throw new Error(`Could not find 'sb-access-token'/'sb-refresh-token' cookies for ${url}.\n` +
      `- Ensure you're logged in as admin at ${url}\n` +
      `- Then re-run this command.`);
  }
  return `sb-access-token=${access}; sb-refresh-token=${refresh}`;
}

async function postStatus(id, payload, cookieHeader) {
  const res = await fetch(`${BASE_URL}/api/admin/giveaways/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({ giveawayId: id, ...payload }),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, ok: res.ok, body };
}

function printResult(label, expectedStatus, result) {
  const ok = result.ok === true && result.status === 200 && typeof result.body === 'object' && result.body?.success === true;
  const actual = (typeof result.body === 'object' && result.body?.data?.status) || 'unknown';
  const pass = ok && (!expectedStatus || actual === expectedStatus);
  console.log(`${label} -> HTTP ${result.status}, ok=${result.ok}, status=${actual}; PASS=${pass}`);
  if (!pass) {
    console.log('Response body:', result.body);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const id = args.id || args.giveawayId;
  if (!id) {
    console.error('Usage: node scripts/run-admin-giveaway-tests.mjs --id <uuid> [--host http://localhost:3000] [--action publish|unpublish|both]');
    process.exit(1);
  }

  if (args.host) BASE_URL = args.host;
  const action = (args.action || 'both').toLowerCase();

  let cookieHeader;
  try {
    cookieHeader = await getCookieHeader(BASE_URL);
  } catch (err) {
    console.error(String(err?.message || err));
    process.exit(1);
  }

  if (action === 'publish' || action === 'both') {
    const result = await postStatus(id, { action: 'publish' }, cookieHeader);
    printResult('Publish', 'active', result);
  }

  if (action === 'unpublish' || action === 'both') {
    const result = await postStatus(id, { action: 'unpublish' }, cookieHeader);
    printResult('Unpublish', 'draft', result);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});