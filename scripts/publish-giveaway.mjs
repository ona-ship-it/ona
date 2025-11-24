import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env from local file
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function publishGiveaway() {
  // Try to find an admin user to set as creator_id
  let creatorId = null;
  try {
    const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (!usersError && usersPage?.users?.length) {
      const admin = usersPage.users.find(u => u?.user_metadata?.is_admin === true);
      const anyUser = usersPage.users[0];
      creatorId = (admin || anyUser)?.id || null;
      console.log('Using creator_id:', creatorId, admin ? '(admin)' : '(first user fallback)');
    } else if (usersError) {
      console.warn('Could not list users:', usersError.message);
    }
  } catch (e) {
    console.warn('Admin user discovery failed:', e?.message || e);
  }
  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const giveaway = {
    title: 'Community Launch Giveaway',
    description: 'Celebrate our launch! Enter to win by donating or claiming a free ticket.',
    prize_amount: 100,
    ticket_price: 1,
    status: 'active',
    ends_at: endsAt,
    media_url: 'https://placehold.co/600x400?text=ONAGUI+Giveaway',
    photo_url: 'https://placehold.co/600x400?text=ONAGUI+Photo',
    ...(creatorId ? { creator_id: creatorId } : {}),
  };

  console.log('Publishing giveaway:', giveaway);
  const { data, error } = await supabase
    .from('giveaways')
    .insert(giveaway, { returning: 'minimal' });

  if (error) {
    console.error('Failed to publish giveaway:', error.message, error.details || '', error.hint || '');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  // Fetch the newest giveaway to obtain its id
  const { data: latest, error: fetchErr } = await supabase
    .from('giveaways')
    .select('id,title,status')
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchErr || !latest || !latest.length) {
    console.error('Inserted, but failed to fetch giveaway ID:', fetchErr?.message || 'no rows');
    process.exit(1);
  }

  const inserted = latest[0];
  console.log('Giveaway published:', { id: inserted.id, title: inserted.title, status: inserted.status });
  console.log(`Visit: http://localhost:3000/giveaways/${inserted.id}`);
}

publishGiveaway().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});