-- Notification Center: in-app notifications for users
-- Notification types:
--   giveaway_won        — user won a giveaway
--   raffle_won          — user won a raffle
--   entry_confirmed     — giveaway ticket entry confirmed
--   raffle_ticket       — raffle ticket purchase confirmed
--   giveaway_ending     — a giveaway the user entered is ending soon
--   system              — platform announcements

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('giveaway_won', 'raffle_won', 'entry_confirmed', 'raffle_ticket', 'giveaway_ending', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  -- Optional link to navigate to when clicked
  action_url TEXT,
  -- Whether the user has marked this notification as read
  is_read BOOLEAN NOT NULL DEFAULT false,
  -- Optional related entity (giveaway, raffle, etc.)
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, is_read, created_at DESC);

-- RLS: users may only see and update their own notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Service role inserts on behalf of the platform (no policy needed for service-role bypass)
