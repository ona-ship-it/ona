import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure Node.js runtime (supabase-js is not compatible with Edge runtime)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      console.error('[magic-link] Missing env:', {
        hasUrl: !!SUPABASE_URL,
        hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
      });
      return NextResponse.json({ error: 'Supabase service configuration is missing (check SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL)' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const finalRedirect = (typeof redirectTo === 'string' && redirectTo) ? redirectTo : '/account';
    const callbackUrl = `${siteUrl}/auth/callback?redirectTo=${encodeURIComponent(finalRedirect)}`;

    console.log('[magic-link] generating link', {
      email,
      siteUrl,
      callbackUrl,
    });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: callbackUrl }
    });

    if (error) {
      console.error('[magic-link] generateLink error:', error);
      return NextResponse.json({ error: error.message || 'Failed to generate magic link' }, { status: 500 });
    }

    // action_link is a direct URL that can be opened to complete auth
    const actionLink = (data as any)?.properties?.action_link || (data as any)?.action_link || null;
    if (!actionLink) {
      console.error('[magic-link] No action_link returned from Supabase', { data });
      return NextResponse.json({ error: 'No magic link returned' }, { status: 500 });
    }

    return NextResponse.json({ url: actionLink });
  } catch (e: any) {
    console.error('[magic-link] unexpected server error:', e);
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}