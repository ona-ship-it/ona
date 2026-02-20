'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Star, ShoppingCart } from 'lucide-react';
import LikeSaveButtons from '@/components/LikeSaveButtons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Giveaway {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  prize_value: number;
  prize_currency: string;
  tickets_sold: number;
  total_tickets: number;
  status: string;
  creator_name?: string | null;
  creator_avatar_url?: string | null;
  paid_ticket_count?: number;
  paid_ticket_revenue?: number;
  prize_boost?: number;
  onagui_subs?: number;
}

const CARD_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop';
const PROFILE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop';

export default function GiveawaysClient() {
  const router = useRouter();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getRatingData = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }

    const rating = 4.3 + (hash % 70) / 100;
    const count = 50 + (hash % 200);

    return {
      rating: rating.toFixed(1),
      count,
    };
  };

  const getGiveawayHighlight = (giveaway: Giveaway) => {
    if (giveaway.total_tickets > 0 && giveaway.tickets_sold / giveaway.total_tickets >= 0.7) {
      return 'Most Entered';
    }
    return 'Hot Right Now';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2" 
          style={{ borderColor: 'var(--accent-green)' }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div 
          className="px-4 py-3 rounded-lg border"
          style={{
            background: 'rgba(246, 70, 93, 0.1)',
            borderColor: 'var(--accent-red)',
            color: 'var(--accent-red)'
          }}
        >
          Error loading giveaways: {error}
        </div>
      </div>
    );
  }

  if (giveaways.length === 0) {
    return (
      <div className="text-center py-12">
        <div 
          className="rounded-xl p-8 border"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border)'
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            No Active Giveaways
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Check back soon for new giveaways!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {giveaways.map((giveaway) => (
          <Link
            key={giveaway.id}
            href={`/giveaways/${giveaway.id}`}
            className="bc-game-card group"
          >
            {/* Image Section */}
            <div className="bc-card-image-wrapper">
              {giveaway.image_url ? (
                <img
                  src={giveaway.image_url}
                  alt={giveaway.title || 'Giveaway'}
                  className="bc-card-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = CARD_FALLBACK_IMAGE;
                  }}
                />
              ) : (
                <img
                  src={CARD_FALLBACK_IMAGE}
                  alt="Default"
                  className="bc-card-image"
                />
              )}
              
              <div className="bc-image-overlay"></div>
              
              {/* Trending Badge */}
              {giveaway.tickets_sold > 5000 && (
                <div className="bc-trending-badge">
                  <TrendingUp size={14} />
                  <span>TRENDING</span>
                </div>
              )}
              
              {/* Verified Icon */}
              <div className="bc-verified-icon">
                <CheckCircle size={20} fill="#00d4d4" stroke="#0f1419" />
              </div>
              
              {/* Condition Tag */}
              <div className="bc-condition-tag">GIVEAWAY</div>
            </div>
            
            {/* Card Body */}
            <div className="bc-card-body">
              <div
                className="bc-actions-row"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <LikeSaveButtons
                  postId={giveaway.id}
                  postType="giveaway"
                  showCount={false}
                  size="sm"
                />
              </div>

              {/* Price */}
              <div className="bc-price-section">
                <div className="bc-price-display">
                  <span className="bc-currency">{giveaway.prize_currency === 'USD' ? '$' : giveaway.prize_currency}</span>
                  <span className="bc-price-value">
                    {(giveaway.prize_value || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="bc-title-row">
                <div className="bc-creator-column">
                  <img
                    src={giveaway.creator_avatar_url || PROFILE_FALLBACK_IMAGE}
                    alt={giveaway.creator_name || 'Creator'}
                    className="bc-creator-avatar"
                  />
                  <span className="bc-subs-badge">
                    {Math.round(giveaway.onagui_subs || 0)} subs
                  </span>
                </div>
                <div className="bc-title-stack">
                  <h3 className="bc-card-title">
                    {giveaway.title || 'Untitled Giveaway'}
                  </h3>
                  <p className="bc-card-subtitle">
                    {giveaway.description?.substring(0, 50) || 'Amazing prize giveaway'}...
                  </p>
                </div>
              </div>
              
              {/* Host Info */}
              <div className="bc-host-info">
                <span>by</span>
                <span className="bc-host-name">{giveaway.creator_name || 'ONAGUI'}</span>
              </div>

              <div className="bc-action-stack">
                <button className="bc-action-button">
                  <ShoppingCart size={16} />
                  <span>CLAIM FREE TICKET</span>
                  <div className="bc-btn-glow"></div>
                </button>

                <button
                  className="bc-action-secondary"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(`/giveaways/${giveaway.id}?entry=paid`);
                  }}
                >
                  BUY TICKET 1 USDC
                </button>

                <div className="bc-action-note">1 chance per user</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      

    </div>
  );
}