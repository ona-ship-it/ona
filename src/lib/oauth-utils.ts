"use client";

/**
 * STANDARDIZED OAUTH UTILITIES
 *
 * Provides standardized OAuth authentication flows with consistent redirectTo
 * handling, environment-aware site URL resolution, and safe redirect checks.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { Provider } from '@supabase/supabase-js';

// Default redirect paths for different user types
const DEFAULT_REDIRECTS = {
  admin: '/admin',
  user: '/account',
  fallback: '/',
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
  const encodedRedirectTo = encodeURIComponent(finalRedirectTo);
  return `${siteUrl}/auth/callback?redirectTo=${encodedRedirectTo}`;
}

/**
 * Create Supabase client with standardized cookie options
 */
function createStandardizedSupabaseClient() {
  // Configurable cookie domain and security for multi-domain deploys
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
    },
  });
}

/**
 * Provider-specific default options
 */
function getProviderOptions(provider: OAuthProvider, customOptions?: Record<string, any>) {
  const baseOptions = {
    google: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    discord: {},
    twitter: {},
  } as const;

  return {
    ...baseOptions[provider],
    ...customOptions,
  };
}

/**
 * MAIN: Sign in with OAuth provider
 */
export async function signInWithOAuth(options: OAuthOptions): Promise<OAuthResult> {
  const { provider, redirectTo, customOptions } = options;

  try {
    const supabase = createStandardizedSupabaseClient();
    const callbackUrl = buildCallbackUrl(redirectTo);
    const providerOptions = getProviderOptions(provider, customOptions);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: callbackUrl,
        ...providerOptions,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data?.url };
  } catch (exception) {
    const errorMessage = exception instanceof Error ? exception.message : `${provider} sign-in failed`;
    return { success: false, error: errorMessage };
  }
}

/**
 * Convenience wrappers
 */
export async function signInWithGoogle(redirectTo?: string, customOptions?: Record<string, any>): Promise<OAuthResult> {
  return signInWithOAuth({ provider: 'google', redirectTo, customOptions });
}

export async function signInWithDiscord(redirectTo?: string, customOptions?: Record<string, any>): Promise<OAuthResult> {
  return signInWithOAuth({ provider: 'discord', redirectTo, customOptions });
}

export async function signInWithTwitter(redirectTo?: string, customOptions?: Record<string, any>): Promise<OAuthResult> {
  return signInWithOAuth({ provider: 'twitter', redirectTo, customOptions });
}

/**
 * Utility helpers
 */
export function getRedirectForUserType(userType: 'admin' | 'user' | null): string {
  if (userType === 'admin') return DEFAULT_REDIRECTS.admin;
  if (userType === 'user') return DEFAULT_REDIRECTS.user;
  return DEFAULT_REDIRECTS.fallback;
}

export function isSafeRedirectUrl(url: string): boolean {
  try {
    if (url.startsWith('/')) return true; // Allow relative URLs
    const siteUrl = getSiteUrl();
    const redirectUrl = new URL(url);
    const siteUrlObj = new URL(siteUrl);
    return redirectUrl.origin === siteUrlObj.origin;
  } catch {
    return false;
  }
}

export function sanitizeRedirectUrl(url: string): string {
  if (!url || !isSafeRedirectUrl(url)) {
    return DEFAULT_REDIRECTS.fallback;
  }
  return url;
}

// Legacy compatibility
export { signInWithGoogle as signInWithGoogleLegacy };

