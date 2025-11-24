import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({ user: null });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let unsub;
    async function init() {
      if (!supabase) return;
      // Set initial user
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      // Subscribe to auth state changes
      unsub = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      }).data?.subscription;
    }
    init();
    return () => {
      unsub && unsub.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}