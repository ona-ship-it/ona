-- Move Fundraise Tables from onagui to public schema
-- Run this in Supabase SQL Editor

-- Move tables to public schema
ALTER TABLE IF EXISTS onagui.fundraisers SET SCHEMA public;
ALTER TABLE IF EXISTS onagui.donations SET SCHEMA public;
ALTER TABLE IF EXISTS onagui.fundraiser_updates SET SCHEMA public;
ALTER TABLE IF EXISTS onagui.fundraiser_comments SET SCHEMA public;

-- Update table ownership
ALTER TABLE public.fundraisers OWNER TO postgres;
ALTER TABLE public.donations OWNER TO postgres;
ALTER TABLE public.fundraiser_updates OWNER TO postgres;
ALTER TABLE public.fundraiser_comments OWNER TO postgres;
