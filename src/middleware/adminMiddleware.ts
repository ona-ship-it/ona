import { createServerClient, type CookieOptions } from '@supabase/ssr'; 
import { cookies } from 'next/headers'; 

export const createAdminClient = async () => { 
  const cookieStore = await cookies(); // Now awaiting the Promise

  return createServerClient( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { 
      cookies: { 
        get(name: string) { 
          return cookieStore.get(name)?.value; 
        }, 
        set(name: string, value: string, options?: CookieOptions) { 
          try { 
            cookieStore.set({ name, value, ...options }); 
          } catch (error) { 
            console.error('Cookie set failed:', error); 
          } 
        }, 
        remove(name: string, options?: CookieOptions) { 
          try { 
            cookieStore.delete({ name, ...options }); 
          } catch (error) { 
            console.error('Cookie delete failed:', error); 
          } 
        }, 
      }, 
    } 
  ); 
}; 

// Example admin check helper 
export async function requireAdmin(userId: string) { 
  const supabase = await createAdminClient(); 
  const { data, error } = await supabase 
    .from('onagui.user_roles') 
    .select('role_id') 
    .eq('user_id', userId) 
    .limit(1) 
    .single(); 

  if (error || !data) return false; 

  const { data: role } = await supabase 
    .from('onagui.roles') 
    .select('name') 
    .eq('id', data.role_id) 
    .single(); 

  return role?.name === 'admin';
}