/**
 * CLEAN MIDDLEWARE - ALIGNED WITH NEW ADMIN SCHEMA
 * 
 * This middleware uses the clean admin schema:
 * - Primary check: onagui_profiles.is_admin = true
 * - Secondary validation: onagui_type enum values
 * - Emergency fallback: hardcoded admin emails
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic IP-based token bucket for rate limiting /api/giveaways
const RATE_LIMIT_MAX = 60; // max requests per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const buckets = new Map<string, { tokens: number; lastRefill: number }>();

function getClientIp(request: NextRequest): string {
  const xfwd = request.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0].trim();
  // NextRequest may expose ip depending on runtime; fallback to remote address-like header
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { tokens: RATE_LIMIT_MAX, lastRefill: now };
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= RATE_LIMIT_WINDOW_MS) {
    const windowsPassed = Math.floor(elapsed / RATE_LIMIT_WINDOW_MS);
    bucket.tokens = Math.min(RATE_LIMIT_MAX, bucket.tokens + windowsPassed * RATE_LIMIT_MAX);
    bucket.lastRefill = now;
  }
  if (bucket.tokens <= 0) {
    buckets.set(ip, bucket);
    return true;
  }
  bucket.tokens -= 1;
  buckets.set(ip, bucket);
  return false;
}

// Admin email whitelist (includes known admins and env-configured email)
const ADMIN_EMAIL_WHITELIST = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'samiraeddaoudi88@gmail.com',
  'richtheocrypto@gmail.com',
  'admin@onagui.com',
  'youremail@example.com',
].filter(Boolean) as string[];

// Routes that require authentication
const protectedRoutes = ['/profile', '/account']
// Admin page routes (UI)
const adminRoutes = ['/admin', '/emergency-admin', '/dashboard', '/giveaways/review']
// Admin API routes (must never bypass in dev)
const adminApiRoutes = ['/api/admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  const previewFlag = request.nextUrl.searchParams.get('preview')
  
  console.log(`🔍 [Middleware] Processing request to: ${pathname}`)
  console.log(`🔍 [Middleware] NODE_ENV: ${process.env.NODE_ENV}`)

  // --- Preview bypass: allow UI inspection only in dev or when explicitly enabled
  const previewBypassEnabled =
    process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_PREVIEW_BYPASS === '1'
  if (previewBypassEnabled && previewFlag === '1' && pathname.startsWith('/admin')) {
    console.log(`🧪 [Middleware] PREVIEW BYPASS enabled for: ${pathname}`)
    return response
  }

  // --- Admin/service-role fast path: allow server-to-server for /api/admin and /admin
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      if (token === process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // ✅ Service-to-service access granted
        return NextResponse.next()
      }
    }
  }

  // Rate limit public giveaways API
  if (pathname.startsWith('/api/giveaways')) {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
  }
  
  // DEVELOPMENT BYPASS: Allow admin access without authentication in development (UI routes only)
  if (process.env.NODE_ENV === 'development') {
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route))
    
    if (isAdminRoute && !isAdminApiRoute) {
      console.log(`🚧 [Middleware] DEVELOPMENT BYPASS: Allowing admin access to ${pathname}`)
      return response
    }
  }
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route)) || adminApiRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute || isAdminRoute) {
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.log(`🚫 [Middleware] No session for protected route: ${pathname}`)
      // API admin routes should return JSON 401; UI routes redirect to signin
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const redirectUrl = new URL('/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For admin routes, perform admin check
    if (isAdminRoute) {
      const userId = session.user.id
      const userEmail = session.user.email
      
      console.log(`🔍 [Middleware] Checking admin access for: ${userEmail} (${userId})`)
      
      // Emergency admin check first
      if (userEmail && ADMIN_EMAIL_WHITELIST.includes(userEmail)) {
        console.log(`🚨 [Middleware] Emergency admin access granted: ${userEmail}`)
        return response
      }
      
      try {
        // Check admin via API endpoint to centralize logic
        const apiUrl = new URL('/api/auth/is-admin', request.url)
        const apiResp = await fetch(apiUrl.toString(), {
          headers: { cookie: request.headers.get('cookie') ?? '' },
        })

        if (!apiResp.ok) {
          console.error(`💥 [Middleware] is-admin API error: status=${apiResp.status}`)
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        const adminData = await apiResp.json()
        const isAdmin = !!adminData?.isAdmin

        if (!isAdmin) {
          console.log(`❌ [Middleware] Admin access denied for: ${userEmail}`)
          // API admin routes: JSON 403; UI routes: redirect
          if (pathname.startsWith('/api/admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
        
        console.log(`✅ [Middleware] Admin access granted for: ${userEmail}`)
        
      } catch (error) {
        console.error(`💥 [Middleware] Admin check error:`, error)
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/emergency-admin/:path*',
    '/dashboard/:path*',
    '/giveaways/review/:path*',
    '/profile/:path*',
    '/account/:path*',
    '/api/giveaways',
    '/api/admin/:path*',
  ],
}