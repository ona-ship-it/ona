import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/profile', '/account']
// Admin routes
const adminRoutes = ['/admin']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  // Check if the route is admin-only
  const isAdminRoute = adminRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtectedRoute || isAdminRoute) {
    const { data: { session } } = await supabase.auth.getSession()
    
    // If no session and trying to access protected route, redirect to login
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // For admin routes, check if user is admin
    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from('onagui_profiles')
        .select('onagui_type')
        .eq('id', session.user.id)
        .single()
      
      if (!profile || profile.onagui_type !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  } else {
    // For non-protected routes, just refresh the session
    await supabase.auth.getSession()
  }
  
  return res
}