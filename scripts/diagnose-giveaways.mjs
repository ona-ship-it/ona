import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('Listing public.giveaways columns...');
  const { data: columns, error: colErr } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'giveaways')
    .order('column_name');

  if (colErr) {
    console.error('Failed to read columns:', colErr.message);
  } else {
    console.table(columns);
  }

  // Choose a creator_id via service role (first user)
  console.log('Selecting a creator_id from auth users...');
  const { data: usersPage, error: usersErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (usersErr) {
    console.error('Failed to list users:', usersErr.message);
    process.exit(1);
  }
  const creatorId = usersPage?.users?.[0]?.id;
  if (!creatorId) {
    console.error('No users found to use as creator_id');
    process.exit(1);
  }

  console.log('Attempting a minimal insert into giveaways with required fields only...');
  const endsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const payload = {
    title: 'Diag Test',
    description: 'Minimal insert payload',
    prize_amount: 10,
    status: 'draft',
    ends_at: endsAt,
    creator_id: creatorId,
  };

  const { error: insErr } = await supabase
    .from('giveaways')
    .insert(payload, { returning: 'minimal' });

  if (insErr) {
    console.error('Insert error:', insErr.message, insErr.details || '', insErr.hint || '');
    console.error('Full error object:', JSON.stringify(insErr, null, 2));
    process.exit(1);
  }

  const { data: latest, error: fetchErr } = await supabase
    .from('giveaways')
    .select('id,title,status')
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchErr || !latest || !latest.length) {
    console.error('Inserted, but failed to fetch giveaway ID:', fetchErr?.message || 'no rows');
    process.exit(1);
  }
  console.log('Inserted giveaway:', latest[0]);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});