'use client';

import { useState } from 'react';
import { buyTickets } from '../services/giveawayService';
import { useSupabaseClient } from '@/lib/supabaseClient';

interface BuyTicketsModalProps {
  giveawayId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyTicketsModal({ giveawayId, isOpen, onClose, onSuccess }: BuyTicketsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  if (!isOpen) return null;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to purchase tickets');
      }
      
      // Call the service to buy tickets
      await buyTickets({
        giveaway_id: giveawayId,
        quantity
      });
      
      onSuccess();
      onClose();
      
    } catch (err: any) {
      console.error('Error purchasing tickets:', err);
      setError(err.message || 'Failed to purchase tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 bg-opacity-90 rounded-xl overflow-hidden shadow-lg border border-purple-500/30 p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-white">Buy Additional Tickets</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-purple-300 mb-2">
              Number of Tickets
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max="100"
              className="w-full bg-purple-800 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
            />
            <p className="text-sm text-purple-300 mt-2">
              Cost: {quantity} USDT (1 USDT per ticket)
            </p>
          </div>
          
          <div className="bg-purple-800 bg-opacity-40 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2">Information</h4>
            <ul className="text-sm text-purple-300 space-y-2">
              <li>• Each ticket costs 1 USDT</li>
              <li>• Your tickets are private - only you can see how many you've purchased</li>
              <li>• The more tickets you have, the higher your chances of winning</li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-gradient-to-r from-pink-600 to-green-600 hover:from-pink-700 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Buy Tickets'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
