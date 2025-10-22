'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { Wallet, Plus, Search, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  balance?: number;
}

export function AdminWalletManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = useSupabaseClient();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users with their wallet balances
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .limit(50);

      if (usersError) throw usersError;

      // Fetch wallet balances for these users
      const userIds = usersData?.map(u => u.id) || [];
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('user_id, balance')
        .in('user_id', userIds);

      // Combine user data with wallet balances
      const usersWithBalances = usersData?.map(user => ({
        ...user,
        balance: walletsData?.find(w => w.user_id === user.id)?.balance || 0
      })) || [];

      setUsers(usersWithBalances);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addFunds = async () => {
    if (!selectedUser || !amount) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.rpc('add_funds_to_wallet', {
        user_uuid: selectedUser,
        amount: parseFloat(amount)
      });

      if (error) throw error;

      setMessage({ type: 'success', text: `Successfully added ${amount} USDT to user's wallet!` });
      setAmount('');
      
      // Refresh user list to show updated balance
      await fetchUsers();
    } catch (error: any) {
      console.error('Error adding funds:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to add funds' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="bg-purple-900 bg-opacity-30 rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-6 h-6 text-purple-300" />
        <h3 className="text-xl font-semibold text-white">Wallet Management</h3>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="ml-auto text-purple-400 hover:text-purple-300 transition-colors"
          title="Refresh users"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-500 bg-opacity-20 border-green-500 text-green-300'
            : 'bg-red-500 bg-opacity-20 border-red-500 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* User Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by email..."
            className="w-full pl-10 pr-4 py-2 bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* User Selection */}
        <div>
          <label className="block text-purple-300 mb-2">Select User</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-3 bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Choose a user...</option>
            {filteredUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.email} (Balance: ${user.balance?.toFixed(2) || '0.00'} USDT)
              </option>
            ))}
          </select>
        </div>

        {/* Selected User Info */}
        {selectedUserData && (
          <div className="bg-purple-800 bg-opacity-30 rounded-lg p-3 border border-purple-500/20">
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Current Balance:</span>
              <span className="text-white font-semibold">
                ${selectedUserData.balance?.toFixed(2) || '0.00'} USDT
              </span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-purple-300 mb-2">Amount to Add (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            placeholder="Enter amount..."
            className="w-full p-3 bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Add Funds Button */}
        <button
          onClick={addFunds}
          disabled={!selectedUser || !amount || loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {loading ? 'Adding Funds...' : 'Add Funds'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-purple-500/30">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-sm text-purple-300">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              ${users.reduce((sum, user) => sum + (user.balance || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-purple-300">Total Balance</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminWalletManager;