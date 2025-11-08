'use client';

import { useState } from 'react';
import { donateToPool } from '../services/giveawayService';
import { useSupabaseClient } from '@/lib/supabaseClient';

interface DonateModalProps {
  giveawayId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DonateModal({ giveawayId, isOpen, onClose, onSuccess }: DonateModalProps) {
  const [amount, setAmount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAmount(value > 0 ? value : 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to donate');
      }
      
      // Call the service to donate
      await donateToPool({
        giveaway_id: giveawayId,
        amount
      });
      
      onSuccess();
      onClose();
      
    } catch (err: any) {
      console.error('Error donating to prize pool:', err);
      setError(err.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 bg-opacity-90 rounded-xl overflow-hidden shadow-lg border border-purple-500/30 p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-white">Donate to Prize Pool</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="amount" className="block text-purple-300 mb-2">
              Donation Amount (USDT)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              min="1"
              className="w-full bg-purple-800 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
            />
          </div>
          
          <div className="bg-purple-800 bg-opacity-40 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2">Information</h4>
            <ul className="text-sm text-purple-300 space-y-2">
              <li>• 100% of your donation goes directly to the prize pool</li>
              <li>• Donations are non-refundable</li>
              <li>• Your donation increases the prize for all participants</li>
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
              {loading ? 'Processing...' : 'Donate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
