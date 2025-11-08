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

async function main() {
  console.log('🧪 Testing admin review flow with fallback logic...');

  // 1) Find the latest seeded giveaway
  const { data: giveaways, error: gErr } = await supabase
    .from('giveaways')
    .select('id, title, status, temp_winner_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (gErr || !giveaways?.length) {
    console.error('❌ No giveaways found. Run scripts/seed-review-giveaway.mjs first.');
    process.exit(1);
  }

  const giveaway = giveaways[0];
  console.log(`➡️ Using giveaway: ${giveaway.id} (${giveaway.title}) [${giveaway.status}]`);

  // 2) Pick draft winner (fallback)
  const { data: ticket, error: tErr } = await supabase
    .from('tickets')
    .select('user_id')
    .eq('giveaway_id', giveaway.id)
    .limit(1)
    .single();

  if (tErr || !ticket) {
    console.error('❌ No tickets for this giveaway. Seed tickets first.');
    process.exit(1);
  }

  const { error: upErr } = await supabase
    .from('giveaways')
    .update({ temp_winner_id: ticket.user_id, updated_at: new Date().toISOString() })
    .eq('id', giveaway.id);

  if (upErr) {
    console.error('❌ Failed to set temp winner:', upErr.message);
    process.exit(1);
  }

  await supabase.from('giveaway_audit').insert({ giveaway_id: giveaway.id, action: 'draft_winner', target_id: ticket.user_id, note: 'Test flow fallback draft' });
  console.log('✅ Draft winner set (fallback):', ticket.user_id);

  // 3) Finalize winner (fallback)
  const { error: finErr } = await supabase
    .from('giveaways')
    .update({ winner_id: ticket.user_id, status: 'completed', escrow_status: 'released', updated_at: new Date().toISOString() })
    .eq('id', giveaway.id);

  if (finErr) {
    console.error('❌ Failed to finalize winner:', finErr.message);
    process.exit(1);
  }

  await supabase.from('giveaway_audit').insert({ giveaway_id: giveaway.id, action: 'winner_finalized', target_id: ticket.user_id, note: 'Test flow fallback finalize' });
  await supabase.from('giveaway_audit').insert({ giveaway_id: giveaway.id, action: 'escrow_released', note: 'Test flow fallback escrow release' });
  console.log('✅ Winner finalized and escrow released (fallback)');

  // 4) Fetch audit trail
  const { data: auditTrail, error: auditErr } = await supabase
    .from('giveaway_audit')
    .select('action, created_at')
    .eq('giveaway_id', giveaway.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (auditErr) {
    console.error('⚠️  Failed to fetch audit trail:', auditErr.message);
  } else {
    console.log('📜 Recent audit trail:');
    for (const row of auditTrail) {
      console.log(` - ${row.created_at}: ${row.action}`);
    }
  }

  console.log('\n✅ Admin review flow test complete.');
}

main();