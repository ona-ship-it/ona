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
              <h3 className="text-xl font-bold text-white">
                {giveaway.title || 'Untitled Giveaway'}
              </h3>
              
              <p className="text-white opacity-90">
                {giveaway.description || 'No description available'}
              </p>
              
              <div className="flex justify-between items-center text-sm text-white opacity-80">
                <span>Prize: ${giveaway.prize_amount || 0}</span>
                {giveaway.ticket_price && (
                  <span>Ticket: ${giveaway.ticket_price}</span>
                )}
              </div>
              
              {giveaway.ends_at && (
                <div className="text-sm text-white opacity-70">
                  Ends: {new Date(giveaway.ends_at).toLocaleDateString()}
                </div>
              )}
              
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                Enter Giveaway
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}