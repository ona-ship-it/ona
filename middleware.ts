import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Check if the request is for admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // Redirect to login with the current path as redirectTo
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if the user has admin privileges
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin_user');

      if (adminError || !adminCheck) {
        // Redirect to home page if not admin
        return NextResponse.redirect(new URL('/', req.url));
      }

      // User is authenticated and is admin, allow access
      return res;
    } catch (error) {
      console.error('Middleware error:', error);
      // Redirect to login on any error
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
};