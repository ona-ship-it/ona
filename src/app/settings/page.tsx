"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar section */}
        <aside className="md:col-span-1 bg-white/5 rounded-xl border border-white/10 p-4">
          <nav className="space-y-2">
            <Link href="/profile" className="block px-3 py-2 rounded-md bg-gray-800 text-gray-100 hover:bg-gray-700">My Profile</Link>
            <Link href="/account" className="block px-3 py-2 rounded-md bg-gray-800 text-gray-100 hover:bg-gray-700">My Account</Link>
            {signedIn && (
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
                className="w-full text-left px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            )}
          </nav>
        </aside>

        {/* Main content placeholder */}
        <section className="md:col-span-2 bg-white/5 p-6 rounded-xl shadow-lg border border-white/10">
          <p className="text-gray-300">Manage your account and preferences here.</p>
          <p className="text-gray-400 mt-3 text-sm">Profile, security, notifications, and theme settings will appear here.</p>
        </section>
      </div>
    </div>
  );
}