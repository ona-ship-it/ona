import React, { useEffect, useState } from 'react';
import GiveawayList from './GiveawayList';
import { supabase } from '../lib/supabaseClient';

export default function LandingPage({ onNavigate }) {
  const [giveaways, setGiveaways] = useState([]);
  const [subscribeError, setSubscribeError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setSubscribeError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    let channel;
    let mounted = true;

    async function init() {
      try {
        // Initial load
        const { data, error } = await supabase
          .from('giveaways')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (mounted) setGiveaways(data || []);

        // Realtime subscription
        channel = supabase
          .channel('public:giveaways')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'giveaways' },
            (payload) => {
              setGiveaways((prev) => {
                if (payload.eventType === 'INSERT') {
                  return [payload.new, ...prev];
                }
                if (payload.eventType === 'UPDATE') {
                  return prev.map((g) => (g.id === payload.new.id ? payload.new : g));
                }
                if (payload.eventType === 'DELETE') {
                  return prev.filter((g) => g.id !== payload.old.id);
                }
                return prev;
              });
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Supabase subscription error:', err);
        setSubscribeError(err?.message || 'Failed to load/subscribe to giveaways.');
      }
    }

    init();
    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);
  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-neutral-800" aria-hidden />
            <span className="font-semibold">ONAGUI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button className="hover:text-white text-neutral-300">Fundraise</button>
            <button className="hover:text-white text-neutral-300">Giveaways</button>
            <button className="hover:text-white text-neutral-300">Marketplace</button>
            <button className="hover:text-white text-neutral-300">Raffles</button>
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">Wallet / Deposit</button>
            <button onClick={() => onNavigate('/create')} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500">Create</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Discover and Create High-Fidelity Giveaways</h1>
            <p className="mt-3 text-neutral-300">A modern, dark, high-contrast experience for launching and exploring giveaways.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => onNavigate('/create')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500">Start a Giveaway</button>
              <button className="rounded-lg border border-neutral-800 px-4 py-2 text-sm hover:border-neutral-700">Learn More</button>
            </div>
          </div>
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 h-40 md:h-56" aria-label="Hero artwork" />
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
          <input
            type="text"
            placeholder="Search giveaways…"
            className="w-full rounded-lg bg-neutral-800 px-4 py-2 text-sm placeholder-neutral-400 outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </section>

      {/* Featured Giveaways */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Giveaways</h2>
          <button className="text-sm text-neutral-400 hover:text-white">View all</button>
        </div>
        <div className="mt-4">
          {subscribeError && (
            <div className="mb-4 rounded-lg border border-red-600 bg-red-900/30 px-4 py-3 text-sm text-red-200">
              {subscribeError}
            </div>
          )}
          <GiveawayList giveaways={giveaways} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-400">© {new Date().getFullYear()} ONAGUI</div>
      </footer>
    </div>
  );
}