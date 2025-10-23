"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from '@/types/supabase';

/**
 * Initiates Google OAuth sign-in process
 * This function handles the same sign-in flow as the GoogleSignIn component
 */
export const signInWithGoogle = async () => {
  const supabase = createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  });
  
  try {
    // Get the redirectTo parameter from URL if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('redirectTo') || '/';
    const callbackUrl = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectPath)}`;
    
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "google", 
      options: { 
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }, 
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (err) {
    console.error("Google sign-in error:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Sign-in failed' 
    };
  }
};