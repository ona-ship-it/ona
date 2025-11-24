export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import GiveawaysClient from '../../components/GiveawaysClient';

export default async function Page() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const isAuthed = !!user;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-end">
        {isAuthed && (
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
