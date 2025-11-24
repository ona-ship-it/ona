import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { handleCreateGiveaway } from '../lib/apiHandler.js';

export default function CreatePage({ onNavigate }) {
  // Phase 2: Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeAmount, setPrizeAmount] = useState(''); // keep as string for controlled input
  const [endsAt, setEndsAt] = useState('');

  const errors = useMemo(() => {
    const e = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) e.title = 'Title is required.';
    if (trimmedTitle.length > 100) e.title = 'Title must be ≤ 100 characters.';

    const trimmedDesc = description.trim();
    if (!trimmedDesc) e.description = 'Description is required.';

    const num = Number(prizeAmount);
    if (!prizeAmount || Number.isNaN(num)) e.prize_amount = 'Prize amount must be a number.';
    else if (num <= 0) e.prize_amount = 'Prize amount must be greater than 0.';

    if (!endsAt) e.ends_at = 'End date/time is required.';
    else {
      const ends = new Date(endsAt);
      const now = new Date();
      if (Number.isNaN(ends.getTime())) e.ends_at = 'End date/time is invalid.';
      else if (ends <= now) e.ends_at = 'End date/time must be in the future.';
    }

    return e;
  }, [title, description, prizeAmount, endsAt]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // API state
  const { user } = useAuth();
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSaveDraft() {
    setApiError('');
    if (!isValid) return;
    if (!user?.id) {
      setApiError('You must be logged in to create a giveaway.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        prize_amount: Number(prizeAmount),
        endsAt: new Date(endsAt),
        creator_id: user.id,
      };
      await handleCreateGiveaway(payload);
      onNavigate('/');
    } catch (e) {
      console.error('Create giveaway error:', e);
      setApiError(e?.message || 'Failed to create giveaway.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div>
      {/* Header (reuse style) */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-neutral-800" aria-hidden />
            <span className="font-semibold">ONAGUI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => onNavigate('/')} className="hover:text-white text-neutral-300">Home</button>
            <button className="hover:text-white text-neutral-300">Giveaways</button>
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">Wallet / Deposit</button>
          </div>
        </div>
      </header>

      {/* Create Form Scaffold */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Create a Giveaway</h1>
        <p className="mt-2 text-neutral-300">Draft your giveaway details. Security fields like creator_id and status are set automatically and are not user-editable.</p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Title</label>
            <input
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              placeholder="e.g., Win a Smartwatch"
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm h-28 focus:ring-2 focus:ring-indigo-600 outline-none"
              placeholder="Describe the giveaway and rules"
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Prize Amount (fiat)</label>
              <input
                type="number"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="e.g., 10"
                min="0"
                step="0.01"
              />
              {errors.prize_amount && <p className="text-xs text-red-400">{errors.prize_amount}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Ends At</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              />
              {errors.ends_at && <p className="text-xs text-red-400">{errors.ends_at}</p>}
            </div>
          </div>
        </div>

        {/* Error Message Box */}
        {apiError && (
          <div className="mt-4 rounded-lg border border-red-600 bg-red-900/30 px-4 py-3 text-sm text-red-200">
            {apiError}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button className="rounded-lg bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700" onClick={() => onNavigate('/')}>Cancel</button>
          <button
            className={`rounded-lg px-4 py-2 text-sm ${isValid ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-neutral-700 cursor-not-allowed'} ${saving ? 'opacity-70' : ''}`}
            disabled={!isValid || saving}
            title={!isValid ? 'Please fix validation errors before saving.' : 'Save Draft'}
            onClick={onSaveDraft}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-400">© {new Date().getFullYear()} ONAGUI</div>
      </footer>
    </div>
  );
}