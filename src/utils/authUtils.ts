// Authentication utility functions for handling token issues
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Helper function to create Supabase client with proper cookie configuration
const createSupabaseClient = () => createClientComponentClient<Database>({
  cookieOptions: {
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
});

/**
 * Clear all authentication tokens and reset auth state
 * Use this when encountering "Invalid Refresh Token" errors
 */
export async function clearAuthTokens() {
  try {
    const supabase = createSupabaseClient();
    
    // Sign out from Supabase (this clears server-side session)
    await supabase.auth.signOut();
    
    // Clear all localStorage items related to Supabase
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear all sessionStorage items related to Supabase
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('✅ Authentication tokens cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth tokens:', error);
    return false;
  }
}

/**
 * Check if the current session is valid
 */
export async function validateSession() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    
    return !!data?.session;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }
    
    return !!data?.session;
  } catch (error) {
    console.error('Session refresh failed:', error);
    return false;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return '';
}

/**
 * Handle authentication errors gracefully
 */
export async function handleAuthError(error: unknown) {
  const message = getErrorMessage(error);
  if (message.includes('Invalid Refresh Token') || 
      message.includes('Refresh Token Not Found')) {
    console.log('🔄 Detected invalid refresh token, clearing auth state...');
    await clearAuthTokens();
    
    // Redirect to home page to restart auth flow
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return true;
  }
  
  return false;
}