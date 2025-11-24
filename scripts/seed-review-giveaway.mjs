import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Update this to a known admin user if needed
const ADMIN_USER_ID = 'b5b32b5d-e800-42ae-9d0b-4a77e70c4aa3';

async function ensureAdminProfile(userId) {
  const { data: existing, error: profileError } = await supabase
    .from('onagui_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.log('⚠️  Could not read onagui_profiles:', profileError.message);
  }

  if (!existing) {
    // Try to get auth user info for username
    const { data: adminUser, error: adminErr } = await supabase.auth.admin.getUserById(userId);
    const username = adminUser?.user?.email ? adminUser.user.email.split('@')[0] : 'admin';

    const { error: insertErr } = await supabase
      .from('onagui_profiles')
      .insert({ id: userId, username, full_name: username, onagui_type: 'admin', is_admin: true });

    if (insertErr) {
      console.log('⚠️  Failed to create admin profile:', insertErr.message);
    } else {
      console.log('✅ Created admin profile');
    }
  } else {
    console.log('✅ Admin profile exists');
  }
}

async function seedReviewGiveaway() {
  console.log('🧪 Seeding giveaway with tickets and setting review_pending...');

  // 1) Create active giveaway (admin bypass escrow)
  const giveawayPayload = {
    title: 'Seeded Giveaway for Admin Review',
    description: 'Auto-created for testing the review workflow',
    prize_amount: 100,
    ticket_price: 1,
    status: 'active',
    creator_id: ADMIN_USER_ID,
    ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    escrow_amount: 0,
    escrow_status: 'admin_bypass',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: giveaway, error: createErr } = await supabase
    .from('giveaways')
    .insert(giveawayPayload)
    .select()
    .single();

  if (createErr) {
    console.error('❌ Failed to create giveaway:', createErr.message);
    process.exit(1);
  }

  console.log('✅ Created giveaway:', giveaway.id);

  // 2) Ensure admin has a profile for UI display
  await ensureAdminProfile(ADMIN_USER_ID);

  // 3) Insert one ticket for the admin user
  // Use the most compatible schema: giveaway_id + user_id + quantity
  const { error: ticketErr } = await supabase
    .from('tickets')
    .insert({ giveaway_id: giveaway.id, user_id: ADMIN_USER_ID, quantity: 1, is_free: true });

  if (ticketErr) {
    console.error('❌ Failed to insert ticket:', ticketErr.message);
    console.error('Tip: Check tickets table columns in Supabase.');
  } else {
    console.log('✅ Inserted 1 ticket for admin user');
  }

  // 4) Move giveaway into review_pending and set temp_winner
  const { error: updateErr } = await supabase
    .from('giveaways')
    .update({ status: 'review_pending', temp_winner_id: ADMIN_USER_ID, updated_at: new Date().toISOString() })
    .eq('id', giveaway.id);

  if (updateErr) {
    console.warn('⚠️  Could not set review_pending status (likely constraint).');
    console.warn('    This is fine for testing; use the admin API to pick a draft.');
    console.log(`➡️  Next step: POST /api/admin/giveaways { action: 'pick-winner', giveawayId: '${giveaway.id}' }`);
  } else {
    console.log('✅ Giveaway set to review_pending with temp_winner');
    console.log('\n➡️  Visit /admin/giveaways/review and approve the winner.');
  }
}

seedReviewGiveaway();