"use client";

import { signInWithGoogle as standardSignInWithGoogle } from "@/lib/oauth-utils";

/**
 * Initiates Google OAuth sign-in process
 * This function uses the standardized OAuth utility for consistent redirectTo handling
 * 
 * @deprecated Use signInWithGoogle from @/lib/oauth-utils directly
 */
export const signInWithGoogle = async (redirectTo?: string) => {
  try {
    const result = await standardSignInWithGoogle(redirectTo);
    
    return {
      success: result.success,
      error: result.error
    };
  } catch (err) {
    console.error("Google sign-in error:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Sign-in failed' 
    };
  }
};