import { NextResponse } from 'next/server';
import EmailService from '@/lib/emailService';

// GET: verify SMTP configuration and transporter connectivity
export async function GET() {
  try {
    const connected = await EmailService.testConnection();
    const envReport = {
      EMAIL_HOST: !!process.env.EMAIL_HOST,
      EMAIL_PORT: !!process.env.EMAIL_PORT,
      EMAIL_SECURE: !!process.env.EMAIL_SECURE,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
    };
    return NextResponse.json({ ok: true, connected, env: envReport });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'SMTP verification failed' }, { status: 500 });
  }
}

// POST: send a test email
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const to = body?.to as string | undefined;
    const type = body?.type as string | undefined;

    if (!to) {
      return NextResponse.json({ ok: false, error: 'Missing "to" in body' }, { status: 400 });
    }

    let subject = 'ONAGUI Test Email';
    let html = `<p>This is a test email from ONAGUI.</p>`;

    if (type === 'welcome') {
      subject = 'Welcome to ONAGUI!';
      html = `<h1>Welcome!</h1><p>Thanks for trying the test email endpoint.</p>`;
    }

    const sent = await EmailService.sendEmail({ to, subject, html });
    return NextResponse.json({ ok: sent });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to send test email' }, { status: 500 });
  }
}