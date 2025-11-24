'use server';

import { createAdminSupabaseClient } from '@/utils/supabase/server-admin';
import { createClient as createServerSupabaseClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createGiveaway(formData: FormData) {
  // 1. Get the authenticated user using SSR client (cookie-based session)
  const userSupabase = await createServerSupabaseClient();
  let { data: { session } } = await userSupabase.auth.getSession();
  let user = session?.user ?? null;

  // Fallback to server verification API in case of cookie propagation edge cases
  if (!user) {
    try {
      const res = await fetch('/api/verify-session', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        user = json?.user ?? null;
      }
    } catch (_) {
      // swallow; will error below
    }
  }

  if (!user) {
    throw new Error('User not authenticated.');
  }

  // 2. Security Check: Verify Admin Role
  // Check if user has admin status in metadata via Service Role client
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

  // 4. Insert data into the database (use Service Role to bypass RLS for admin)
  const { data, error } = await (adminSupabase as any)
    .from('giveaways')
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    console.error('Database insertion error:', error);
    const msg = [
      'DB insert failed:',
      error.message,
      error.details || '',
      error.hint || ''
    ].filter(Boolean).join(' ');
    throw new Error(msg);
  }

  // 5. Success: Revalidate and Redirect
  revalidatePath('/giveaways'); // Clear cache for the main giveaway list
  redirect(`/giveaways/${data.id}`); // Redirect to the new giveaway page
}