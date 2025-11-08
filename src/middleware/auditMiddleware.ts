import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { logSecurityEvent } from '../utils/auditLogger';

/**
 * Middleware to log sensitive operations for audit purposes
 * This middleware will run on admin routes and sensitive API endpoints
 */
export async function auditMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Only audit specific paths
  const path = req.nextUrl.pathname;
  if (!shouldAuditPath(path)) {
    return res;
  }
  
  try {
    // Get user information
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    
    // Log the access
    const details = {
      path,
      method: req.method,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    };
    
    await logSecurityEvent(userId, 'access', details);
  } catch (error) {
    console.error('Error in audit middleware:', error);
    // Continue processing even if logging fails
  }
  
  return res;
}

/**
 * Determine if a path should be audited
 */
function shouldAuditPath(path: string): boolean {
  const sensitivePathPatterns = [
    /^\/admin\/.*/,           // All admin routes
    /^\/api\/admin\/.*/,      // Admin API endpoints
    /^\/api\/wallet\/.*/,     // Wallet operations
    /^\/api\/tickets\/buy$/,  // Ticket purchases
  ];
  
  return sensitivePathPatterns.some(pattern => pattern.test(path));
}