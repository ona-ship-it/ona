// ---------------------------------------------
// ✅ SUPABASE CLIENT — FULLY TYPED FOR ONAGUI
// ---------------------------------------------

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // Adjust if your types file is elsewhere

// Make sure these are defined in your .env.local or Vercel environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a typed Supabase client
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);

// Export a createClient function for compatibility with the review components
export const createClient = () => supabase;

// Optionally export a helper for clarity
export type SupabaseClientType = typeof supabase;