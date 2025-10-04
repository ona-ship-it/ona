import { createServerClient, type CookieOptions } from '@supabase/ssr'; 
import { cookies } from 'next/headers'; 

// Safely initialize Supabase Admin Client (Server-side) 
export function createAdminClient() { 
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; 
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

  if (!supabaseUrl || !serviceKey) { 
    throw new Error('Missing Supabase environment variables.'); 
  } 

  const cookieStore = cookies();

  const supabase = createServerClient(supabaseUrl, serviceKey, { 
    cookies: { 
      get(name: string) { 
        // Handle cookies synchronously for SSR compatibility
        return cookieStore.get(name)?.value;
      }, 
      set(name: string, value: string, options?: CookieOptions) { 
        try { 
          cookieStore.set({ name, value, ...options }); 
        } catch (err) { 
          console.warn('Failed to set cookie:', err); 
        } 
      }, 
      remove(name: string, options?: CookieOptions) { 
        try { 
          cookieStore.set({ name, value: '', ...options }); 
        } catch (err) { 
          console.warn('Failed to remove cookie:', err); 
        } 
      }, 
    }, 
  }); 

  return supabase; 
} 

// Example middleware usage 
export async function requireAdmin(userId: string): Promise<boolean> { 
  const supabase = createAdminClient(); 

  const { data, error } = await supabase 
    .from('onagui.user_roles') 
    .select('role_id') 
    .eq('user_id', userId) 
    .single(); 

  if (error) { 
    console.error('Admin check failed:', error); 
    return false; 
  } 

  // Validate admin role via roles table 
  const { data: role } = await supabase 
    .from('onagui.roles') 
    .select('name') 
    .eq('id', data.role_id) 
    .single(); 

  return role?.name === 'admin'; 
}