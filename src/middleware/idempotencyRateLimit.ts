import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In-memory stores for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const idempotencyStore = new Map<string, { response: any; timestamp: number }>();

// Rate limit configurations
const RATE_LIMITS = {
  transfer: { requests: 10, windowMs: 60 * 1000 }, // 10 transfers per minute
  withdraw: { requests: 2, windowMs: 24 * 60 * 60 * 1000 }, // 2 withdrawals per day
  deposit: { requests: 50, windowMs: 60 * 1000 }, // 50 deposit checks per minute
  balance: { requests: 100, windowMs: 60 * 1000 }, // 100 balance checks per minute
};

// Idempotency key expiration (24 hours)
const IDEMPOTENCY_EXPIRATION = 24 * 60 * 60 * 1000;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

interface IdempotencyResult {
  isReplay: boolean;
  response?: any;
  error?: string;
}

/**
 * Clean up expired entries from in-memory stores
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  // Clean up rate limit store
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean up idempotency store
  for (const [key, value] of idempotencyStore.entries()) {
    if (now - value.timestamp > IDEMPOTENCY_EXPIRATION) {
      idempotencyStore.delete(key);
    }
  }
}

/**
 * Check rate limit for a user and operation
 */
export function checkRateLimit(
  userId: string, 
  operation: keyof typeof RATE_LIMITS
): RateLimitResult {
  cleanupExpiredEntries();
  
  const config = RATE_LIMITS[operation];
  const key = `${userId}:${operation}`;
  const now = Date.now();
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || now > existing.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (existing.count >= config.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      error: `Rate limit exceeded for ${operation}. Try again after ${new Date(existing.resetTime).toISOString()}`
    };
  }
  
  // Increment count
  existing.count++;
  rateLimitStore.set(key, existing);
  
  return {
    allowed: true,
    remaining: config.requests - existing.count,
    resetTime: existing.resetTime
  };
}

/**
 * Check idempotency key
 */
export function checkIdempotency(
  idempotencyKey: string,
  userId: string
): IdempotencyResult {
  cleanupExpiredEntries();
  
  if (!idempotencyKey) {
    return {
      isReplay: false,
      error: 'Idempotency-Key header is required for this operation'
    };
  }
  
  // Validate idempotency key format (should be UUID or similar)
  if (!/^[a-zA-Z0-9\-_]{10,}$/.test(idempotencyKey)) {
    return {
      isReplay: false,
      error: 'Invalid Idempotency-Key format. Use a unique string with at least 10 characters.'
    };
  }
  
  const key = `${userId}:${idempotencyKey}`;
  const existing = idempotencyStore.get(key);
  
  if (existing) {
    return {
      isReplay: true,
      response: existing.response
    };
  }
  
  return {
    isReplay: false
  };
}

/**
 * Store idempotency response
 */
export function storeIdempotencyResponse(
  idempotencyKey: string,
  userId: string,
  response: any
): void {
  const key = `${userId}:${idempotencyKey}`;
  idempotencyStore.set(key, {
    response,
    timestamp: Date.now()
  });
}

/**
 * Middleware function for Next.js API routes
 */
