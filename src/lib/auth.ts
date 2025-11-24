"use client";

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabaseClient';

interface AuthState {
  user: any;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<any>(null);
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
          const { data: adminData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
          if (!mounted) return;
          setIsAdmin(!!adminData);
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