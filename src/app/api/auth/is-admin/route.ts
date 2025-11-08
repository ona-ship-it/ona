import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          // Cast to any to satisfy Next types for setting/deleting in route handlers
          set(name: string, value: string, options: any) {
            (cookieStore as any).set(name, value, options);
          },
          remove(name: string, options: any) {
            (cookieStore as any).delete(name, options);
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ ok: false, isAdmin: false });
    }

    const { data, error } = await (supabase as any).rpc('is_admin_user', {
      user_uuid: user.id,
    });

    if (error) {
      console.error('[is-admin] RPC error:', error);
      return Response.json({ ok: false, error: error.message });
    }

    return Response.json({ ok: true, isAdmin: !!data, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error('[is-admin] Unexpected error:', err);
    return Response.json({ ok: false, error: err?.message ?? 'Unknown error' });
  }
}