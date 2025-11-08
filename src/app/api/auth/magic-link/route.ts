import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Generate a server-side magic link for passwordless fallback.
// Uses service role to avoid relying on Supabase's email delivery.
export async function POST(req: Request) {
  try {
    const { email, redirectTo } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase service configuration is missing' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const finalRedirect = (typeof redirectTo === 'string' && redirectTo) ? redirectTo : '/account';
    const callbackUrl = `${siteUrl}/auth/callback?redirectTo=${encodeURIComponent(finalRedirect)}`;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: callbackUrl }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // action_link is a direct URL that can be opened to complete auth
    const actionLink = (data as any)?.properties?.action_link || (data as any)?.action_link || null;
    if (!actionLink) {
      return NextResponse.json({ error: 'No magic link returned' }, { status: 500 });
    }

    return NextResponse.json({ url: actionLink });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}