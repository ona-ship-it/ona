import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { Giveaway, GiveawayWithTickets, Ticket, BuyTicketPayload, DonateToPoolPayload } from '../types/giveaways';

// Create a Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Fetch active giveaways
export const getActiveGiveaways = async (): Promise<GiveawayWithTickets[]> => {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*, tickets(*)')
    .eq('is_active', true);
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

// Fetch a single giveaway by ID
export async function fetchGiveawayById(id: string): Promise<GiveawayWithTickets | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  const { data, error } = await supabase
    .from('giveaways')
    .select(`
      *,
      tickets(*)
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data as GiveawayWithTickets;
}

// Create a new giveaway
export const createGiveaway = async (giveaway: Omit<Giveaway, 'id' | 'created_at' | 'updated_at'>): Promise<Giveaway> => {
  
  const { data, error } = await supabase
    .from('giveaways')
    .insert(giveaway)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

// Activate a giveaway (changes status to active and locks escrow)
export async function activateGiveaway(id: string): Promise<Giveaway> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  // First get the giveaway to check prize amount
  const { data: giveaway, error: fetchError } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    throw fetchError;
  }
  
  if (!giveaway) {
    throw new Error('Giveaway not found');
  }
  
  // Call the Edge Function to handle the escrow locking
  const { data, error } = await supabase.functions.invoke('activate-giveaway', {
    body: { giveaway_id: id }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Buy tickets for a giveaway
export const buyTickets = async (payload: BuyTicketPayload): Promise<Ticket[]> => {
  
  // Call the Edge Function to handle ticket purchase
  const { data, error } = await supabase.functions.invoke('buy-ticket', {
    body: payload
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Donate to giveaway prize pool
export async function donateToPool(payload: DonateToPoolPayload): Promise<void> {
  
  // Call the Edge Function to handle donation
  const { error } = await supabase.functions.invoke('donate-to-pool', {
    body: payload
  });
  
  if (error) {
    throw error;
  }
}

// Get user's tickets for a specific giveaway
export async function getUserTickets(giveawayId: string): Promise<Ticket[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('giveaway_id', giveawayId)
    .eq('user_id', user.id);
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

// Trigger winner selection for a giveaway
export async function triggerPickWinner(giveawayId: string): Promise<{ success: boolean; message?: string } | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  // Call the Edge Function to handle winner selection
  const { data, error } = await supabase.functions.invoke('trigger-pick-winner', {
    body: { giveaway_id: giveawayId }
  });
  
  if (error) {
    throw error;
  }
  
  return (data as { success: boolean; message?: string } | null);
}

// Payout to winner
export async function payoutWinner(giveawayId: string): Promise<{ success: boolean; message?: string } | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  // Call the Edge Function to handle payout
  const { data, error } = await supabase.functions.invoke('payout-winner', {
    body: { giveaway_id: giveawayId }
  });
  
  if (error) {
    throw error;
  }
  
  return (data as { success: boolean; message?: string } | null);
}