// /frontend/src/components/WalletBalance.tsx

import React, { useState, useEffect } from 'react';
// Note: We assume '@/lib/supabaseClient' and '@/lib/auth' exist for typical Next.js/Supabase setup
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth'; // Assuming a context/hook provides the logged-in user

// Define the shape of the wallet data we expect
interface WalletData {
  balance_fiat: number;
  balance_tickets: number;
}

interface WalletBalanceProps {
  /**
   * Function to call when the balance is successfully fetched.
   * This allows parent components (like the Giveaway Form) to access the current balance.
   */
  onBalanceUpdate?: (balance: number) => void;
  /**
   * Style classes for the main display element.
   */
  className?: string;
}

/**
 * @component WalletBalance
 * @description Fetches and displays the user's fiat wallet balance from the onagui.wallets table.
 * Adheres to RLS policies to ensure security.
 */
export function WalletBalance({ onBalanceUpdate, className = '' }: WalletBalanceProps) {
  const { user } = useAuth(); // Retrieve the logged-in user object
  const [fiatBalance, setFiatBalance] = useState<number | null>(null);
  const [ticketBalance, setTicketBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setFiatBalance(0);
      setTicketBalance(0);
      setLoading(false);
      return;
    }
    
    fetchBalance(user.id);
  }, [user?.id]);

  const fetchBalance = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // NOW FETCHING BOTH FIAT AND TICKETS
      const { data, error } = await supabase
        .from('wallets')
        .select('balance_fiat, balance_tickets')
        .eq('user_id', userId)
        .single<Pick<WalletData, 'balance_fiat' | 'balance_tickets'>>();

      // PGRST116 means "no rows found" (i.e., user doesn't have a wallet row yet).
      if (error && (error as any).code !== 'PGRST116') {
        throw error;
      }

      const userFiatBalance = data?.balance_fiat ?? 0;
      const userTicketBalance = data?.balance_tickets ?? 0;

      setFiatBalance(userFiatBalance);
      setTicketBalance(userTicketBalance);

      // Notify parent with fiat balance if needed
      onBalanceUpdate?.(userFiatBalance);
    } catch (e: any) {
      console.error('Error fetching wallet balance:', e.message);
      setError('Error loading balance');
      setFiatBalance(0);
      setTicketBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING LOGIC ---

  if (loading) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        Wallet / Deposit: **Loading...**
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        Wallet: **Error**
      </div>
    );
  }
  
  // Format the fiat balance
  const formattedFiat = fiatBalance !== null ? fiatBalance.toFixed(2) : '0.00';
  // Use integer for tickets
  const formattedTickets = ticketBalance !== null ? Math.floor(ticketBalance) : 0;

  return (
    <div className={`text-sm font-semibold text-white ${className}`}>
      <span className="text-gray-400">Wallet:</span> **\${formattedFiat}** <span className="text-gray-400">/ Tickets:</span> **{formattedTickets}**
    </div>
  );
}

// For better type safety across the application
// Define a type for the full wallet structure
export type { WalletData };