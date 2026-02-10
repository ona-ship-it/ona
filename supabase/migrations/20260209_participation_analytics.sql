-- Participation analytics events
CREATE TABLE IF NOT EXISTS public.participation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  user_id uuid REFERENCES public.onagui_profiles(id) ON DELETE SET NULL,
  session_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participation_events_type ON public.participation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_participation_events_entity ON public.participation_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_participation_events_user ON public.participation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_participation_events_created ON public.participation_events(created_at DESC);

ALTER TABLE public.participation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert participation events" ON public.participation_events;
CREATE POLICY "Public insert participation events"
  ON public.participation_events
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read participation events" ON public.participation_events;
CREATE POLICY "Admins read participation events"
  ON public.participation_events
  FOR SELECT
  USING (auth.role() = 'service_role');