export function withIdempotencyAndRateLimit(
  operation: keyof typeof RATE_LIMITS,
  requireIdempotency = true
) {
  return function middleware(handler: Function) {
    return async function(req: NextRequest) {
      try {
        // Extract user ID from request (assuming it's in headers or JWT)
        const userId = req.headers.get('x-user-id') || 'anonymous';
        
        if (userId === 'anonymous') {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        // Check rate limit
        const rateLimitResult = checkRateLimit(userId, operation);
        
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { 
              error: rateLimitResult.error,
              retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': RATE_LIMITS[operation].requests.toString(),
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
              }
            }
          );
        }
        
        // Check idempotency for POST requests
        if (req.method === 'POST' && requireIdempotency) {
          const idempotencyKey = req.headers.get('idempotency-key');
          const idempotencyResult = checkIdempotency(idempotencyKey || '', userId);
          
          if (idempotencyResult.error) {
            return NextResponse.json(
              { error: idempotencyResult.error },
              { status: 400 }
            );
          }
          
          if (idempotencyResult.isReplay) {
            // Return cached response
            return NextResponse.json(idempotencyResult.response, {
              headers: {
                'X-Idempotency-Replay': 'true'
              }
            });
          }
          
          // Execute the handler
          const response = await handler(req);
          const responseData = await response.json();
          
          // Store response for idempotency
          if (response.status < 400 && idempotencyKey) {
            storeIdempotencyResponse(idempotencyKey, userId, responseData);
          }
          
          return NextResponse.json(responseData, {
            status: response.status,
            headers: {
              'X-RateLimit-Limit': RATE_LIMITS[operation].requests.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
            }
          });
        }
        
        // Execute the handler for non-POST requests or when idempotency is not required
        const response = await handler(req);
        
        // Add rate limit headers
        if (response instanceof NextResponse) {
          response.headers.set('X-RateLimit-Limit', RATE_LIMITS[operation].requests.toString());
          response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
          response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
          return response;
        }
        
        return response;
        
      } catch (error: any) {
        console.error('Middleware error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Database-backed rate limiting (for production use with Supabase)
 */
export class DatabaseRateLimit {
  private supabase: any;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  async checkRateLimit(
    userId: string, 
    operation: keyof typeof RATE_LIMITS
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[operation];
    const windowStart = new Date(Date.now() - config.windowMs);
    
    try {
      // Count requests in the current window
      const { data, error } = await this.supabase
        .from('rate_limit_log')
        .select('id')
        .eq('user_id', userId)
        .eq('operation', operation)
        .gte('created_at', windowStart.toISOString());
      
      if (error) {
        console.error('Rate limit check error:', error);
        // Fail open - allow the request
        return {
          allowed: true,
          remaining: config.requests - 1,
          resetTime: Date.now() + config.windowMs
        };
      }
      
      const currentCount = data?.length || 0;
      
      if (currentCount >= config.requests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + config.windowMs,
          error: `Rate limit exceeded for ${operation}`
        };
      }
      
      // Log this request
      await this.supabase
        .from('rate_limit_log')
        .insert({
          user_id: userId,
          operation,
          created_at: new Date().toISOString()
        });
      
      return {
        allowed: true,
        remaining: config.requests - currentCount - 1,
        resetTime: Date.now() + config.windowMs
      };
      
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow the request
      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime: Date.now() + config.windowMs
      };
    }
  }
  
  async checkIdempotency(
    idempotencyKey: string,
    userId: string
  ): Promise<IdempotencyResult> {
    if (!idempotencyKey) {
      return {
        isReplay: false,
        error: 'Idempotency-Key header is required'
      };
    }
    
    try {
      const { data, error } = await this.supabase
        .from('idempotency_log')
        .select('response_data')
        .eq('user_id', userId)
        .eq('idempotency_key', idempotencyKey)
        .gte('created_at', new Date(Date.now() - IDEMPOTENCY_EXPIRATION).toISOString())
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Idempotency check error:', error);
        return { isReplay: false };
      }
      
      if (data) {
        return {
          isReplay: true,
          response: data.response_data
        };
      }
      
      return { isReplay: false };
      
    } catch (error) {
      console.error('Idempotency error:', error);
      return { isReplay: false };
    }
  }
  
  async storeIdempotencyResponse(
    idempotencyKey: string,
    userId: string,
    response: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('idempotency_log')
        .insert({
          user_id: userId,
          idempotency_key: idempotencyKey,
          response_data: response,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing idempotency response:', error);
    }
  }
}

// Utility functions for manual rate limit management
export const rateLimitUtils = {
  getRateLimitInfo: (userId: string, operation: keyof typeof RATE_LIMITS) => {
    const key = `${userId}:${operation}`;
    const existing = rateLimitStore.get(key);
    const config = RATE_LIMITS[operation];
    
    if (!existing || Date.now() > existing.resetTime) {
      return {
        remaining: config.requests,
        resetTime: Date.now() + config.windowMs,
        used: 0
      };
    }
    
    return {
      remaining: config.requests - existing.count,
      resetTime: existing.resetTime,
      used: existing.count
    };
  },
  
  clearRateLimit: (userId: string, operation: keyof typeof RATE_LIMITS) => {
    const key = `${userId}:${operation}`;
    rateLimitStore.delete(key);
  },
  
  clearAllRateLimits: () => {
    rateLimitStore.clear();
  },
  
  getIdempotencyInfo: (userId: string, idempotencyKey: string) => {
    const key = `${userId}:${idempotencyKey}`;
    const existing = idempotencyStore.get(key);
    
    return {
      exists: !!existing,
      timestamp: existing?.timestamp,
      isExpired: existing ? (Date.now() - existing.timestamp > IDEMPOTENCY_EXPIRATION) : false
    };
  }
};

/**
 * Combined function to check both rate limiting and idempotency
 * This function is used by the API routes that were calling the non-existent checkIdempotencyAndRateLimit
 */
export async function checkIdempotencyAndRateLimit(
  req: any,
  res: any,
  operation: keyof typeof RATE_LIMITS,
  userId: string
): Promise<{ allowed: boolean; error?: string; response?: any }> {
  // Get idempotency key from headers
  const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  
  // Check rate limiting first
  const rateLimitResult = checkRateLimit(userId, operation);
  if (!rateLimitResult.allowed) {
    return {
      allowed: false,
      error: 'Rate limit exceeded'
    };
  }
  
  // Check idempotency if key is provided
  if (idempotencyKey) {
    const idempotencyResult = checkIdempotency(idempotencyKey, userId);
    if (idempotencyResult.error) {
      return {
        allowed: false,
        error: idempotencyResult.error
      };
    }
    
    if (idempotencyResult.isReplay && idempotencyResult.response) {
      return {
        allowed: false,
        response: idempotencyResult.response
      };
    }
  }
  
  return { allowed: true };
}