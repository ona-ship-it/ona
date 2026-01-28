-- Fix Schema Migration - Move all tables from onagui schema to public schema
-- Run this in Supabase SQL Editor

-- 1. Drop existing triggers (we'll recreate them with correct schema)
DROP TRIGGER IF EXISTS on_donation_confirmed ON onagui.donations;
DROP TRIGGER IF EXISTS on_donation_confirmed_update_donors ON onagui.donations;
DROP TRIGGER IF EXISTS fundraisers_updated_at ON onagui.fundraisers;
DROP TRIGGER IF EXISTS on_donation_confirmed ON public.donations;
DROP TRIGGER IF EXISTS on_donation_confirmed_update_donors ON public.donations;
DROP TRIGGER IF EXISTS fundraisers_updated_at ON public.fundraisers;

-- 2. Move Fundraise Tables to public schema (if they exist in onagui)
ALTER TABLE IF EXISTS onagui.fundraisers SET SCHEMA public;
ALTER TABLE IF EXISTS onagui.donations SET SCHEMA public;
ALTER TABLE IF EXISTS onagui.fundraiser_updates SET SCHEMA public;
ALTER TABLE IF EXISTS onagui.fundraiser_comments SET SCHEMA public;

-- 3. Move Wallets table to public schema (if it exists in onagui)
ALTER TABLE IF EXISTS onagui.wallets SET SCHEMA public;

-- 4. Update table ownership
ALTER TABLE IF EXISTS public.fundraisers OWNER TO postgres;
ALTER TABLE IF EXISTS public.donations OWNER TO postgres;
ALTER TABLE IF EXISTS public.fundraiser_updates OWNER TO postgres;
ALTER TABLE IF EXISTS public.fundraiser_comments OWNER TO postgres;
ALTER TABLE IF EXISTS public.wallets OWNER TO postgres;

-- 5. Grant necessary permissions
GRANT ALL ON public.fundraisers TO postgres;
GRANT ALL ON public.donations TO postgres;
GRANT ALL ON public.fundraiser_updates TO postgres;
GRANT ALL ON public.fundraiser_comments TO postgres;
GRANT ALL ON public.wallets TO postgres;

-- 6. Grant anon and authenticated roles access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.fundraisers TO anon, authenticated;
GRANT SELECT, INSERT ON public.donations TO anon, authenticated;
GRANT SELECT, INSERT ON public.fundraiser_updates TO anon, authenticated;
GRANT SELECT, INSERT ON public.fundraiser_comments TO anon, authenticated;
GRANT SELECT, UPDATE ON public.wallets TO authenticated;

-- 7. Recreate functions with correct schema references
CREATE OR REPLACE FUNCTION update_fundraiser_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE public.fundraisers
    SET 
      raised_amount = raised_amount + NEW.amount,
      total_donations = total_donations + 1,
      updated_at = NOW()
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_fundraiser_donor_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE public.fundraisers
    SET total_donors = (
      SELECT COUNT(DISTINCT COALESCE(user_id::text, wallet_address))
      FROM public.donations
      WHERE fundraiser_id = NEW.fundraiser_id AND status = 'confirmed'
    )
    WHERE id = NEW.fundraiser_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Recreate triggers on public schema tables
CREATE TRIGGER on_donation_confirmed
  AFTER INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_raised_amount();

CREATE TRIGGER on_donation_confirmed_update_donors
  AFTER INSERT OR UPDATE OF status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_fundraiser_donor_count();

CREATE TRIGGER fundraisers_updated_at
  BEFORE UPDATE ON public.fundraisers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 9. Verify tables are in public schema
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('fundraisers', 'donations', 'fundraiser_updates', 'fundraiser_comments', 'wallets')
ORDER BY table_schema, table_name;

