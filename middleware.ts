import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { user } } = await supabase.auth.getUser();

  const protectedRoutes = ['/profile', '/account'];
  if (protectedRoutes.includes(req.nextUrl.pathname) && !user) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  return res;
}