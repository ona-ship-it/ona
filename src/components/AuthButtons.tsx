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
          className="group bg-onaguiGreen hover:bg-onaguiGreen-dark text-white font-semibold rounded-full shadow-lg flex items-center justify-center w-10 h-10 transition-all duration-300 ease-in-out overflow-hidden hover:w-28 md:hover:w-28 sm:hover:w-24 touch-manipulation relative"
          aria-label="Sign In or Sign Up"
        >
          <span className="text-2xl font-extrabold transition-all duration-300 z-10 absolute left-1/2 transform -translate-x-1/2 group-hover:left-3 group-hover:translate-x-0">
            +
          </span>
          <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all duration-300 text-sm absolute right-3 text-right">
            Sign up
          </span>
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