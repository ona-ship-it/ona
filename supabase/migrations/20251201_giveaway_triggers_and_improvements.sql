-- =========================================================
-- 20251201_giveaway_triggers_and_improvements.sql
-- Enhanced Giveaway System with Triggers and Improved Functions
-- =========================================================

-- 1. Create ticket counting trigger function
CREATE OR REPLACE FUNCTION public.update_giveaway_tickets_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment tickets_count when a ticket is added
    UPDATE public.giveaways 
    SET tickets_count = tickets_count + 1,
        updated_at = NOW()
    WHERE id = NEW.giveaway_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement tickets_count when a ticket is removed
    UPDATE public.giveaways 
    SET tickets_count = GREATEST(tickets_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.giveaway_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Create triggers for ticket counting
DROP TRIGGER IF EXISTS trigger_update_tickets_count_insert ON public.tickets;
CREATE TRIGGER trigger_update_tickets_count_insert
  AFTER INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_giveaway_tickets_count();

DROP TRIGGER IF EXISTS trigger_update_tickets_count_delete ON public.tickets;
CREATE TRIGGER trigger_update_tickets_count_delete
  AFTER DELETE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_giveaway_tickets_count();

-- 3. Create status transition validation function
CREATE OR REPLACE FUNCTION public.validate_giveaway_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prevent status changes if giveaway has ended
  IF OLD.ends_at IS NOT NULL AND OLD.ends_at < NOW() AND NEW.status != 'completed' AND NEW.status != 'cancelled' THEN
    RAISE EXCEPTION 'Cannot change status of expired giveaway to %', NEW.status;
  END IF;

  -- Validate status transitions
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    RAISE EXCEPTION 'Cannot change status from completed to %', NEW.status;
  END IF;

  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    RAISE EXCEPTION 'Cannot change status from cancelled to %', NEW.status;
  END IF;

  -- Auto-complete giveaways that have ended and have a winner
  IF NEW.ends_at IS NOT NULL AND NEW.ends_at < NOW() AND NEW.winner_id IS NOT NULL AND NEW.status = 'active' THEN
    NEW.status = 'completed';
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Create status transition trigger
DROP TRIGGER IF EXISTS trigger_validate_giveaway_status ON public.giveaways;
CREATE TRIGGER trigger_validate_giveaway_status
  BEFORE UPDATE ON public.giveaways
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_giveaway_status_transition();

-- 5. Enhanced pick_giveaway_winner function with seed/hash and better eligibility
CREATE OR REPLACE FUNCTION public.pick_giveaway_winner(giveaway_id UUID, random_seed TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  selected_winner UUID;
  eligible_count INTEGER;
  seed_value TEXT;
  hash_value TEXT;
BEGIN
  -- Check if giveaway exists and is eligible for winner selection
  IF NOT EXISTS (
    SELECT 1 FROM public.giveaways 
    WHERE id = giveaway_id 
    AND status IN ('active', 'review_pending')
    AND (ends_at IS NULL OR ends_at > NOW())
  ) THEN
    RAISE EXCEPTION 'Giveaway % is not eligible for winner selection', giveaway_id;
  END IF;

  -- Generate deterministic seed if not provided
  IF random_seed IS NULL THEN
    seed_value := giveaway_id::TEXT || extract(epoch from NOW())::TEXT;
  ELSE
    seed_value := random_seed;
  END IF;

  -- Create hash for reproducible randomness
  hash_value := encode(digest(seed_value, 'sha256'), 'hex');

  -- Count eligible participants
  SELECT COUNT(*) INTO eligible_count
  FROM public.tickets t
  JOIN auth.users u ON t.user_id = u.id
  LEFT JOIN public.onagui_profiles p ON p.user_id = t.user_id
  WHERE t.giveaway_id = pick_giveaway_winner.giveaway_id
    AND (
      u.email_confirmed_at IS NOT NULL
      OR p.is_verified = TRUE
    );

  IF eligible_count = 0 THEN
    RAISE EXCEPTION 'No eligible participants found for giveaway %', giveaway_id;
  END IF;

  -- Use hash to select winner deterministically
  WITH eligible_participants AS (
    SELECT t.user_id, 
           ROW_NUMBER() OVER (ORDER BY t.user_id) as row_num
    FROM public.tickets t
    JOIN auth.users u ON t.user_id = u.id
    LEFT JOIN public.onagui_profiles p ON p.user_id = t.user_id
    WHERE t.giveaway_id = pick_giveaway_winner.giveaway_id
      AND (
        u.email_confirmed_at IS NOT NULL
        OR p.is_verified = TRUE
      )
  )
  SELECT user_id INTO selected_winner
  FROM eligible_participants
  WHERE row_num = (('x' || substring(hash_value, 1, 8))::bit(32)::int % eligible_count) + 1;

  -- Save draft winner
  UPDATE public.giveaways
  SET temp_winner_id = selected_winner,
      status = 'review_pending',
      updated_at = NOW()
  WHERE id = giveaway_id;

  -- Log audit trail with seed info
  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, target_id, note)
  VALUES (
    giveaway_id, 
    'draft_winner', 
    auth.uid(), 
    selected_winner, 
    format('Winner selected using seed: %s, eligible participants: %s', seed_value, eligible_count)
  );

  RETURN selected_winner;
END;
$$;

-- 6. Enhanced finalize_giveaway_winner function with idempotency
CREATE OR REPLACE FUNCTION public.finalize_giveaway_winner(giveaway_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  final_winner UUID;
  current_status TEXT;
BEGIN
  SELECT temp_winner_id, status INTO final_winner, current_status
  FROM public.giveaways WHERE id = giveaway_id;

  IF final_winner IS NULL THEN
    RAISE EXCEPTION 'No temporary winner found for giveaway %', giveaway_id;
  END IF;

  -- Idempotency check
  IF current_status = 'completed' THEN
    RAISE NOTICE 'Giveaway % already completed', giveaway_id;
    RETURN;
  END IF;

  UPDATE public.giveaways
  SET winner_id = final_winner,
      status = 'completed',
      updated_at = NOW()
  WHERE id = giveaway_id;

  -- Log approval
  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, target_id, note)
  VALUES (giveaway_id, 'approve_winner', auth.uid(), final_winner, 'Winner approved and finalized');

  -- Release escrow if not already released
  PERFORM public.release_giveaway_escrow(giveaway_id);
END;
$$;

-- 7. Enhanced release_giveaway_escrow function with idempotency
CREATE OR REPLACE FUNCTION public.release_giveaway_escrow(giveaway_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  g RECORD;
BEGIN
  SELECT * INTO g FROM public.giveaways WHERE id = giveaway_id;
  
  IF g.winner_id IS NULL THEN
    RAISE EXCEPTION 'Cannot release escrow: no winner set for giveaway %', giveaway_id;
  END IF;

  -- Idempotency check
  IF g.escrow_status = 'released' THEN
    RAISE NOTICE 'Escrow already released for giveaway %', giveaway_id;
    RETURN;
  END IF;

  -- Only release if there's an escrow amount
  IF g.escrow_amount > 0 THEN
    -- Create transaction record (replace with your wallet logic)
    INSERT INTO public.transactions (user_id, amount, type, reference, created_at)
    VALUES (g.winner_id, g.escrow_amount, 'giveaway_payout', giveaway_id, NOW())
    ON CONFLICT DO NOTHING; -- Prevent duplicate transactions
  END IF;

  UPDATE public.giveaways
  SET escrow_status = 'released',
      updated_at = NOW()
  WHERE id = giveaway_id;

  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, note)
  VALUES (
    giveaway_id, 
    'escrow_released', 
    auth.uid(), 
    format('Prize amount %s released to winner %s', g.escrow_amount, g.winner_id)
  );
END;
$$;

-- 8. Function to get giveaways pending admin review
CREATE OR REPLACE FUNCTION public.get_giveaways_pending_review()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  prize_amount NUMERIC,
  tickets_count INTEGER,
  temp_winner_id UUID,
  temp_winner_email TEXT,
  created_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.title,
    g.description,
    g.prize_amount,
    g.tickets_count,
    g.temp_winner_id,
    u.email as temp_winner_email,
    g.created_at,
    g.ends_at
  FROM public.giveaways g
  LEFT JOIN auth.users u ON g.temp_winner_id = u.id
  WHERE g.status = 'review_pending'
  ORDER BY g.created_at DESC;
END;
$$;

-- 9. Update RLS policies to be more restrictive
DROP POLICY IF EXISTS manage_giveaways ON public.giveaways;
CREATE POLICY manage_giveaways ON public.giveaways
  FOR ALL
  USING (
    -- Admins can manage all giveaways
    EXISTS (
      SELECT 1 FROM onagui.user_roles ur
      JOIN onagui.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
    OR
    -- Users can only manage their own giveaways
    (creator_id = auth.uid())
  );

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winner(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_giveaway_winner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.repick_giveaway_winner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_giveaway_escrow(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_giveaways_pending_review() TO authenticated;

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_giveaways_status_ends_at ON public.giveaways(status, ends_at);
CREATE INDEX IF NOT EXISTS idx_giveaways_temp_winner ON public.giveaways(temp_winner_id) WHERE temp_winner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_giveaway_audit_giveaway_action ON public.giveaway_audit(giveaway_id, action);

COMMENT ON FUNCTION public.pick_giveaway_winner(UUID, TEXT) IS 'Selects a random eligible winner using deterministic seed/hash for reproducibility';
COMMENT ON FUNCTION public.get_giveaways_pending_review() IS 'Returns giveaways that need admin review for winner approval';