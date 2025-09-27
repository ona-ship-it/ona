"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthButtons() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!session) {
    return (
      <div className="flex gap-2">
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
        >
          Sign In / Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Link
        href="/account"
        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
      >
        My Account
      </Link>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
}