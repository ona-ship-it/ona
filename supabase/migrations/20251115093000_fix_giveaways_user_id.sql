-- Compatibility fix: some environments reference giveaways.user_id in policies/triggers
-- Add a user_id column and keep it in sync with creator_id

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'giveaways'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.giveaways
      ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Backfill user_id from creator_id where missing
UPDATE public.giveaways
SET user_id = COALESCE(user_id, creator_id)
WHERE user_id IS NULL;

-- Create helper function to sync user_id with creator_id
CREATE OR REPLACE FUNCTION public.sync_giveaways_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS NULL THEN
      NEW.user_id = NEW.creator_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.creator_id IS DISTINCT FROM OLD.creator_id THEN
      NEW.user_id = NEW.creator_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to giveaways
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_sync_giveaways_user_id'
  ) THEN
    CREATE TRIGGER trigger_sync_giveaways_user_id
    BEFORE INSERT OR UPDATE ON public.giveaways
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_giveaways_user_id();
  END IF;
END $$;

-- Optionally, broaden manage policy to account for user_id if present
-- This block is safe even if the policy already exists with similar logic
DROP POLICY IF EXISTS manage_giveaways ON public.giveaways;
CREATE POLICY manage_giveaways ON public.giveaways
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
    OR (creator_id = auth.uid())
    OR (user_id = auth.uid())
  );