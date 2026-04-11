"use client";

import { createClient } from '@/lib/supabase';

/**
 * Initiates Google OAuth sign-in process.
 * After Google auth the callback route handles session setup and redirects
 * new users to '/' and returning users to '/profile'.
 */
export const signInWithGoogle = async (nextPath = '/') => {
  const supabase = createClient();

  try {
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
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