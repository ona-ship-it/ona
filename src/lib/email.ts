import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key')

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@onagui.com'

// Winner announcement email
export async function sendWinnerEmail({
  to,
  winnerName,
  prizeName,
  prizeValue,
  giveawayId,
  raffleId,
}: {
  to: string
  winnerName: string
  prizeName: string
  prizeValue: number
  giveawayId?: string
  raffleId?: string
}) {
  const detailUrl = giveawayId 
    ? `https://onagui.com/giveaways/${giveawayId}`
    : `https://onagui.com/raffles/${raffleId}`

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎉 Congratulations! You Won ${prizeName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; }
            .prize-box { background: #f7f9fc; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
            .emoji { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🏆</div>
              <h1 style="margin: 20px 0 10px;">CONGRATULATIONS!</h1>
              <p style="margin: 0; font-size: 18px;">You're a Winner!</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;"><strong>Hi ${winnerName},</strong></p>
              
              <p>We're thrilled to announce that you've won:</p>
              
              <div class="prize-box">
                <h2 style="color: #667eea; margin: 0 0 10px;">${prizeName}</h2>
                <p style="font-size: 24px; font-weight: bold; color: #333; margin: 0;">Worth $${prizeValue.toLocaleString()}</p>
              </div>
              
              <p>🎉 You beat the odds and came out on top! Your prize is waiting for you.</p>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Click the button below to view your winning entry</li>
                <li>We'll contact you within 24-48 hours with delivery details</li>
                <li>Share your win on social media and tag us!</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${detailUrl}" class="button">View My Win 🎊</a>
              </div>
              
              <p style="margin-top: 30px;">Thank you for being part of the Onagui community!</p>
              
              <p>Best regards,<br><strong>The Onagui Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This email was sent because you won a ${giveawayId ? 'giveaway' : 'raffle'} on Onagui.com</p>
              <p>© 2026 Onagui. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) throw error
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Entry confirmation email
export async function sendEntryConfirmationEmail({
  to,
  userName,
  giveawayTitle,
  giveawayId,
  ticketCount = 1,
  isFree = false,
}: {
  to: string
  userName: string
  giveawayTitle: string
  giveawayId: string
  ticketCount?: number
  isFree?: boolean
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `✓ Entry Confirmed: ${giveawayTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
            .ticket-box { background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎫 Entry Confirmed!</h1>
            </div>
            
            <div class="content">
              <p><strong>Hi ${userName},</strong></p>
              
              <p>Great news! Your entry has been confirmed for:</p>
              
              <div class="ticket-box">
                <h2 style="color: #3b82f6; margin: 0 0 10px;">${giveawayTitle}</h2>
                <p style="margin: 0;">
                  ${ticketCount} ${ticketCount > 1 ? 'Entries' : 'Entry'} 
                  ${isFree ? '(FREE)' : ''}
                </p>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>✓ Your entry is now active</li>
                <li>📧 We'll email you if you win</li>
                <li>🤞 Good luck!</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://onagui.com/giveaways/${giveawayId}" class="button">View Giveaway</a>
              </div>
              
              <p>Share this giveaway with friends for more chances to win!</p>
            </div>
            
            <div class="footer">
              <p>© 2026 Onagui. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) throw error
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Raffle ticket purchase confirmation
export async function sendRaffleTicketConfirmationEmail({
  to,
  userName,
  raffleTitle,
  raffleId,
  ticketCount,
  ticketNumbers,
  amountPaid,
}: {
  to: string
  userName: string
  raffleTitle: string
  raffleId: string
  ticketCount: number
  ticketNumbers: number[]
  amountPaid: number
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎟️ Raffle Tickets Confirmed: ${raffleTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
            .ticket-numbers { background: #faf5ff; border: 2px solid #8b5cf6; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .number-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .ticket-number { background: white; border: 1px solid #8b5cf6; padding: 8px 12px; border-radius: 6px; font-weight: bold; color: #8b5cf6; }
            .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎟️ Tickets Purchased!</h1>
            </div>
            
            <div class="content">
              <p><strong>Hi ${userName},</strong></p>
              
              <p>Your raffle tickets have been confirmed!</p>
              
              <div class="ticket-numbers">
                <h3 style="color: #8b5cf6; margin: 0 0 10px;">${raffleTitle}</h3>
                <p style="margin: 0 0 10px;"><strong>${ticketCount} Tickets - $${amountPaid.toFixed(2)} USDC</strong></p>
                
                <p style="font-size: 14px; color: #666; margin: 10px 0;">Your Ticket Numbers:</p>
                <div class="number-grid">
                  ${ticketNumbers.slice(0, 20).map(num => `<span class="ticket-number">#${num}</span>`).join('')}
                  ${ticketNumbers.length > 20 ? `<span style="color: #666;">+${ticketNumbers.length - 20} more</span>` : ''}
                </div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>✓ Your tickets are now active</li>
                <li>🎲 Winner drawn when all tickets sold</li>
                <li>📧 We'll notify you if you win</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://onagui.com/raffles/${raffleId}" class="button">View Raffle</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) throw error
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Raffle approval notification (for creators)
export async function sendRaffleApprovalEmail({
  to,
  creatorName,
  raffleTitle,
  raffleId,
  approved,
  rejectionReason,
}: {
  to: string
  creatorName: string
  raffleTitle: string
  raffleId: string
  approved: boolean
  rejectionReason?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: approved 
        ? `✅ Raffle Approved: ${raffleTitle}`
        : `❌ Raffle Not Approved: ${raffleTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${approved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">${approved ? '✅ Raffle Approved!' : '❌ Raffle Not Approved'}</h1>
            </div>
            
            <div class="content">
              <p><strong>Hi ${creatorName},</strong></p>
              
              ${approved ? `
                <p>Great news! Your raffle has been approved and is now live:</p>
                
                <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 10px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #10b981; margin: 0 0 10px;">${raffleTitle}</h3>
                </div>
                
                <p><strong>Your raffle is now:</strong></p>
                <ul>
                  <li>✓ Visible to all users</li>
                  <li>✓ Ready for ticket sales</li>
                  <li>✓ Featured in search results</li>
                </ul>
                
                <p>Share your raffle link to maximize entries!</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://onagui.com/raffles/${raffleId}" class="button">View Your Raffle</a>
                </div>
              ` : `
                <p>Unfortunately, your raffle was not approved:</p>
                
                <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 10px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #ef4444; margin: 0 0 10px;">${raffleTitle}</h3>
                  ${rejectionReason ? `<p style="margin: 10px 0 0;"><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
                </div>
                
                <p>You can edit and resubmit your raffle, or contact support if you have questions.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://onagui.com/raffles/create" class="button">Create New Raffle</a>
                </div>
              `}
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) throw error
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Giveaway ending soon reminder
export async function sendEndingSoonEmail({
  to,
  userName,
  giveawayTitle,
  giveawayId,
  hoursRemaining,
}: {
  to: string
  userName: string
  giveawayTitle: string
  giveawayId: string
  hoursRemaining: number
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `⏰ Ending Soon: ${giveawayTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .urgency-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">⏰</h1>
              <h2 style="margin: 10px 0 0;">Ending Soon!</h2>
            </div>
            
            <div class="content">
              <p><strong>Hi ${userName},</strong></p>
              
              <p>The giveaway you entered is ending soon!</p>
              
              <div class="urgency-box">
                <h3 style="color: #f59e0b; margin: 0 0 10px;">${giveawayTitle}</h3>
                <p style="font-size: 24px; font-weight: bold; color: #ef4444; margin: 10px 0;">
                  ${hoursRemaining < 1 ? 'Less than 1 hour' : `${hoursRemaining} hours`} remaining!
                </p>
              </div>
              
              <p><strong>Last chance to:</strong></p>
              <ul>
                <li>🔗 Share with friends</li>
                <li>🎫 Get more entries</li>
                <li>🤞 Increase your odds</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://onagui.com/giveaways/${giveawayId}" class="button">View Giveaway</a>
              </div>
              
              <p style="text-align: center; color: #666; font-size: 14px;">
                Winner will be announced after the giveaway ends!
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) throw error
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Fundraiser email types
export interface FundraiserEmailData {
  amount?: number;
  currency?: string;
  donor_name?: string;
  fundraiser_title?: string;
  net_amount?: number;
  platform_fee?: number;
  status?: string;
  rejection_reason?: string;
  transaction_hash?: string;
  failure_reason?: string;
}

export type FundraiserEmailType = 
  | 'donation_received'
  | 'kyc_submitted'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'payout_requested'
  | 'payout_approved'
  | 'payout_completed'
  | 'payout_failed';

// Fundraiser email templates
const fundraiserEmailTemplates: Record<FundraiserEmailType, (data: FundraiserEmailData) => { subject: string; html: string }> = {
  donation_received: (data) => ({
    subject: `💰 You received a ${data.amount} ${data.currency} donation!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
            .amount { font-size: 36px; font-weight: bold; color: #10b981; margin: 20px 0; text-align: center; }
            .details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Donation Received!</h1>
            </div>
            <div class="content">
              <p>Great news! Someone just supported your fundraiser.</p>
              
              <div class="amount">${data.amount} ${data.currency}</div>
              
              <div class="details">
                <div class="detail-row">
                  <span><strong>Fundraiser:</strong></span>
                  <span>${data.fundraiser_title}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Donor:</strong></span>
                  <span>${data.donor_name || 'Anonymous'}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Gross Amount:</strong></span>
                  <span>${data.amount} ${data.currency}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Platform Fee (2.9% + $0.30):</strong></span>
                  <span>-${data.platform_fee} ${data.currency}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Net Amount:</strong></span>
                  <span style="color: #10b981; font-weight: bold;">${data.net_amount} ${data.currency}</span>
                </div>
              </div>
              
              <p>The funds are securely held in escrow. Once you complete KYC verification, you can request a payout.</p>
              
              <center><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ona.com'}/fundraise/dashboard" class="button">View Dashboard</a></center>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  kyc_submitted: (data) => ({
    subject: '📋 KYC Verification Submitted',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ KYC Verification Received</h1>
            </div>
            <div class="content">
              <p>Thank you for submitting your KYC verification for <strong>${data.fundraiser_title}</strong>.</p>
              <p>Our team will review your documents within 24-48 hours. We'll notify you once the review is complete.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  kyc_approved: (data) => ({
    subject: '✅ KYC Approved - You can now request payouts!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 KYC Approved!</h1>
            </div>
            <div class="content">
              <p>Congratulations! Your KYC verification has been approved for <strong>${data.fundraiser_title}</strong>.</p>
              <p>You can now request payouts for your fundraiser. Your funds are ready to be withdrawn to your wallet.</p>
              <center><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ona.com'}/fundraise/dashboard" class="button">Request Payout</a></center>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  kyc_rejected: (data) => ({
    subject: '⚠️ KYC Application Needs Attention',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
            .reason { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ KYC Application Update</h1>
            </div>
            <div class="content">
              <p>Your KYC verification for <strong>${data.fundraiser_title}</strong> requires attention.</p>
              
              ${data.rejection_reason ? `
                <div class="reason">
                  <strong>Reason:</strong><br>
                  ${data.rejection_reason}
                </div>
              ` : ''}
              
              <p>Please review and resubmit your documents with the correct information.</p>
              <center><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ona.com'}/fundraise/dashboard" class="button">Update KYC</a></center>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  payout_requested: (data) => ({
    subject: '💸 Payout Request Submitted',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
            .amount { font-size: 36px; font-weight: bold; color: #8b5cf6; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💸 Payout Request Received</h1>
            </div>
            <div class="content">
              <p>Your payout request for <strong>${data.fundraiser_title}</strong> has been submitted.</p>
              
              <div class="amount">$${data.net_amount}</div>
              
              <p>Our team will review and process your request within 1-3 business days. You'll receive another email once the payout is completed.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  payout_approved: (data) => ({
    subject: '✅ Payout Approved - Processing Soon',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payout Approved!</h1>
            </div>
            <div class="content">
              <p>Great news! Your payout request for <strong>${data.fundraiser_title}</strong> has been approved.</p>
              <p>The transaction will be processed shortly. You'll receive a confirmation email with the transaction hash once complete.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  payout_completed: (data) => ({
    subject: '✅ Payout Completed Successfully!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
            .amount { font-size: 36px; font-weight: bold; color: #10b981; margin: 20px 0; text-align: center; }
            .tx-hash { background: #f9fafb; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Payout Completed!</h1>
            </div>
            <div class="content">
              <p>Your payout for <strong>${data.fundraiser_title}</strong> has been successfully processed!</p>
              
              <div class="amount">$${data.net_amount}</div>
              
              ${data.transaction_hash ? `
                <p><strong>Transaction Hash:</strong></p>
                <div class="tx-hash">${data.transaction_hash}</div>
                <p><small>You can verify this transaction on the blockchain explorer.</small></p>
              ` : ''}
              
              <p>The funds should appear in your wallet within a few minutes. Thank you for using ONA Platform!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  payout_failed: (data) => ({
    subject: '❌ Payout Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; }
            .reason { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payout Failed</h1>
            </div>
            <div class="content">
              <p>Unfortunately, your payout for <strong>${data.fundraiser_title}</strong> could not be processed.</p>
              
              ${data.failure_reason ? `
                <div class="reason">
                  <strong>Reason:</strong><br>
                  ${data.failure_reason}
                </div>
              ` : ''}
              
              <p>Please contact our support team or submit a new payout request with updated information.</p>
              <center><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ona.com'}/fundraise/dashboard" class="button">Contact Support</a></center>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ONA Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

export async function sendFundraiserEmail(
  to: string,
  type: FundraiserEmailType,
  data: FundraiserEmailData
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key') {
      console.warn('RESEND_API_KEY not configured - skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = fundraiserEmailTemplates[type];
    if (!template) {
      return { success: false, error: 'Invalid email type' };
    }

    const { subject, html } = template(data);

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Failed to send fundraiser email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
