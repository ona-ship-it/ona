"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

/**
 * Standardized OAuth utility for consistent redirectTo parameter handling
 * across all authentication flows in the ona-production application.
 */

/**
 * Gets the site URL based on environment
 */
function getSiteUrl(): string {
  // During development, always standardize to http://localhost:3000
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    return 'http://localhost:3000';
  }

  // Production: prefer the actual origin in the browser
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // SSR fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Constructs a callback URL with proper redirectTo parameter
 */
function constructCallbackUrl(redirectTo?: string): string {
  const siteUrl = getSiteUrl();
  const finalRedirectTo = redirectTo || '/';
  return `${siteUrl}/api/auth/callback?redirectTo=${encodeURIComponent(finalRedirectTo)}`;
}

/**
 * Creates a Supabase client with consistent configuration
 */
function createOAuthClient() {
  return createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  });
}

/**
 * Standardized Google OAuth sign-in
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createOAuthClient();
  
  try {
    // If no redirectTo provided, try to get from URL params
    if (!redirectTo && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      redirectTo = urlParams.get('redirectTo') || '/';
    }
    
    const callbackUrl = constructCallbackUrl(redirectTo);
    
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
      console.error("Google OAuth error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
    console.error("Google sign-in error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Standardized Discord OAuth sign-in
 */
export async function signInWithDiscord(redirectTo?: string) {
  const supabase = createOAuthClient();
  
  try {
    // If no redirectTo provided, try to get from URL params
    if (!redirectTo && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      redirectTo = urlParams.get('redirectTo') || '/';
    }
    
    const callbackUrl = constructCallbackUrl(redirectTo);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: callbackUrl,
      },
    });
    
    if (error) {
      console.error("Discord OAuth error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Discord sign-in failed';
    console.error("Discord sign-in error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Standardized Twitter/X OAuth sign-in
 */
export async function signInWithTwitter(redirectTo?: string) {
  const supabase = createOAuthClient();
  
  try {
    // If no redirectTo provided, try to get from URL params
    if (!redirectTo && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      redirectTo = urlParams.get('redirectTo') || '/';
    }
    
    const callbackUrl = constructCallbackUrl(redirectTo);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: callbackUrl,
      },
    });
    
    if (error) {
      console.error("Twitter OAuth error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Twitter sign-in failed';
    console.error("Twitter sign-in error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Generic OAuth sign-in function for any provider
 */
export async function signInWithOAuth(
  provider: 'google' | 'discord' | 'twitter',
  redirectTo?: string
) {
  switch (provider) {
    case 'google':
      return signInWithGoogle(redirectTo);
    case 'discord':
      return signInWithDiscord(redirectTo);
    case 'twitter':
      return signInWithTwitter(redirectTo);
    default:
      return { success: false, error: `Unsupported OAuth provider: ${provider}` };
  }
}