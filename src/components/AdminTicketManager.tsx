"use client";

// /ona-production/src/components/AdminTicketManager.tsx

import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth';

// Define a minimal type for the users we fetch
interface AppUser {
  id: string;
  email: string;
}

/**
 * @component AdminTicketManager
 * @description Provides an interface for admin users to add integer tickets to any user's wallet
 * by directly calling the secure PostgreSQL RPC function.
 */
export function AdminTicketManager() {
  const { isAdmin } = useAuth();
  const supabase = useSupabaseClient();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // --- Data Fetching ---
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, email')
      .order('email', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    setUsers(data || []);
  };

  // --- RPC Execution ---
  const addTickets = async () => {
    const ticketAmount = parseInt(String(amount), 10);

    if (!selectedUserId || isNaN(ticketAmount) || ticketAmount <= 0) {
      alert('Please select a user and enter a valid integer amount greater than zero.');
      return;
    }

    setLoading(true);

    try {
      const { data: success, error } = await supabase.rpc('add_funds_to_wallet_tickets', {
        user_uuid: selectedUserId,
        amount_to_add: ticketAmount,
      });

      if (error) throw error;

      if (success) {
        alert(`Successfully added ${ticketAmount} tickets to user ${selectedUserId}'s wallet.`);
      } else {
        alert('Operation failed. User wallet might not exist or update failed.');
      }

      setAmount('');
      setSelectedUserId('');
    } catch (e: any) {
      console.error('Error adding tickets:', e);
      alert(`Error: Could not add tickets. Details: ${e.message || e.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Rendering ---
  if (!isAdmin) {
    return <p className="text-red-500">Access Denied: Admin privileges required for ticket management.</p>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-green-700/50">
      <h3 className="text-xl font-bold text-white mb-6">🎟️ Admin Ticket Manager (Integer)</h3>

      <div className="space-y-4">
        {/* User Selection */}
        <label className="block text-sm font-medium text-gray-300">Select User</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-green-500 focus:border-green-500"
        >
          <option value="" disabled>
            -- Select a User --
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email} (ID: {user.id.substring(0, 8)}...)
            </option>
          ))}
        </select>

        {/* Amount Input */}
        <label className="block text-sm font-medium text-gray-300">Amount to Add (Tickets)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-green-500 focus:border-green-500"
          min="1"
          step="1"
        />

        {/* Submit Button */}
        <button
          onClick={addTickets}
          disabled={loading || !selectedUserId || !amount || parseInt(String(amount), 10) <= 0}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding Tickets...' : `Add ${amount || 0} Tickets`}
        </button>
      </div>
    </div>
  );
}