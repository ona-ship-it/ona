'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useWalletServices } from '@/components/WalletServicesProvider';
import WalletBalance from '@/components/WalletBalance';
import { Loader2, Ticket, ShieldCheck, AlertTriangle } from 'lucide-react';

interface EnterGiveawayButtonProps {
  giveawayId: string;
  ticketPrice?: number;
  title?: string;
}

export default function EnterGiveawayButton({ giveawayId, ticketPrice = 0, title }: EnterGiveawayButtonProps) {
  const router = useRouter();
  const { isInitialized, isLoading, error: servicesError } = useWalletServices();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    fetchUser();
  }, []);

  const handleClick = async () => {
    const { data } = await supabase.auth.getSession();
    const isSignedIn = !!data.session?.user;
    if (!isSignedIn) {
      router.push(`/login?next=/giveaways/${giveawayId}`);
      return;
    }
    setOpen(true);
  };

  const total = (ticketPrice || 0) * (quantity || 0);
  const canPurchase = isInitialized && !servicesError;

  const submitEntry = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/giveaways/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId, quantity }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to enter giveaway');
      }
      setOpen(false);
      setQuantity(1);
      router.refresh();
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to enter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium"
      >
        <Ticket className="w-4 h-4" />
        Enter Giveaway
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-white/20 bg-[#0D0C12] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Enter Giveaway</h3>
                {title && <p className="text-sm text-muted-foreground">{title}</p>}
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg p-4 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ticket price</span>
                  <span className="font-semibold">{ticketPrice > 0 ? `$${ticketPrice.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="mt-3">
                  <label className="text-sm block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm">Total</span>
                  <span className="font-semibold">{total > 0 ? `$${total.toFixed(2)}` : 'Free'}</span>
                </div>
              </div>

              {userId && (
                <WalletBalance userId={userId} showTickets={true} className="mt-2" />
              )}

              {!canPurchase && (
                <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-900/20 p-3 text-yellow-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Wallet services are not ready yet. Please try again soon.</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Secure escrow. Funds deducted only on confirm.</span>
                </div>
              </div>

              {submitError && (
                <p className="text-red-400 text-sm">{submitError}</p>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-white/20 bg-transparent px-4 py-2"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={submitEntry}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white"
                  disabled={submitting || !canPurchase}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}