"use client"; 

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 
import { useMemo } from "react"; 

/** 
 * Hook: useSupabaseClient 
 * Returns a memoized Supabase client for client components. 
 */ 
export function useSupabaseClient() { 
  const supabase = useMemo(() => createClientComponentClient(), []); 
  return supabase; 
}