import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client at runtime to avoid build-time errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { email, password } = await request.json();

    console.log('Received email:', email);
    console.log('Password provided:', !!password);
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required for signup verification' },
        { status: 400 }
      );
    }

    // Generate verification link with graceful fallback for existing users
    let linkData;
    try {
      console.log('Generating link with email:', email);
      // Unify flow: after confirmation, redirect to /auth/callback to exchange code for session
      const postConfirmRedirect = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=%2Faccount`;
      console.log('Redirect URL:', postConfirmRedirect);

      // Attempt signup link first
      const signupResp = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { redirectTo: postConfirmRedirect }
      });

      if (signupResp.error) {
        const err: any = signupResp.error;
        console.error('Supabase generateLink error:', {
          name: err?.name,
          code: err?.code,
          status: err?.status,
          message: err?.message,
          timeUTC: new Date().toISOString(),
        });

        // If the user already exists, fall back to a magic link
        if (err?.code === 'email_exists' || err?.status === 422) {
          console.warn('User already exists; falling back to magiclink');
          const magicResp = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: { redirectTo: postConfirmRedirect }
          });
          if (magicResp.error) {
            const mErr: any = magicResp.error;
            console.warn('Magiclink with redirect failed, trying without redirect', {
              name: mErr?.name,
              code: mErr?.code,
              status: mErr?.status,
              message: mErr?.message,
            });

            // Try magiclink without redirect option
            const magicNoRedirect = await supabase.auth.admin.generateLink({
              type: 'magiclink',
              email,
            });
            if (magicNoRedirect.error) {
              const m2Err: any = magicNoRedirect.error;
              console.warn('Magiclink without redirect failed, attempting recovery link', {
                name: m2Err?.name,
                code: m2Err?.code,
                status: m2Err?.status,
                message: m2Err?.message,
              });
              // Fallback: recovery link for existing user (password reset-based login)
              const recoveryResp = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email,
                options: { redirectTo: postConfirmRedirect }
              });
              if (recoveryResp.error) {
                throw recoveryResp.error;
              }
              linkData = recoveryResp.data;
              console.log('Recovery link generated successfully:', linkData);
            } else {
              linkData = magicNoRedirect.data;
              console.log('Magic link (no redirect) generated successfully:', linkData);
            }
          } else {
            linkData = magicResp.data;
            console.log('Magic link generated successfully:', linkData);
          }
        } else {
          throw err;
        }
      } else {
        linkData = signupResp.data;
        console.log('Signup link generated successfully:', linkData);
      }
    } catch (linkError: any) {
      console.error('Error generating verification link:', {
        name: linkError?.name,
        code: linkError?.code,
        status: linkError?.status,
        message: linkError?.message,
        timeUTC: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: 'Failed to generate verification link' },
        { status: 500 }
      );
    }

    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email Address</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ONAGUI!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please click the button below to verify your email address and complete your registration.</p>
            <p style="text-align: center;">
              <a href="${linkData.properties.action_link}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">
              ${linkData.properties.action_link}
            </p>
            <p>This link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <p>&copy; 2024 ONAGUI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await EmailService.sendEmail({
      to: email,
      subject: 'Verify Your Email Address - ONAGUI',
      html: emailHtml
    });

    return NextResponse.json({
      message: 'Verification email sent successfully',
      success: true
    });

  } catch (error) {
    console.error('Error in send-verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}