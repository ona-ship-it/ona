import nodemailer from 'nodemailer';

// Email service configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport(emailConfig);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export class EmailService {
  /**
   * Send an email using Gmail SMTP
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || process.env.EMAIL_FROM,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send a welcome email to new users
   */
  static async sendWelcomeEmail(userEmail: string, userName?: string): Promise<boolean> {
    const subject = 'Welcome to ONAGUI!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to ONAGUI!</h1>
        <p>Hi ${userName || 'there'},</p>
        <p>Thank you for joining ONAGUI! We're excited to have you as part of our community.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The ONAGUI Team</p>
      </div>
    `;
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Send a password reset email
   */
  static async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<boolean> {
    const subject = 'Reset Your ONAGUI Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You requested to reset your password for your ONAGUI account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>Best regards,<br>The ONAGUI Team</p>
      </div>
    `;
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Send a notification email to admins
   */
  static async sendAdminNotification(subject: string, message: string, adminEmails?: string[]): Promise<boolean> {
    const defaultAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const recipients = adminEmails || (defaultAdminEmail ? [defaultAdminEmail] : []);
    
    if (recipients.length === 0) {
      console.warn('No admin emails configured for notification');
      return false;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Admin Notification</h1>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          ${message}
        </div>
        <p><em>This is an automated notification from ONAGUI.</em></p>
      </div>
    `;
    
    return this.sendEmail({
      to: recipients,
      subject: `[ONAGUI Admin] ${subject}`,
      html,
    });
  }

  /**
   * Test email configuration
   */
  static async testConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;