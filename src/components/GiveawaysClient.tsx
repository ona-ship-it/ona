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
              
              {/* Price */}
              <div className="bc-price-section">
                <div className="bc-price-display">
                  <span className="bc-currency">{giveaway.prize_currency === 'USD' ? '$' : giveaway.prize_currency}</span>
                  <span className="bc-price-value">
                    {(giveaway.prize_value || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bc-prize-progression">
                <span>Prize boost</span>
                <div className="bc-progression-values">
                  <span>
                    {giveaway.prize_currency === 'USD' ? '$' : giveaway.prize_currency}
                    {(giveaway.prize_value || 0).toLocaleString()}
                  </span>
                  <span className="bc-progression-arrow">→</span>
                  <span>
                    {giveaway.prize_currency === 'USD' ? '$' : giveaway.prize_currency}
                    {((giveaway.prize_value || 0) + (giveaway.prize_boost || 0)).toLocaleString()}
                  </span>
                </div>
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
      
      <style jsx>{`
        .bc-game-card {
          background: linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%);
          border: 1px solid rgba(0, 212, 212, 0.15);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          backdrop-filter: blur(10px);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: clamp(420px, 58vh, 500px);
        }
        
        .bc-game-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 212, 212, 0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .bc-game-card:hover::before {
          opacity: 1;
        }
        
        .bc-game-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0, 212, 212, 0.5);
          box-shadow: 0 20px 60px rgba(0, 212, 212, 0.2), 0 0 40px rgba(0, 212, 212, 0.1);
        }
        
        .bc-card-image-wrapper {
          position: relative;
          width: 100%;
          height: 50%;
          min-height: 180px;
          overflow: hidden;
        }
        
        .bc-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .bc-game-card:hover .bc-card-image {
          transform: scale(1.1);
        }
        
        .bc-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, rgba(15, 20, 25, 0.95) 0%, transparent 100%);
        }
        
        .bc-trending-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #ff4400 0%, #ff8800 100%);
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(255, 68, 0, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }
        
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .bc-verified-icon {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          background: rgba(15, 20, 25, 0.8);
          border: 2px solid #00d4d4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 20px rgba(0, 212, 212, 0.5);
          animation: verifiedPulse 2s ease-in-out infinite;
        }
        
        @keyframes verifiedPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 212, 0.5); }
          50% { box-shadow: 0 0 30px rgba(0, 212, 212, 0.8); }
        }
        
        .bc-condition-tag {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(255, 136, 0, 0.9);
          color: #0f1419;
          padding: 6px 14px;
          border-radius: 8px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          z-index: 2;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(255, 136, 0, 0.3);
        }
        
        .bc-card-body {
          padding: 11px;
          height: 50%;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .bc-rating-row {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 2px;
        }
        
        .bc-rating-display {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 136, 0, 0.1);
          border: 1px solid rgba(255, 136, 0, 0.3);
          padding: 4px 9px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #ff8800;
        }
        
        .rating-value {
          color: #ff8800;
        }
        
        .rating-count {
          color: #718096;
          font-size: 10px;
        }
        
        .bc-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1px;
          line-height: 1.1;
          letter-spacing: 0.2px;
        }
        
        .bc-card-subtitle {
          font-size: 11px;
          color: #718096;
          margin-bottom: 0;
          font-weight: 500;
        }
        
        .bc-host-info {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1px;
          font-size: 11px;
          color: #718096;
        }
        
        .bc-host-name {
          color: #00d4d4;
          font-weight: 600;
        }
        
        .bc-price-section {
          display: flex;
          justify-content: center;
          margin-bottom: 1px;
        }
        
        .bc-price-display {
          display: flex;
          align-items: baseline;
          font-family: 'Rajdhani', sans-serif;
          gap: 2px;
        }
        
        .bc-currency {
          font-size: 18px;
          color: #10b981;
          font-weight: 700;
        }
        
        .bc-price-value {
          font-size: 28px;
          font-weight: 800;
          color: #10b981;
        }

        .bc-prize-progression {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 10px;
          color: #94a3b8;
        }

        .bc-progression-values {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: #3b82f6;
          font-size: 11px;
        }

        .bc-progression-arrow {
          color: #718096;
        }

        .bc-commission-row {
          display: grid;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #94a3b8;
        }

        .bc-commission-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .bc-commission-item strong {
          color: #00d4d4;
          font-weight: 700;
        }
        
        .bc-action-button {
          position: relative;
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-radius: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          overflow: hidden;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        
        .bc-btn-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s ease;
        }
        
        .bc-action-button:hover .bc-btn-glow {
          left: 100%;
        }
        
        .bc-action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
        }

        .bc-action-stack {
          display: grid;
          gap: 0.35rem;
          margin-top: auto;
        }

        .bc-action-secondary {
          width: 100%;
          margin-top: 0;
          padding: 7px 10px;
          border-radius: 10px;
          border: 1px solid rgba(37, 99, 235, 0.45);
          background: rgba(37, 99, 235, 0.16);
          color: #7dd3fc;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .bc-action-secondary:hover {
          background: rgba(37, 99, 235, 0.28);
          color: #e0f2fe;
        }

        .bc-action-note {
          margin-top: 0;
          text-align: center;
          font-size: 10px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}