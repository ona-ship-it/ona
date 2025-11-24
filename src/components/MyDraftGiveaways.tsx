"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';

type DraftGiveaway = {
  id: string;
  title?: string | null;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
};

export default function MyDraftGiveaways() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftGiveaway[]>([]);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [activatedId, setActivatedId] = useState<string | null>(null);
  const [toast, setToast] = useState<null | { message: string; type: 'success' | 'error' }>(null);

  // Auto-hide toast after a short delay
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchDraftsFor(uid: string) {
    const { data, error } = await supabase
      .from('giveaways')
      .select('id, title, description, status, created_at')
      .eq('creator_id', uid)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setDrafts((data || []) as DraftGiveaway[]);
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserId(null);
          setDrafts([]);
          return;
        }
        setUserId(user.id);
        if (mounted) await fetchDraftsFor(user.id);
      } catch (err: any) {
        setError(err.message || 'Failed to load drafts');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [supabase]);

  async function activate(id: string) {
    try {
      setActivatingId(id);
      setError(null);
      const res = await fetch(`/api/giveaways/${id}/activate`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Activation failed');
      }
      setActivatedId(id);
      setToast({ message: 'Giveaway activated successfully', type: 'success' });
      // Refetch drafts to keep UI in sync
      if (userId) {
        await fetchDraftsFor(userId);
      }
      // Refresh server components / other lists on the page
      try {
        router.refresh();
      } catch {}
      // Broadcast a custom event for any listeners
      try {
        window.dispatchEvent(new CustomEvent('giveaway:activated', { detail: { id } }));
      } catch {}
    } catch (err: any) {
      const msg = err.message || 'Activation failed';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setActivatingId(null);
    }
  }

  if (!userId) {
    return null;
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Draft Giveaways</h2>
          {activatedId && (
            <span className="text-green-600 text-sm">Activated successfully</span>
          )}
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading drafts…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : drafts.length === 0 ? (
          <div className="text-sm text-gray-500">No drafts yet. Use "Save as Draft" on the creation page.</div>
        ) : (
          <ul className="space-y-3">
            {drafts.map((g) => (
              <li key={g.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded p-3">
                <div>
                  <div className="font-medium">{g.title || g.description.slice(0, 60)}</div>
                  <div className="text-xs text-gray-500">Saved {new Date(g.created_at).toLocaleString()}</div>
                </div>
                <button
                  className={`px-3 py-1 rounded text-sm font-medium ${activatingId === g.id ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  onClick={() => activate(g.id)}
                  disabled={activatingId === g.id}
                  aria-disabled={activatingId === g.id}
                >
                  {activatingId === g.id ? 'Activating…' : 'Activate'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
        >
          {toast.message}
        </div>
      )}
    </section>
  );
}
