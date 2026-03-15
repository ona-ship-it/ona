// src/utils/supabase/server-admin.ts

// This client is for server-side code ONLY and should NEVER be exposed to the browser.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Creates a Supabase client with Service Role privileges.
 * WARNING: Use only in secure, server-side environments (Server Actions, Route Handlers).
 * Environment variables are checked at call time (not import time) to avoid build errors.
 */
export async function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for Service Role access.');
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
  return supabase;
}