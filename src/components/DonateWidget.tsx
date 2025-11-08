"use client";

import { useState } from 'react';

type Props = {
  giveawayId: string;
  defaultSplit: { platform: number; creator: number; prize: number };
};

export default function DonateWidget({ giveawayId, defaultSplit }: Props) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    pool_amount: number;
    creator_amount: number;
    platform_amount: number;
    donation_pool_total: number;
    creator_earnings_total: number;
    platform_earnings_total: number;
  }>(null);

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Please enter a valid amount (> 0).');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/giveaways/${giveawayId}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Donation failed');
      } else {
        const payload = Array.isArray(json.data) ? json.data[0] : json.data;
        setResult(payload);
        setAmount('');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleDonate} className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Donation amount (USDT)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
            placeholder="10.00"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Split: Prize {(defaultSplit.prize * 100).toFixed(0)}% · Creator {(defaultSplit.creator * 100).toFixed(0)}% · Platform {(defaultSplit.platform * 100).toFixed(0)}%
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {loading ? 'Processing…' : 'Donate'}
        </button>
      </form>

      {error && (
        <div className="text-xs text-red-400">{error}</div>
      )}

      {result && (
        <div className="rounded-md border border-white/20 bg-white/5 p-3 text-xs">
          <div className="font-semibold mb-1">Donation applied</div>
          <div>Prize share: {Number(result.pool_amount).toFixed(2)} → pool total: {Number(result.donation_pool_total).toFixed(2)}</div>
          <div>Creator share: {Number(result.creator_amount).toFixed(2)} → earnings: {Number(result.creator_earnings_total).toFixed(2)}</div>
          <div>Platform share: {Number(result.platform_amount).toFixed(2)} → earnings: {Number(result.platform_earnings_total).toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}