import { NextRequest, NextResponse } from 'next/server';
import EmailService from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, type = 'test' } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let success = false;
    let message = '';

    switch (type) {
      case 'test':
        success = await EmailService.sendEmail({
          to,
          subject: 'ONAGUI Email Test',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #007bff;">Email Test Successful!</h1>
              <p>This is a test email from your ONAGUI application.</p>
              <p>If you're receiving this email, your Gmail SMTP configuration is working correctly!</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Configuration Details:</strong>
                <ul>
                  <li>SMTP Host: smtp.gmail.com</li>
                  <li>Port: 587</li>
                  <li>Security: STARTTLS</li>
                </ul>
              </div>
              <p>Best regards,<br>The ONAGUI Team</p>
            </div>
          `,
        });
        message = success ? 'Test email sent successfully!' : 'Failed to send test email';
        break;

      case 'welcome':
        success = await EmailService.sendWelcomeEmail(to, 'Test User');
        message = success ? 'Welcome email sent successfully!' : 'Failed to send welcome email';
        break;

      case 'admin':
        success = await EmailService.sendAdminNotification(
          'Test Admin Notification',
          'This is a test admin notification to verify email functionality.'
        );
        message = success ? 'Admin notification sent successfully!' : 'Failed to send admin notification';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: test, welcome, or admin' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Test email service connection
    const isConnected = await EmailService.testConnection();
    
    return NextResponse.json({
      status: isConnected ? 'connected' : 'disconnected',
      message: isConnected 
        ? 'Email service is properly configured and connected'
        : 'Email service connection failed - check your configuration',
      configuration: {
        host: process.env.EMAIL_HOST || 'Not configured',
        port: process.env.EMAIL_PORT || 'Not configured',
        user: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
        from: process.env.EMAIL_FROM || 'Not configured',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email connection test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to test email connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}