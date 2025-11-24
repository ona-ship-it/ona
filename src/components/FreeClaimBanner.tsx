'use client';

import { useState } from 'react';

interface Props {
  giveawayId: string;
  show?: boolean; // show banner when claim=free or always if true
}

export default function FreeClaimBanner({ giveawayId, show = true }: Props) {
  const [status, setStatus] = useState<'idle' | 'claiming' | 'success' | 'exists' | 'unauth' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const claim = async () => {
    try {
      setStatus('claiming');
      const resp = await fetch(`/api/giveaways/${giveawayId}/claim-free`, { method: 'POST' });
      const data = await resp.json();

      if (resp.status === 401 || data?.error === 'Not authenticated') {
        setStatus('unauth');
        setMessage('You need an Onagui account to claim your free ticket.');
        return;
      }

      if (!data?.success) {
        setStatus('error');
        setMessage(data?.error || 'Something went wrong.');
        return;
      }

      if (data?.already) {
        setStatus('exists');
        setMessage('You already have a free ticket for this giveaway.');
        return;
      }

      setStatus('success');
      setMessage('Congratulations! You just claimed a free ticket.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Unexpected error.');
    }
  };

  const loginUrl = `/signin?redirectTo=/giveaways/${giveawayId}%3Fclaim%3Dfree`;
  const signupUrl = `/signup?redirect=/giveaways/${giveawayId}%3Fclaim%3Dfree`;

  if (!show) return null;

  return (
    <div className="mt-4 space-y-2">
      {status === 'idle' && (
        <div className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded flex items-center justify-between">
          <span>Claim a free ticket for this giveaway.</span>
          <button onClick={claim} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md">Claim</button>
        </div>
      )}

      {status === 'claiming' && (
        <div className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded">
          Claiming your free ticket...
        </div>
      )}

      {status === 'unauth' && (
        <div className="bg-yellow-100/20 border border-yellow-400/30 text-yellow-200 px-4 py-3 rounded">
          <p className="mb-2">{message}</p>
          <div className="flex gap-4">
            <a href={signupUrl} className="underline">Create an account</a>
            <a href={loginUrl} className="underline">Log in</a>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-600/20 border border-green-500/40 text-green-200 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {status === 'exists' && (
        <div className="bg-green-600/20 border border-green-500/40 text-green-200 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-600/20 border border-red-500/40 text-red-200 px-4 py-3 rounded">
          {message}
        </div>
      )}
    </div>
  );
}