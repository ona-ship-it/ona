import fetch from 'node-fetch';

async function testIsAdminNoAuth() {
  const resp = await fetch('http://localhost:3000/api/auth/is-admin');
  const json = await resp.json().catch(() => ({}));
  // Endpoint returns 200 with { ok:false, isAdmin:false } when unauthenticated
  const ok = resp.status === 200 && json && json.ok === false && json.isAdmin === false;
  console.log(`is-admin without auth -> status ${resp.status}, ok=${json.ok}, isAdmin=${json.isAdmin}; PASS=${ok}`);
  return ok;
}

async function testAdminUiBypassInDev() {
  const resp = await fetch('http://localhost:3000/admin');
  // In development, admin UI may be accessible or redirected; tolerate 200/304/404
  const pass = resp.status === 200 || resp.status === 304 || resp.status === 404;
  console.log(`admin UI route in dev -> status ${resp.status}; PASS=${pass}`);
  return pass;
}

async function testAdminApiRequiresAuth() {
  const resp = await fetch('http://localhost:3000/api/admin/giveaways');
  // Admin API should respond with 401 unauthorized without auth
  const pass = resp.status === 401;
  console.log(`admin API route without auth -> status ${resp.status}; PASS=${pass}`);
  return pass;
}

async function testAdminAuditApiRequiresAuth() {
  const resp = await fetch('http://localhost:3000/api/admin/audit');
  const pass = resp.status === 401;
  console.log(`admin audit API without auth -> status ${resp.status}; PASS=${pass}`);
  return pass;
}

async function testAdminUsersApiRequiresAuth() {
  const resp = await fetch('http://localhost:3000/api/admin/users');
  const pass = resp.status === 401;
  console.log(`admin users API without auth -> status ${resp.status}; PASS=${pass}`);
  return pass;
}

async function main() {
  const results = [];
  results.push(await testIsAdminNoAuth());
  results.push(await testAdminUiBypassInDev());
  results.push(await testAdminApiRequiresAuth());
  results.push(await testAdminAuditApiRequiresAuth());
  results.push(await testAdminUsersApiRequiresAuth());

  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log(`\nSummary: ${passed}/${total} tests passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});