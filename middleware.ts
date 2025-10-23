import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Configure cookie options for production domain compatibility
  const supabase = createMiddlewareClient({ 
    req, 
    res,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  try {
    // First, try to get the session to ensure cookies are properly synced
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Middleware session error:', sessionError);
    }

    // Then get the user for additional verification
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Middleware user error:', userError);
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/profile', '/account', '/admin'];
    const adminRoutes = ['/admin'];
    
    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );
    
    const isAdminRoute = adminRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // Redirect unauthenticated users from protected routes
    // Check both session and user for better reliability
    if (isProtectedRoute && (!session || !user)) {
      const redirectUrl = new URL('/signin', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // For admin routes, perform additional admin privilege check
    if (isAdminRoute && session && user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('onagui_profiles')
          .select('onagui_type')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Admin profile check error:', profileError);
          return NextResponse.redirect(new URL('/signin', req.url));
        }

        if (!profile || profile.onagui_type !== 'admin') {
          console.log('Access denied: User is not admin', { userId: user.id, profile });
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (profileCheckError) {
        console.error('Admin privilege check failed:', profileCheckError);
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue but log the issue
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};