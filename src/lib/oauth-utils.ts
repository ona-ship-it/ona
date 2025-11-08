/**
 * STANDARDIZED OAUTH UTILITIES
 * 
 * This module provides standardized OAuth authentication flows with consistent
 * redirectTo parameter handling across all providers and components.
 * 
 * Key features:
 * - Consistent redirectTo parameter extraction and encoding
 * - Standardized callback URL construction
 * - Environment-aware site URL handling
 * - Error handling and logging
 * - Support for all OAuth providers (Google, Discord, Twitter/X)
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { Provider } from '@supabase/supabase-js';

// Default redirect paths for different user types
const DEFAULT_REDIRECTS = {
  admin: '/admin',
  user: '/account',
  fallback: '/'
} as const;

// Supported OAuth providers
export type OAuthProvider = 'google' | 'discord' | 'twitter';

// OAuth configuration options
export interface OAuthOptions {
  provider: OAuthProvider;
  redirectTo?: string;
  customOptions?: Record<string, any>;
}

// OAuth result type
export interface OAuthResult {
  success: boolean;
  error?: string;
  url?: string;
}

/**
 * Get the current site URL based on environment
 */
function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Extract redirectTo parameter from current URL
 */
function getRedirectToFromUrl(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_REDIRECTS.fallback;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirectTo') || DEFAULT_REDIRECTS.fallback;
}

/**
 * Construct standardized callback URL with redirectTo parameter
 */
function buildCallbackUrl(redirectTo?: string): string {
  const siteUrl = getSiteUrl();
  const finalRedirectTo = redirectTo || getRedirectToFromUrl();
  
  // Ensure redirectTo is properly encoded
  const encodedRedirectTo = encodeURIComponent(finalRedirectTo);
  
  return `${siteUrl}/auth/callback?redirectTo=${encodedRedirectTo}`;
}

/**
 * Create Supabase client with standardized cookie options
 */
function createStandardizedSupabaseClient() {
  // Make cookie domain configurable to avoid breaking OAuth on different deploy domains
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;
  const secureCookies = process.env.NEXT_PUBLIC_COOKIE_SECURE
    ? process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true'
    : process.env.NODE_ENV === 'production';

  return createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: cookieDomain,
      secure: secureCookies,
      sameSite: 'lax',
    }
  });
}

/**
 * Get provider-specific OAuth options
 */
function getProviderOptions(provider: OAuthProvider, customOptions?: Record<string, any>) {
  const baseOptions = {
    google: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
    discord: {},
    twitter: {}
  };

  return {
    ...baseOptions[provider],
    ...customOptions
  };
}

/**
 * MAIN OAUTH FUNCTION: Sign in with OAuth provider
 * 
 * This is the canonical function for all OAuth authentication flows.
 * Use this instead of calling signInWithOAuth directly.
 */
export async function signInWithOAuth(options: OAuthOptions): Promise<OAuthResult> {
  const { provider, redirectTo, customOptions } = options;
  
  console.log(`🔐 [OAuth] Starting ${provider} authentication flow`);
  console.log(`📍 [OAuth] Redirect target: ${redirectTo || 'auto-detected'}`);
  
  try {
    const supabase = createStandardizedSupabaseClient();
    const callbackUrl = buildCallbackUrl(redirectTo);
    const providerOptions = getProviderOptions(provider, customOptions);
    
    console.log(`🔗 [OAuth] Callback URL: ${callbackUrl}`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: callbackUrl,
        ...providerOptions
      }
    });

    if (error) {
      console.error(`❌ [OAuth] ${provider} authentication failed:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }

    console.log(`✅ [OAuth] ${provider} authentication initiated successfully`);
    return {
      success: true,
      url: data?.url
    };
    
  } catch (exception) {
    const errorMessage = exception instanceof Error ? exception.message : `${provider} sign-in failed`;
    console.error(`💥 [OAuth] ${provider} authentication exception:`, exception);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * CONVENIENCE FUNCTIONS: Provider-specific wrappers
 */

export async function signInWithGoogle(redirectTo?: string, customOptions?: Record<string, any>): Promise<OAuthResult> {
  return signInWithOAuth({
    provider: 'google',
    redirectTo,
    customOptions
  });
}

export async function signInWithDiscord(redirectTo?: string, customOptions?: Record<string, any>): Promise<OAuthResult> {
  return signInWithOAuth({
    provider: 'discord',
    redirectTo,
    customOptions
  });
}

export async function signInWithTwitter(redirectTo?: string, customOptions?: Record<string, any>): Promise<OAuthResult> {
  return signInWithOAuth({
    provider: 'twitter',
    redirectTo,
    customOptions
  });
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get the appropriate redirect path for a user type
 */
export function getRedirectForUserType(userType: 'admin' | 'user' | null): string {
  if (userType === 'admin') return DEFAULT_REDIRECTS.admin;
  if (userType === 'user') return DEFAULT_REDIRECTS.user;
  return DEFAULT_REDIRECTS.fallback;
}

/**
 * Check if a redirect URL is safe (prevents open redirect attacks)
 */
export function isSafeRedirectUrl(url: string): boolean {
  try {
    // Allow relative URLs
    if (url.startsWith('/')) {
      return true;
    }
    
    // Allow same-origin URLs
    const siteUrl = getSiteUrl();
    const redirectUrl = new URL(url);
    const siteUrlObj = new URL(siteUrl);
    
    return redirectUrl.origin === siteUrlObj.origin;
  } catch {
    return false;
  }
}

/**
 * Sanitize redirect URL to prevent open redirect attacks
 */
export function sanitizeRedirectUrl(url: string): string {
  if (!url || !isSafeRedirectUrl(url)) {
    console.warn(`🚨 [OAuth] Unsafe redirect URL detected: ${url}, using fallback`);
    return DEFAULT_REDIRECTS.fallback;
  }
  
  return url;
}

/**
 * LEGACY COMPATIBILITY: Export the old function name for backward compatibility
 */
export { signInWithGoogle as signInWithGoogleLegacy };