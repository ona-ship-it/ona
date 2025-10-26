
-- Clean is_admin_user function
-- Execute this in Supabase SQL Editor if needed

DROP FUNCTION IF EXISTS is_admin_user(uuid);

CREATE OR REPLACE FUNCTION is_admin_user(user_uuid uuid) 
RETURNS boolean AS $$ 
BEGIN 
  RETURN EXISTS ( 
    SELECT 1 FROM public.onagui_profiles 
    WHERE id = user_uuid AND onagui_type = 'admin' 
  ); 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;
