import { useEffect, useState } from 'react';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdminStatus(): AdminStatus {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/is-admin', { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setIsAdmin(!!json?.isAdmin);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to fetch admin status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return { isAdmin, loading, error };
}