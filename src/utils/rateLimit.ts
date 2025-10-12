import { createClient } from '@supabase/supabase-js';

// Lazily initialize Supabase inside the function to avoid build-time env errors
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  // Prefer service role; fallback to anon key if available to avoid hard failure
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    return null;
  }
  return createClient(url, key);
}

/**
 * Simple rate limiting implementation using Supabase
 * @param identifier - IP address or user ID
 * @param action - The action being rate limited (e.g., 'ticket_purchase')
 * @param limit - Maximum number of requests allowed per minute
 * @returns boolean - true if rate limited, false otherwise
 */
export async function rateLimit(
  identifier: string,
  action: string,
  limit: number
): Promise<boolean> {
  const supabase = getSupabaseClient();
  // If Supabase is not configured, skip rate limiting gracefully
  if (!supabase) {
    return false;
  }
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  
  // Clean up old rate limit entries
  await supabase
    .from('rate_limits')
    .delete()
    .lt('created_at', oneMinuteAgo.toISOString());
  
  // Count recent requests
  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .eq('action', action)
    .gte('created_at', oneMinuteAgo.toISOString());
  
  if (error) {
    console.error('Error checking rate limit:', error);
    return false; // Don't rate limit on errors
  }
  
  // If under the limit, record this request
  if (count !== null && count < limit) {
    await supabase
      .from('rate_limits')
      .insert({
        identifier,
        action,
        created_at: now.toISOString()
      });
    return false; // Not rate limited
  }
  
  return true; // Rate limited
}