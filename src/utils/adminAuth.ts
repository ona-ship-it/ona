import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from '@/types/supabase';

export interface AdminAuthResult {
  success: boolean;
  user?: any;
  error?: string;
  response?: NextResponse;
}

/**
 * Utility function to check admin authentication in Next.js 15 route handlers
 * This ensures consistent session checking and admin privilege verification
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Get cookies for Next.js 15 compatibility
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Step 1: Check session server-side to ensure cookies are synced
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('Admin auth failed - No valid session:', sessionError?.message);
      return {
        success: false,
        error: 'No valid session',
        response: NextResponse.redirect(new URL("/signin", request.url))
      };
    }

    // Step 2: Verify user exists and is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Admin auth failed - User verification failed:', userError?.message);
      return {
        success: false,
        error: 'User verification failed',
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      };
    }

    // Step 3: Check if user has admin privileges using the is_admin_user RPC function
    const { data: isAdmin, error: adminCheckError } = await supabase
      .rpc('is_admin_user', { user_uuid: user.id });

    if (adminCheckError || !isAdmin) {
      console.log('Admin auth failed - Insufficient privileges:', {
        userId: user.id,
        email: user.email,
        isAdmin,
        error: adminCheckError?.message
      });
      return {
        success: false,
        error: 'Insufficient privileges',
        response: NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        )
      };
    }

    // All checks passed
    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Admin auth verification error:', error);
    return {
      success: false,
      error: 'Internal server error',
      response: NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      )
    };
  }
}

/**
 * Higher-order function to wrap admin route handlers with authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.success) {
      return authResult.response!;
    }
    
    return handler(request, authResult.user);
  };
}

/**
 * Create a Supabase client with proper cookie configuration for admin operations
 */
export async function createAdminSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}