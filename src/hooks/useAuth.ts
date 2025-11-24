"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

export function useAuth() {
  const supabase = createSupabaseClient();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Resolve initial session via getSession (more reliable with cookie storage)
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(session?.user ?? null);

        // Fallback: if session is null, verify via server to handle cookie propagation
        if (!session) {
          try {
            const res = await fetch('/api/verify-session', { cache: 'no-store' });
            if (res.ok) {
              const json = await res.json();
              setUser(json.user ?? null);
            }
          } catch (err) {
            // swallow
          }
        }
      } catch (e) {
        console.error("useAuth: getSession error", e);
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading, supabase };
}