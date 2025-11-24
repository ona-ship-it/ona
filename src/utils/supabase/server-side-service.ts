import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using the Service Role key.
// This client bypasses RLS and must ONLY be used on the server.
// Required env vars:
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

export default function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      // Do not persist server-side sessions
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}