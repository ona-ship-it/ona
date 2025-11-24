import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing SUPABASE_DB_URL or DATABASE_URL environment variable.');
    console.error('Set it to your Supabase Postgres connection string.');
    process.exit(1);
  }

  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/apply_sql_file.mjs <path-to-sql>');
    process.exit(1);
  }

  const sqlPath = path.resolve(fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`Applied SQL successfully: ${sqlPath}`);
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Error applying SQL file:');
    console.error(err?.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();