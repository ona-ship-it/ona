"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type AdminContextType = {
  isAdmin: boolean | null; // null while loading
  loading: boolean;
  refresh: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType>({ isAdmin: null, loading: true, refresh: async () => {} });

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/is-admin", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin status");
      const data = await res.json();
      setIsAdmin(data.isAdmin ?? false);
    } catch (err) {
      console.error("Admin check failed:", err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    // Initial check
    fetchAdminStatus();

    // Listen for auth changes and refresh admin status
    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      await fetchAdminStatus();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, loading, refresh: fetchAdminStatus }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);