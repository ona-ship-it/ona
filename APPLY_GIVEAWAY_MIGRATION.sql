-- =========================================================
-- 20251101_giveaway_winner_review.sql
-- Reviewed Winner Selection System for Onagui Giveaways
-- =========================================================

-- 1. Create giveaway_audit table if not exists
CREATE TABLE IF NOT EXISTS public.giveaway_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID REFERENCES public.giveaways(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.giveaway_audit IS 'Tracks actions performed on giveaways: draft, approve, reject, payout, etc.';


-- 2. Add new columns to giveaways if missing
ALTER TABLE public.giveaways
ADD COLUMN IF NOT EXISTS temp_winner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending','released')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active','review_pending','completed','cancelled'));


-- 3. Function: pick_giveaway_winner()
CREATE OR REPLACE FUNCTION public.pick_giveaway_winner(giveaway_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  selected_winner UUID;
BEGIN
  -- Pick a random verified participant
  SELECT t.user_id INTO selected_winner
  FROM public.tickets t
  JOIN auth.users u ON t.user_id = u.id
  LEFT JOIN public.onagui_profiles p ON p.user_id = t.user_id
  WHERE t.giveaway_id = pick_giveaway_winner.giveaway_id
    AND (
      u.email_confirmed_at IS NOT NULL
      OR p.is_verified = TRUE
    )
  ORDER BY random()
  LIMIT 1;

  IF selected_winner IS NULL THEN
    RAISE EXCEPTION 'No eligible participants found for giveaway %', giveaway_id;
  END IF;

  -- Save draft winner
  UPDATE public.giveaways
  SET temp_winner_id = selected_winner,
      status = 'review_pending'
  WHERE id = giveaway_id;

  -- Log audit trail
  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, target_id, note)
  VALUES (giveaway_id, 'draft_winner', auth.uid(), selected_winner, 'System picked random eligible user');

  RETURN selected_winner;
END;
$$;


-- 4. Function: finalize_giveaway_winner()
CREATE OR REPLACE FUNCTION public.finalize_giveaway_winner(giveaway_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  final_winner UUID;
BEGIN
  SELECT temp_winner_id INTO final_winner
  FROM public.giveaways WHERE id = giveaway_id;

  IF final_winner IS NULL THEN
    RAISE EXCEPTION 'No temporary winner found for giveaway %', giveaway_id;
  END IF;

  UPDATE public.giveaways
  SET winner_id = final_winner,
      status = 'completed'
  WHERE id = giveaway_id;

  -- Log approval
  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, target_id, note)
  VALUES (giveaway_id, 'approve_winner', auth.uid(), final_winner, 'Winner approved by admin or organizer');

  PERFORM public.release_giveaway_escrow(giveaway_id);
END;
$$;


-- 5. Function: repick_giveaway_winner()
CREATE OR REPLACE FUNCTION public.repick_giveaway_winner(giveaway_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_winner UUID;
BEGIN
  -- Log rejection
  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, note)
  VALUES (giveaway_id, 'reject_winner', auth.uid(), 'Draft winner rejected, repicking');

  -- Repick using same logic
  SELECT public.pick_giveaway_winner(giveaway_id) INTO new_winner;
  RETURN new_winner;
END;
$$;


-- 6. Function: release_giveaway_escrow()
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

  -- Example transaction (replace with your wallet logic)
  INSERT INTO public.transactions (user_id, amount, type, reference)
  VALUES (g.winner_id, g.escrow_amount, 'payout', giveaway_id);

  UPDATE public.giveaways
  SET escrow_status = 'released'
  WHERE id = giveaway_id;

  INSERT INTO public.giveaway_audit (giveaway_id, action, actor_id, note)
  VALUES (giveaway_id, 'escrow_released', auth.uid(), 'Prize released to winner wallet');
END;
$$;


-- 7. Permissions (optional, adjust as needed)
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_giveaway_winner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.repick_giveaway_winner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_giveaway_escrow(UUID) TO service_role;

-- Done ✅