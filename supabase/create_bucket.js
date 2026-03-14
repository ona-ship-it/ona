// Script to create a public Supabase storage bucket
// Usage: node create_bucket.js [bucketName]

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Minimal .env parser to avoid dotenv dependency
function loadEnvLocal(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) {
        let val = m[2];
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[m[1]] = val;
      }
    });
  } catch (e) {
    // Ignore if file not found
  }
}

// Load env from project root .env.local
loadEnvLocal(path.resolve(__dirname, '../.env.local'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or service role key. Check .env.local');
  process.exit(1);
}

// Bucket name from CLI arg or env or default
const argBucket = process.argv[2];
const bucketName = argBucket || process.env.SUPABASE_BUCKET_NAME || 'giveaways';

// AVIF autodetection preference (managed by Next.js). Here we only control allowed MIME types.
const enableAvif = (process.env.ENABLE_AVIF_AUTODETECTION || 'false').toLowerCase() === 'true';

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
];
if (enableAvif) {
  allowedMimeTypes.push('image/avif');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function ensureBucket() {
  try {
    console.log(`Ensuring bucket '${bucketName}' exists and is public...`);

    // Check if bucket exists
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) {
      console.error('Failed to list buckets:', listErr);
      process.exit(1);
    }

    const existing = buckets?.find(b => b.name === bucketName);

    if (!existing) {
      const { data: created, error: createErr } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes,
      });
      if (createErr) {
        console.error('Error creating bucket:', createErr);
        process.exit(1);
      }
      console.log('Bucket created:', created);
    } else {
      console.log('Bucket already exists. Updating to ensure public and mime types...');
      const { data: updated, error: updateErr } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        allowedMimeTypes,
      });
      if (updateErr) {
        console.warn('Update bucket returned error (may be harmless):', updateErr);
      } else {
        console.log('Bucket updated:', updated);
      }
    }

    // Confirm bucket status
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    const final = finalBuckets?.find(b => b.name === bucketName);

    // Compute public URL pattern
    const parsed = url.parse(supabaseUrl);
    const host = parsed.host || '';
    const projectRef = host.split('.')[0];
    const publicUrlPattern = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/<path-to-file>`;

    console.log('--- Summary ---');
    console.log('Bucket Name:', bucketName);
    console.log('Public:', final?.public === true);
    console.log('Allowed Mime Types:', final?.allowedMimeTypes || allowedMimeTypes);
    console.log('AVIF autodetection enabled:', enableAvif);
    console.log('Public URL pattern:', publicUrlPattern);

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

ensureBucket();