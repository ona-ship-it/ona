"use client"; 

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 
import { useMemo } from "react"; 
import type { Database } from '@/types/supabase';

/** 
 * Hook: useSupabaseClient 
 * Returns a memoized Supabase client for client components with proper cookie configuration. 
 */ 
export function useSupabaseClient() { 
  const supabase = useMemo(() => createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  }), []); 
  return supabase; 
}