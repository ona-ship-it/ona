"use client";
export const dynamic = 'force-dynamic';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) return;
      setUser(data.user ?? null);
    });
  }, [supabase]);

  if (!user) return <p>Please sign in to view your account.</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <div className="border p-4 rounded-lg bg-gray-50">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Sign Out
      </button>
    </div>
  );
}