'use client';

import { useState, useEffect } from 'react';

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
}

export default function GiveawaysClient() {
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
          <div
            key={giveaway.id}
            className="rounded-xl p-6 border hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border)'
            }}
          >
            {giveaway.media_url && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={giveaway.media_url}
                  alt={giveaway.title || 'Giveaway'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {giveaway.title || 'Untitled Giveaway'}
              </h3>
              
              <p style={{ color: 'var(--text-secondary)' }}>
                {giveaway.description || 'No description available'}
              </p>
              
              <div className="flex justify-between items-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <span>Prize: ${giveaway.prize_amount || 0}</span>
                {giveaway.ticket_price && (
                  <span>Ticket: ${giveaway.ticket_price}</span>
                )}
              </div>
              
              {giveaway.ends_at && (
                <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Ends: {new Date(giveaway.ends_at).toLocaleDateString()}
                </div>
              )}
              
              <button 
                className="w-full font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:brightness-110"
                style={{ background: '#00d4d4', color: '#0A0E13' }}
              >
                Enter Giveaway
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}