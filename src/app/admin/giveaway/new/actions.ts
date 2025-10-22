'use server';

import { createAdminSupabaseClient } from '@/utils/supabase/server-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createGiveaway(formData: FormData) {
  // 1. Get the authenticated user
  const supabase = await createAdminSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated.');
  }

  // 2. Security Check: Verify Admin Role
  // Check if user has admin status in metadata
  const adminSupabase = await createAdminSupabaseClient();
  const { data: fullUser, error: adminCheckError } = await adminSupabase.auth.admin.getUserById(user.id);
  
  if (adminCheckError || !fullUser?.user?.user_metadata?.is_admin) {
    throw new Error('Authorization failed: User is not an admin.');
  }

  // 3. Extract and Validate Form Data
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const ticket_price = Number(formData.get('entry_cost')) || 0;
  const prize_amount = Number(formData.get('prize_amount')) || 100; // Default prize amount
  const ends_at = formData.get('ends_at') as string;
  const photo_url = formData.get('image_url') as string;

  if (!title || !description || !ends_at) {
    throw new Error('Missing required form fields.');
  }

  // 4. Insert data into the database
  const { data, error } = await supabase.from('giveaways').insert({
    title,
    description,
    ticket_price,
    prize_amount,
    prize_pool_usdt: prize_amount, // Initial prize pool equals the prize amount
    ends_at,
    photo_url,
    creator_id: user.id,
    status: 'active', // Admin giveaways are active by default
    escrow_amount: 0, // Admin bypass escrow
  }).select().single();

  if (error) {
    console.error('Database insertion error:', error);
    throw new Error('Failed to post giveaway. Check logs.');
  }

  // 5. Success: Revalidate and Redirect
  revalidatePath('/giveaways'); // Clear cache for the main giveaway list
  redirect(`/giveaways/${data.id}`); // Redirect to the new giveaway page
}