-- Create giveaways table in public schema aligning with app usage
CREATE TABLE IF NOT EXISTS public.giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  prize_amount NUMERIC(24, 8) NOT NULL,
  prize_pool_usdt NUMERIC(24, 8) DEFAULT 0,
  ticket_price NUMERIC(24, 8) DEFAULT 1,
  photo_url TEXT,
  media_url TEXT,
  ends_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('draft','active','completed','cancelled')),
  is_active BOOLEAN DEFAULT false,
  escrow_amount NUMERIC(24, 8) DEFAULT 0,
  tickets_count INTEGER DEFAULT 0,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure updated_at trigger function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Trigger for giveaways updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_giveaways_updated_at'
  ) THEN
    CREATE TRIGGER update_giveaways_updated_at
    BEFORE UPDATE ON public.giveaways
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Align tickets table with app expectations: add giveaway_id and is_free
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS giveaway_id UUID,
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Backfill giveaway_id from legacy raffle_id if present
-- Note: This assumes raffle_id maps to giveaways.id
-- UPDATE public.tickets SET giveaway_id = raffle_id WHERE giveaway_id IS NULL;

-- Add FK and index for giveaway_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_giveaway_id_fkey'
  ) THEN
    ALTER TABLE public.tickets
      ADD CONSTRAINT tickets_giveaway_id_fkey FOREIGN KEY (giveaway_id) REFERENCES public.giveaways(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_giveaway_user ON public.tickets(giveaway_id, user_id);

-- Enable RLS on giveaways
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

-- Everyone can view giveaways
DROP POLICY IF EXISTS view_giveaways ON public.giveaways;
CREATE POLICY view_giveaways ON public.giveaways
  FOR SELECT USING (true);

-- Only admins (from onagui.user_roles) can manage giveaways
DROP POLICY IF EXISTS manage_giveaways ON public.giveaways;
CREATE POLICY manage_giveaways ON public.giveaways
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );