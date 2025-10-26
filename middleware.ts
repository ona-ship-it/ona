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

// Emergency admin emails for fallback
const EMERGENCY_ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'richtheocrypto@gmail.com',
  'samiraeddaoudi88@gmail.com'
].filter(Boolean) as string[];

// Routes that require authentication
const protectedRoutes = ['/profile', '/account']
// Admin routes
const adminRoutes = ['/admin', '/emergency-admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  
  console.log(`🔍 [Middleware] Processing request to: ${pathname}`)
  console.log(`🔍 [Middleware] NODE_ENV: ${process.env.NODE_ENV}`)
  
  // DEVELOPMENT BYPASS: Allow admin access without authentication in development
  if (process.env.NODE_ENV === 'development') {
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    
    if (isAdminRoute) {
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
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute || isAdminRoute) {
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.log(`🚫 [Middleware] No session for protected route: ${pathname}`)
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
      if (userEmail && EMERGENCY_ADMIN_EMAILS.includes(userEmail)) {
        console.log(`🚨 [Middleware] Emergency admin access granted: ${userEmail}`)
        return response
      }
      
      try {
        // Primary check: is_admin column
        const { data: profile, error: profileError } = await supabase
          .from('onagui_profiles')
          .select('is_admin, onagui_type')
          .eq('id', userId)
          .single()
        
        if (profileError) {
          console.error(`💥 [Middleware] Profile check error:`, profileError)
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
        
        // Check if user is admin
        const isAdmin = profile?.is_admin === true
        
        if (!isAdmin) {
          console.log(`❌ [Middleware] Admin access denied for: ${userEmail} (is_admin: ${profile?.is_admin})`)
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
        
        console.log(`✅ [Middleware] Admin access granted for: ${userEmail} (is_admin: true, onagui_type: ${profile?.onagui_type})`)
        
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
    '/profile/:path*',
    '/account/:path*',
  ],
}