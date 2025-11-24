import { supabase } from './supabaseClient';

// Inserts a giveaway draft into the `public.giveaways` table
export async function handleCreateGiveaway(payload) {
  if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');

  const doc = {
    title: payload.title,
    description: payload.description,
    prize_amount: payload.prize_amount,
    ends_at: payload.endsAt instanceof Date ? payload.endsAt.toISOString() : payload.endsAt,
    status: 'draft',
    creator_id: payload.creator_id,
  };

  const { data, error } = await supabase
    .from('giveaways')
    .insert(doc)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}