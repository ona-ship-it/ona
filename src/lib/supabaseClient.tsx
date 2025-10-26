// ---------------------------------------------
// ✅ SUPABASE CLIENT — FULLY TYPED FOR ONAGUI
// ---------------------------------------------

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // Adjust if your types file is elsewhere

// Make sure these are defined in your .env.local or Vercel environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Optionally export a helper for clarity
export type SupabaseClientType = typeof supabase;