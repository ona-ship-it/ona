export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import GiveawaysClient from '../../components/GiveawaysClient';

export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-end">
        <Link
          href="/giveaways/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
        >
          Create your giveaway
        </Link>
      </div>
      <GiveawaysClient />
    </div>
  );
}
