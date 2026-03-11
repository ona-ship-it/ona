import { Resend } from 'resend';

// Lazy init — never runs at build time; avoids missing-key error during `next build`
function getResend() { return new Resend(process.env.RESEND_API_KEY ?? '') }
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Onagui <noreply@onagui.com>';

export async function sendVerificationEmail(to: string, verificationUrl: string) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verify your Onagui account',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a1929;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:900;color:#00ff88;letter-spacing:2px;margin:0;">ONAGUI</h1>
      <p style="color:#64748b;font-size:12px;margin:4px 0 0;letter-spacing:1px;">WEB3 GIVEAWAY PLATFORM</p>
    </div>
    <!-- Card -->
    <div style="background:#1e293b;border:1px solid rgba(0,255,136,0.15);border-radius:16px;padding:32px 24px;text-align:center;">

      <!-- Icon -->
      <div style="width:56px;height:56px;margin:0 auto 20px;background:rgba(0,255,136,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✉️</span>
      </div>
      <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 8px;">Verify Your Email</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;">
        Welcome to Onagui! Click the button below to verify your email address and activate your account.
      </p>
      <!-- CTA Button -->
      <a href="${verificationUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#00ff88,#00cc6a);color:#0a1929;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;">
        VERIFY MY EMAIL
      </a>
      <p style="color:#4a5568;font-size:11px;margin:20px 0 0;line-height:1.5;">
        This link expires in 24 hours.<br>
        If you didn't create an account on Onagui, you can safely ignore this email.
      </p>
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#4a5568;font-size:11px;margin:0;">
        &copy; ${new Date().getFullYear()} Onagui. All rights reserved.
      </p>
      <p style="margin:8px 0 0;">
        <a href="https://www.onagui.com" style="color:#00ff88;font-size:11px;text-decoration:none;">onagui.com</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Email send failed:', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

export async function sendWelcomeEmail(to: string, username: string) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Onagui! 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a1929;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:900;color:#00ff88;letter-spacing:2px;margin:0;">ONAGUI</h1>
    </div>
    <div style="background:#1e293b;border:1px solid rgba(0,255,136,0.15);border-radius:16px;padding:32px 24px;text-align:center;">
      <div style="width:56px;height:56px;margin:0 auto 20px;background:rgba(0,255,136,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🎉</span>
      </div>
      <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 8px;">Welcome, ${username}!</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your email is verified and your account is ready. Start exploring giveaways, raffles, and more!
      </p>
      <a href="https://www.onagui.com/raffles" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#00ff88,#00cc6a);color:#0a1929;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;">
        EXPLORE RAFFLES
      </a>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#4a5568;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Onagui. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Resend welcome error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Welcome email failed:', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}
