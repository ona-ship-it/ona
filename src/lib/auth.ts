"use client";

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { isAdmin as hasAdminAccess } from '@/lib/admin';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    let mounted = true;

    async function loadAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(user || null);

        if (user) {
          if (!mounted) return;
          setIsAdmin(hasAdminAccess(user.email));
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        if (!mounted) return;
        setUser(null);
        setIsAdmin(false);
      }
    }

    loadAuth();
    return () => { mounted = false; };
  }, [supabase]);

  return { user, isAdmin };
}
