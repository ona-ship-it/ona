import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export const createClient = () => {
  return createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  });
};