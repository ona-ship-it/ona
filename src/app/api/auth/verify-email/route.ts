import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/resend';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/verify-email?error=missing_token', request.url));
    }

    const supabase = createClient();

    // Look up the token
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !verification) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid_token', request.url));
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.redirect(new URL('/verify-email?status=already_verified', request.url));
    }

    // Check expiration
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/verify-email?error=expired', request.url));
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    if (updateError) {
      console.error('Verification update error:', updateError);
      return NextResponse.redirect(new URL('/verify-email?error=failed', request.url));
    }

    // Update the user's profile to mark email as verified
    await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', verification.user_id);

    // Also update onagui_profiles if it has the field
    await supabase
      .from('onagui_profiles')
      .update({ email_verified: true })
      .eq('id', verification.user_id);

    // Send welcome email
    const { data: profile } = await supabase
      .from('onagui_profiles')
      .select('username')
      .eq('id', verification.user_id)
      .single();

    await sendWelcomeEmail(verification.email, profile?.username || 'Creator');

    // Redirect to success page
    return NextResponse.redirect(new URL('/verify-email?status=success', request.url));
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.redirect(new URL('/verify-email?error=server_error', request.url));
  }
}
