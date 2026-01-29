-- Email Notifications System for Fundraisers
-- Run this in Supabase SQL Editor

-- Create email notifications table
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- Email Details
  type TEXT NOT NULL CHECK (type IN (
    'donation_received',
    'kyc_submitted',
    'kyc_approved',
    'kyc_rejected',
    'payout_requested',
    'payout_approved',
    'payout_completed',
    'payout_failed',
    'fundraiser_milestone',
    'fundraiser_update'
  )),
  subject TEXT NOT NULL,
  
  -- Related entities
  fundraiser_id UUID REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
  kyc_submission_id UUID REFERENCES public.kyc_submissions(id) ON DELETE SET NULL,
  payout_request_id UUID REFERENCES public.payout_requests(id) ON DELETE SET NULL,
  
  -- Metadata
  data JSONB DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON public.email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON public.email_notifications(type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_fundraiser_id ON public.email_notifications(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON public.email_notifications(created_at);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own email notifications"
  ON public.email_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Function to queue email notification
CREATE OR REPLACE FUNCTION queue_email_notification(
  p_user_id UUID,
  p_email TEXT,
  p_type TEXT,
  p_subject TEXT,
  p_fundraiser_id UUID DEFAULT NULL,
  p_donation_id UUID DEFAULT NULL,
  p_kyc_submission_id UUID DEFAULT NULL,
  p_payout_request_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.email_notifications (
    user_id,
    email,
    type,
    subject,
    fundraiser_id,
    donation_id,
    kyc_submission_id,
    payout_request_id,
    data,
    status
  ) VALUES (
    p_user_id,
    p_email,
    p_type,
    p_subject,
    p_fundraiser_id,
    p_donation_id,
    p_kyc_submission_id,
    p_payout_request_id,
    p_data,
    'pending'
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send donation notification
CREATE OR REPLACE FUNCTION send_donation_notification()
RETURNS TRIGGER AS $$
DECLARE
  fundraiser_record RECORD;
  creator_email TEXT;
BEGIN
  IF NEW.status = 'confirmed' THEN
    -- Get fundraiser and creator details
    SELECT f.*, u.email
    INTO fundraiser_record
    FROM public.fundraisers f
    JOIN auth.users u ON u.id = f.user_id
    WHERE f.id = NEW.fundraiser_id;
    
    IF fundraiser_record.email IS NOT NULL THEN
      -- Queue email notification
      PERFORM queue_email_notification(
        fundraiser_record.user_id,
        fundraiser_record.email,
        'donation_received',
        'You received a donation on ' || fundraiser_record.title,
        NEW.fundraiser_id,
        NEW.id,
        NULL,
        NULL,
        jsonb_build_object(
          'amount', NEW.amount,
          'currency', NEW.currency,
          'donor_name', COALESCE(NEW.donor_name, 'Anonymous'),
          'fundraiser_title', fundraiser_record.title,
          'net_amount', NEW.net_amount,
          'platform_fee', NEW.platform_fee
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send KYC status notification
CREATE OR REPLACE FUNCTION send_kyc_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  fundraiser_title TEXT;
  email_type TEXT;
  email_subject TEXT;
BEGIN
  IF NEW.status != OLD.status THEN
    -- Get user email and fundraiser title
    SELECT u.email, f.title
    INTO user_email, fundraiser_title
    FROM auth.users u
    JOIN public.fundraisers f ON f.id = NEW.fundraiser_id
    WHERE u.id = NEW.user_id;
    
    -- Determine email type and subject
    IF NEW.status = 'approved' THEN
      email_type := 'kyc_approved';
      email_subject := 'KYC Approved - You can now request payouts';
    ELSIF NEW.status = 'rejected' THEN
      email_type := 'kyc_rejected';
      email_subject := 'KYC Application Needs Attention';
    ELSE
      RETURN NEW; -- Don't send for other status changes
    END IF;
    
    -- Queue email notification
    PERFORM queue_email_notification(
      NEW.user_id,
      user_email,
      email_type,
      email_subject,
      NEW.fundraiser_id,
      NULL,
      NEW.id,
      NULL,
      jsonb_build_object(
        'fundraiser_title', fundraiser_title,
        'status', NEW.status,
        'rejection_reason', NEW.rejection_reason
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send payout notification
CREATE OR REPLACE FUNCTION send_payout_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  fundraiser_title TEXT;
  email_type TEXT;
  email_subject TEXT;
BEGIN
  -- Get user email and fundraiser title
  SELECT u.email, f.title
  INTO user_email, fundraiser_title
  FROM auth.users u
  JOIN public.fundraisers f ON f.id = NEW.fundraiser_id
  WHERE u.id = NEW.user_id;
  
  -- Send notification on status change or insert
  IF TG_OP = 'INSERT' THEN
    email_type := 'payout_requested';
    email_subject := 'Payout Request Submitted';
  ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    email_type := 'payout_completed';
    email_subject := 'Payout Completed Successfully';
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    email_type := 'payout_failed';
    email_subject := 'Payout Failed - Action Required';
  ELSIF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    email_type := 'payout_approved';
    email_subject := 'Payout Approved - Processing Soon';
  ELSE
    RETURN NEW; -- Don't send for other changes
  END IF;
  
  -- Queue email notification
  PERFORM queue_email_notification(
    NEW.user_id,
    user_email,
    email_type,
    email_subject,
    NEW.fundraiser_id,
    NULL,
    NULL,
    NEW.id,
    jsonb_build_object(
      'fundraiser_title', fundraiser_title,
      'net_amount', NEW.net_amount,
      'status', NEW.status,
      'transaction_hash', NEW.transaction_hash,
      'failure_reason', NEW.failure_reason
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_donation_send_email
  AFTER INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION send_donation_notification();

CREATE TRIGGER on_kyc_status_send_email
  AFTER UPDATE OF status ON public.kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION send_kyc_notification();

CREATE TRIGGER on_payout_send_email
  AFTER INSERT OR UPDATE OF status ON public.payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION send_payout_notification();

-- Grant permissions
GRANT ALL ON public.email_notifications TO postgres, anon, authenticated;
GRANT EXECUTE ON FUNCTION queue_email_notification TO authenticated;

-- Verify table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'email_notifications'
  AND table_schema = 'public';
