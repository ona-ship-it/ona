'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { Wallet, RefreshCw, AlertCircle, Ticket, DollarSign } from 'lucide-react';

interface WalletBalance {
  balance_fiat: number;
  balance_tickets: number;
}

interface WalletBalanceProps {
  userId: string;
  onBalanceUpdate?: (fiatBalance: number, ticketBalance: number) => void;
  className?: string;
  showTickets?: boolean;
}

export function WalletBalance({ userId, onBalanceUpdate, className = '', showTickets = true }: WalletBalanceProps) {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  const fetchBalance = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First, ensure user has a wallet using the new function
      const { error: ensureError } = await ((supabase as any).rpc('ensure_user_wallet', {
        user_uuid: userId
      }));

      if (ensureError) {
        console.warn('Could not ensure wallet exists:', ensureError);
      }

      // Fetch wallet balance
      const { data, error } = await ((supabase as any)
        .from('wallets')
        .select('balance_fiat, balance_tickets')
        .eq('user_id', userId)
        .single());

      if (error) {
        if (error.code === 'PGRST116') {
          // No wallet found, set default values
          const defaultBalance = { balance_fiat: 0, balance_tickets: 0 };
          setWalletBalance(defaultBalance);
          onBalanceUpdate?.(0, 0);
        } else {
          throw error;
        }
      } else {
        const balance = {
          balance_fiat: data?.balance_fiat || 0,
          balance_tickets: data?.balance_tickets || 0
        };
        setWalletBalance(balance);
        onBalanceUpdate?.(balance.balance_fiat, balance.balance_tickets);
      }
    } catch (err: any) {
      console.error('Error fetching wallet balance:', err);
      setError(err.message || 'Failed to load wallet balance');
      const defaultBalance = { balance_fiat: 0, balance_tickets: 0 };
      setWalletBalance(defaultBalance);
      onBalanceUpdate?.(0, 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  const handleRefresh = () => {
    fetchBalance();
  };

  if (loading) {
    return (
      <div className={`bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-500/30 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-300" />
            <span className="text-purple-300">Wallet Balance:</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-purple-400">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-500/30 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <span className="text-red-300">Wallet Error:</span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
        <p className="text-red-200 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-500/30 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-300" />
          <span className="text-purple-300">Wallet Balance:</span>
        </div>
        <button
          onClick={handleRefresh}
          className="text-purple-400 hover:text-purple-300 transition-colors"
          title="Refresh balance"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        {/* Fiat Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">USDT:</span>
          </div>
          <span className="text-white font-semibold">
            ${walletBalance?.balance_fiat?.toFixed(2) || '0.00'}
          </span>
        </div>
        
        {/* Ticket Balance */}
        {showTickets && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">Tickets:</span>
            </div>
            <span className="text-white font-semibold">
              {walletBalance?.balance_tickets || 0}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletBalance;