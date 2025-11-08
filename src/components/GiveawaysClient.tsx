'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { FaXTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa6';
import { FaTelegramPlane } from 'react-icons/fa';

interface Giveaway {
  id: string;
  title?: string;
  description?: string;
  prize_amount?: number;
  status?: string;
  created_at?: string;
  creator_id?: string;
  media_url?: string;
  ends_at?: string;
  ticket_price?: number;
  prize_pool_usdt?: number;
  donation_split_platform?: number;
  donation_split_creator?: number;
  donation_split_prize?: number;
  creator?: {
    id: string;
    username?: string | null;
    avatar_url?: string | null;
    onagui_type?: string | null;
  } | null;
}

export default function GiveawaysClient() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationInputs, setDonationInputs] = useState<Record<string, string>>({});
  const [donating, setDonating] = useState<Record<string, boolean>>({});
  const [copying, setCopying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchGiveaways();
  }, []);

  const fetchGiveaways = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/giveaways');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGiveaways(data.giveaways || []);
    } catch (err: any) {
      console.error('Error fetching giveaways:', err);
      setError(err.message || 'Failed to load giveaways');
    } finally {
      setLoading(false);
    }
  };

  const formatRank = (type?: string | null) => {
    if (!type) return 'User';
    switch (type) {
      case 'vip': return 'VIP';
      case 'subscriber': return 'Subscriber';
      default: return 'User';
    }
  };

  const handleDonationChange = (id: string, value: string) => {
    setDonationInputs((prev) => ({ ...prev, [id]: value }));
  };

  const submitDonation = async (id: string) => {
    const amt = Number(donationInputs[id]);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Please enter a valid amount (> 0)');
      return;
    }
    setDonating((prev) => ({ ...prev, [id]: true }));
    try {
      const resp = await fetch(`/api/giveaways/${id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, currency: 'USDT' }),
      });
      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error || 'Donation failed');
      }
      // Update local prize pool and clear input
      const payload = Array.isArray(data.data) ? data.data[0] : data.data;
      const newPoolTotal = Number(payload?.donation_pool_total ?? NaN);
      if (Number.isFinite(newPoolTotal)) {
        setGiveaways((prev) => prev.map((g) =>
          g.id === id ? { ...g, prize_pool_usdt: newPoolTotal } : g
        ));
      }
      setDonationInputs((prev) => ({ ...prev, [id]: '' }));
      toast.success('Donation applied — thank you!');
    } catch (e: any) {
      toast.error(e?.message || 'Donation failed');
    } finally {
      setDonating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const copyShareLink = async (id: string) => {
    try {
      setCopying((prev) => ({ ...prev, [id]: true }));
      const url = `${window.location.origin}/giveaways/${id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied');
      setTimeout(() => setCopying((prev) => ({ ...prev, [id]: false })), 1000);
    } catch {
      toast.error('Failed to copy link');
      setCopying((prev) => ({ ...prev, [id]: false }));
    }
  };

  const openShare = (platform: 'x' | 'telegram' | 'facebook' | 'whatsapp', id: string) => {
    const baseUrl = `${window.location.origin}/giveaways/${id}`;
    const text = encodeURIComponent('Join this giveaway on ONAGUI!');
    const url = encodeURIComponent(baseUrl);
    let shareUrl = '';
    switch (platform) {
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  function Countdown({ endsAt }: { endsAt?: string }) {
    const [remaining, setRemaining] = useState<string>('');
    useEffect(() => {
      if (!endsAt) {
        setRemaining('');
        return;
      }
      const target = new Date(endsAt).getTime();
      const tick = () => {
        const now = Date.now();
        const diff = Math.max(0, target - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };
      tick();
      const timer = setInterval(tick, 1000);
      return () => clearInterval(timer);
    }, [endsAt]);
    return <span>{remaining}</span>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading giveaways: {error}
        </div>
      </div>
    );
  }

  if (giveaways.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white border-opacity-20">
          <h2 className="text-xl font-semibold text-white mb-4">No Active Giveaways</h2>
          <p className="text-white opacity-80">Check back soon for new giveaways!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {giveaways.map((giveaway) => (
          <div
            key={giveaway.id}
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105"
          >
            {/* Publisher info */}
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={giveaway.creator?.avatar_url || '/default-avatar.svg'}
                alt={giveaway.creator?.username || 'Publisher'}
                className="w-10 h-10 rounded-full border border-white/30"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
              />
              <div>
                <div className="text-white font-semibold">
                  {giveaway.creator?.username || 'Unknown'}
                </div>
                <div className="text-xs text-white/70">
                  {formatRank(giveaway.creator?.onagui_type)}
                </div>
              </div>
            </div>
            {giveaway.media_url && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={giveaway.media_url}
                  alt={giveaway.title || 'Giveaway'}
                  className="w-full h-48 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">
                {giveaway.title || 'Untitled Giveaway'}
              </h3>
              
              <p className="text-white opacity-90">
                {giveaway.description || 'No description available'}
              </p>
              
              <div className="flex justify-between items-center text-sm text-white opacity-80">
                <span>
                  Prize: $
                  {(
                    Number(giveaway.prize_amount ?? 0) +
                    Number(giveaway.prize_pool_usdt ?? 0)
                  ).toFixed(2)}
                </span>
                {giveaway.ticket_price && (
                  <span>Ticket: ${giveaway.ticket_price}</span>
                )}
              </div>

              {/* Countdown */}
              {giveaway.ends_at && (
                <div className="text-sm text-white/70">
                  <span className="font-medium">Ends in:</span>
                  <span className="ml-1"><Countdown endsAt={giveaway.ends_at} /></span>
                </div>
              )}
              
              {giveaway.ends_at && (
                <div className="text-sm text-white opacity-70">
                  Ends: {new Date(giveaway.ends_at).toLocaleDateString()}
                </div>
              )}
              
              {/* Inline donation */}
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Donate (USDT)"
                  value={donationInputs[giveaway.id] || ''}
                  onChange={(e) => handleDonationChange(giveaway.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/20 text-white placeholder-white/60 border border-white/30"
                />
                <button
                  onClick={() => submitDonation(giveaway.id)}
                  disabled={!!donating[giveaway.id]}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md"
                >
                  {donating[giveaway.id] ? 'Donating…' : 'Donate'}
                </button>
              </div>

              <Link
                href={`/giveaways/${giveaway.id}?claim=free`}
                className="w-full inline-block text-center bg-transparent text-green-300 font-bold py-2 px-4 rounded-md relative transition-all duration-300 active:scale-95"
              >
                <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">Claim Free Ticket</span>
                <span aria-hidden="true" className="absolute inset-0 rounded-md ring-1 ring-green-400/50" />
              </Link>

              {/* Share row: social icons + copy link */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openShare('x', giveaway.id)}
                  className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Share on X"
                >
                  <FaXTwitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openShare('telegram', giveaway.id)}
                  className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Share on Telegram"
                >
                  <FaTelegramPlane className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openShare('facebook', giveaway.id)}
                  className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Share on Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openShare('whatsapp', giveaway.id)}
                  className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => copyShareLink(giveaway.id)}
                  className="ml-auto p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-2"
                  aria-label="Copy direct link"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">{copying[giveaway.id] ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}