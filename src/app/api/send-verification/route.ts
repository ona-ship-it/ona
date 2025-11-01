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

    // Generate verification link (simplified - always use signup for now)
    let linkData;
    try {
      console.log('Generating link with email:', email);
      console.log('Redirect URL:', `${process.env.NEXT_PUBLIC_SITE_URL}/verify?email=${encodeURIComponent(email)}`);
      
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
        password: password,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify?email=${encodeURIComponent(email)}`
        }
      });

      if (error) {
        console.error('Supabase generateLink error:', error);
        throw error;
      }
      
      linkData = data;
      console.log('Link generated successfully:', linkData);
    } catch (linkError) {
      console.error('Error generating verification link:', linkError);
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