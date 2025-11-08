import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function applySQLFile(sqlPath) {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📄 Applying ${path.basename(sqlPath)} with ${statements.length} statements...`);

  let ok = 0, fail = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    console.log(`\n${i + 1}/${statements.length}: ${stmt.slice(0, 120)}...`);
    try {
      // Try common arg names used across workspace
      const { error } = await supabase.rpc('exec_sql', { sql: stmt, sql_query: stmt, query: stmt });
      if (error) {
        console.warn(`   ❌ RPC exec_sql error: ${error.message}`);
        fail++;
      } else {
        console.log('   ✅ Executed');
        ok++;
      }
    } catch (e) {
      console.warn(`   ❌ Exception: ${e.message}`);
      fail++;
    }
  }
  console.log(`\n✅ Success: ${ok}, ❌ Failed: ${fail}`);
  if (fail > 0) {
    console.log('⚠️ Some statements failed. You may need to run this SQL in Supabase Dashboard > SQL Editor.');
  }
}

async function main() {
  const migDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = [
    '20251107_apply_giveaway_donation_with_wallet.sql',
    '20251107_donation_audit_return_fields.sql',
  ];
  for (const f of files) {
    const p = path.join(migDir, f);
    if (!fs.existsSync(p)) {
      console.error(`❌ Missing migration file: ${p}`);
      process.exit(1);
    }
    await applySQLFile(p);
  }
  console.log('\n🎉 Donation migrations attempted. Verify functions via RPC calls.');
}

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});