-- Incremental migration: adjust giveaway_contributions schema, indexes, and RLS policies
-- This migration makes no destructive changes (no DROP TABLE) and is safe to re-run.

BEGIN;

-- Ensure table comment is set (idempotent effect)
COMMENT ON TABLE public.giveaway_contributions IS 'Records all entries, whether paid donations or free claims, for a giveaway.';

-- Enable RLS (idempotent)
ALTER TABLE public.giveaway_contributions ENABLE ROW LEVEL SECURITY;

-- Ensure default for kind
ALTER TABLE public.giveaway_contributions
  ALTER COLUMN kind SET DEFAULT 'donation';

-- Ensure kind values are constrained to expected enum values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'giveaway_contributions_kind_check'
      AND conrelid = 'public.giveaway_contributions'::regclass
  ) THEN
    ALTER TABLE public.giveaway_contributions
      ADD CONSTRAINT giveaway_contributions_kind_check
      CHECK (kind IN ('donation', 'claim'));
  END IF;
END$$;

-- Make user_id NOT NULL to align with insert policy (will fail if nulls exist)
ALTER TABLE public.giveaway_contributions
  ALTER COLUMN user_id SET NOT NULL;

-- Enforce split sanity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'split_sum_valid'
      AND conrelid = 'public.giveaway_contributions'::regclass
  ) THEN
    ALTER TABLE public.giveaway_contributions
      ADD CONSTRAINT split_sum_valid
      CHECK ((split_platform + split_creator + split_prize) BETWEEN 0.9999 AND 1.0001);
  END IF;
END$$;

-- Indexes for common access paths (idempotent)
CREATE INDEX IF NOT EXISTS giveaway_contributions_giveaway_idx ON public.giveaway_contributions(giveaway_id);
CREATE INDEX IF NOT EXISTS giveaway_contributions_user_idx    ON public.giveaway_contributions(user_id);
CREATE INDEX IF NOT EXISTS giveaway_contributions_kind_idx    ON public.giveaway_contributions(kind);

-- Partial unique index to prevent duplicate claims per user per giveaway (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS giveaway_claim_once_idx
  ON public.giveaway_contributions (giveaway_id, user_id)
  WHERE kind = 'claim';

-- Insert policy (create only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'giveaway_contributions'
      AND policyname = 'Allow authenticated users to insert contributions for active giveaways'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert contributions for active giveaways"
      ON public.giveaway_contributions
      FOR INSERT
      TO authenticated
      WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
          SELECT 1
          FROM public.giveaways g
          WHERE g.id = giveaway_contributions.giveaway_id
            AND g.status = 'active'
        )
      );
  END IF;
END$$;

-- Select policy for giveaway creator (create only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'giveaway_contributions'
      AND policyname = 'Allow giveaway creator to view all entries'
  ) THEN
    CREATE POLICY "Allow giveaway creator to view all entries"
      ON public.giveaway_contributions
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.giveaways g
          WHERE g.id = giveaway_contributions.giveaway_id
            AND g.creator_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Select policy for contributor to view their own entries (create only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'giveaway_contributions'
      AND policyname = 'Allow contributor to view their own entries'
  ) THEN
    CREATE POLICY "Allow contributor to view their own entries"
      ON public.giveaway_contributions
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END$$;

COMMIT;
