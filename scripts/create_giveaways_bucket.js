// scripts/create_giveaways_bucket.js
import fs from 'node:fs';
import path from 'node:path';

// Minimal .env.local loader (no external deps)
function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) return;
      const key = m[1];
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
  } catch (_) {
    // ignore
  }
}

loadEnvLocal();

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);
const bucketName = process.argv[2] || 'giveaways';

(async () => {
  try {
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) {
      console.error('List buckets error:', listErr);
      process.exit(1);
    }

    const exists = buckets && buckets.find(b => b.name === bucketName);
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

    if (!exists) {
      const { data: created, error: createErr } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes,
      });
      if (createErr) {
        console.error('Create bucket error:', createErr);
        process.exit(1);
      }
      console.log('Bucket created:', created);
    } else {
      const { data: updated, error: updateErr } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        allowedMimeTypes,
      });
      if (updateErr) {
        console.warn('Update bucket warning:', updateErr);
      }
      console.log('Bucket already exists; ensured public and mime types.');
    }

    const projectRef = new URL(url).host.split('.')[0];
    console.log('Public URL pattern:', `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/<path-to-file>`);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();