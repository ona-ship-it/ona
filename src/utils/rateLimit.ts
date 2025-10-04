import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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