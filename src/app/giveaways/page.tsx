export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import GiveawaysClient from '../../components/GiveawaysClient';

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? '';
        },
        set(name: string, value: string, options: { path?: string; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: 'lax' | 'strict' | 'none'; maxAge?: number }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string) {
          cookieStore.delete(name);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-end">
        {user && (
          <Link
            href="/giveaways/new"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
          >
            Create your giveaway
          </Link>
        )}
      </div>
      <GiveawaysClient />
    </div>
  );
}
