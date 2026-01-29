# Email Notification System Setup

Complete email notification system for fundraiser platform with automatic triggers.

## Features

✅ **8 Email Types:**
- 💰 Donation Received - Sent to fundraiser creator when someone donates
- 📋 KYC Submitted - Confirmation that KYC verification was received
- ✅ KYC Approved - KYC approved, payouts unlocked
- ⚠️ KYC Rejected - KYC needs attention with rejection reason
- 💸 Payout Requested - Confirmation of payout request submission
- ✅ Payout Approved - Payout approved and processing
- 🎉 Payout Completed - Payout successfully sent with transaction hash
- ❌ Payout Failed - Payout failed with failure reason

✅ **Automatic Triggers:**
- Database triggers queue emails automatically on key events
- No manual intervention needed

✅ **Beautiful HTML Templates:**
- Professional responsive design
- Platform branding
- Dynamic content
- Clear call-to-action buttons

## Setup Instructions

### Step 1: Run Database Migration

Go to your **Supabase SQL Editor** and run [EMAIL_NOTIFICATIONS_SETUP.sql](EMAIL_NOTIFICATIONS_SETUP.sql)

This creates:
- `email_notifications` table to track sent emails
- Database triggers for automatic email queuing
- Helper functions for email management

### Step 2: Get Resend API Key

1. Sign up at [resend.com](https://resend.com) (Free tier: 3,000 emails/month)
2. Create an API key in your dashboard
3. Verify your sending domain (or use Resend's test domain for development)

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Or use: onboarding@resend.dev for testing
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # For email links
```

### Step 4: Test Email System

#### Option A: Manual Testing

Call the email API directly:
```bash
curl -X POST https://yourdomain.com/api/fundraise/send-emails
```

#### Option B: Test via Donation

1. Create a test fundraiser
2. Make a donation
3. Check that email is queued in `email_notifications` table
4. Call the send-emails API to process the queue

#### Option C: Check Queue Status

```bash
curl https://yourdomain.com/api/fundraise/send-emails
```

Returns:
```json
{
  "pending": 5,
  "sent": 123,
  "failed": 2,
  "bounced": 0
}
```

## How It Works

### 1. Database Triggers Queue Emails

When events happen (donation, KYC approval, etc.), PostgreSQL triggers automatically insert records into `email_notifications` table:

```sql
-- Example: When donation is confirmed
INSERT INTO email_notifications (
  user_id,
  email,
  type,
  subject,
  fundraiser_id,
  donation_id,
  data
) VALUES (...);
```

### 2. Email Processor Sends Queued Emails

The `/api/fundraise/send-emails` endpoint:
- Fetches up to 50 pending emails
- Sends each using Resend
- Updates status to `sent` or `failed`
- Returns summary statistics

### 3. Automatic Processing Options

#### Option A: Cron Job (Recommended for Production)

Add to your hosting platform (Vercel, Railway, etc.):

```
*/5 * * * * curl -X POST https://yourdomain.com/api/fundraise/send-emails
```

Processes emails every 5 minutes.

#### Option B: Vercel Cron Jobs

Create `/vercel.json`:
```json
{
  "crons": [{
    "path": "/api/fundraise/send-emails",
    "schedule": "*/5 * * * *"
  }]
}
```

#### Option C: Supabase Edge Functions

For near-instant delivery, trigger on database events using Supabase webhooks.

## Email Templates

All emails feature:
- **Responsive Design** - Works on mobile and desktop
- **Brand Colors** - Green for success, blue for info, red for warnings
- **Dynamic Data** - Personalized with user/fundraiser info
- **CTA Buttons** - Links to dashboard for action
- **Professional Footer** - Copyright and branding

### Example: Donation Received Email

```
🎉 New Donation Received!

Great news! Someone just supported your fundraiser.

$50.00 USDC

Fundraiser: Save the Ocean Cleanup
Donor: John Doe
Gross Amount: $50.00 USDC
Platform Fee (2.9% + $0.30): -$1.76 USDC
Net Amount: $48.24 USDC

The funds are securely held in escrow. Once you complete KYC
verification, you can request a payout.

[View Dashboard]
```

## Database Schema

### email_notifications Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Recipient user ID |
| email | TEXT | Recipient email address |
| type | TEXT | Email type (donation_received, etc.) |
| subject | TEXT | Email subject line |
| fundraiser_id | UUID | Related fundraiser (optional) |
| donation_id | UUID | Related donation (optional) |
| kyc_submission_id | UUID | Related KYC submission (optional) |
| payout_request_id | UUID | Related payout request (optional) |
| data | JSONB | Additional email data |
| status | TEXT | pending, sent, failed, bounced |
| sent_at | TIMESTAMP | When email was sent |
| failed_reason | TEXT | Error message if failed |
| created_at | TIMESTAMP | When queued |
| updated_at | TIMESTAMP | Last update |

## Monitoring

### Check Email Stats

```bash
curl https://yourdomain.com/api/fundraise/send-emails
```

### Query Failed Emails

```sql
SELECT * FROM email_notifications
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### Retry Failed Emails

```sql
UPDATE email_notifications
SET status = 'pending', failed_reason = NULL
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours';
```

Then trigger the send API.

## Customization

### Modify Email Templates

Edit templates in `/src/lib/email.ts` in the `fundraiserEmailTemplates` object.

### Add New Email Types

1. Add type to `FundraiserEmailType` in `/src/lib/email.ts`
2. Add template to `fundraiserEmailTemplates`
3. Create trigger in SQL or call `queue_email_notification()` manually

### Change Sending Frequency

Adjust the cron schedule or batch size (currently 50 emails per run).

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain in Resend dashboard
3. Check email queue: `SELECT * FROM email_notifications WHERE status = 'pending'`
4. Look for errors: `SELECT * FROM email_notifications WHERE status = 'failed'`

### Emails Going to Spam

1. Verify your sending domain in Resend
2. Add SPF, DKIM, and DMARC records
3. Avoid spam trigger words
4. Use legitimate "from" address

### Rate Limiting

Resend free tier: 3,000 emails/month, 100 emails/day

If you need more:
- Upgrade Resend plan
- Use batch sending
- Implement email preferences/opt-out

## Security

✅ **RLS Enabled** - Users can only view their own notifications
✅ **Server-Side Only** - Email sending happens on backend
✅ **No Credentials in Client** - API key never exposed
✅ **Failed Email Tracking** - All failures logged
✅ **Personal Data Protection** - Emails stored securely

## Next Steps

After setting up emails:

1. **Test thoroughly** - Send test emails for all types
2. **Monitor delivery** - Check Resend dashboard for stats
3. **Add email preferences** - Let users control notifications
4. **Implement unsubscribe** - Required for compliance
5. **Add email analytics** - Track open/click rates

## Support

- Resend Docs: https://resend.com/docs
- Email Best Practices: https://resend.com/docs/knowledge-base/email-best-practices
- Troubleshooting: Check Resend dashboard logs
