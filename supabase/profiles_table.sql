-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT,
  userType TEXT,
  isVerified BOOLEAN DEFAULT FALSE,
  linkX BOOLEAN DEFAULT FALSE,
  balance TEXT,
  currency TEXT DEFAULT 'USD',
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  referralCode TEXT,
  referralCount INTEGER DEFAULT 0,
  completedAchievements TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'preferred_username' OR SPLIT_PART(new.email, '@', 1), 
    new.raw_user_meta_data->>'avatar_url', 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();