// src/utils/supabase/server-admin.ts

// This client is for server-side code ONLY and should NEVER be exposed to the browser.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Creates a Supabase client with Service Role privileges.
 * WARNING: Use only in secure, server-side environments (Server Actions, Route Handlers).
 */
export async function createAdminSupabaseClient() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseServiceRoleKey || !supabaseUrl) {
    // Surface a clear runtime error that callers can catch
    throw new Error('Missing Supabase environment variables for Service Role access.');
  }

  const supabase = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      // Prevents the client from trying to use cookies/session info
      persistSession: false,
    },
  });
  return supabase;
}