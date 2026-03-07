import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { sendVerificationEmail } from '@/lib/resend';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId are required' }, { status: 400 });
    }

    const supabase = createClient();

    // Generate a verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Store the token in the database
    const { error: insertError } = await supabase
      .from('email_verifications')
      .upsert({
        user_id: userId,
        email: email,
        token: token,
        expires_at: expiresAt,
        verified: false,
      }, {
        onConflict: 'user_id',
      });

    if (insertError) {
      console.error('Token insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create verification token' }, { status: 500 });
    }

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onagui.com';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    // Send the email via Resend
    const result = await sendVerificationEmail(email, verificationUrl);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Verification email sent' });
  } catch (error: any) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
