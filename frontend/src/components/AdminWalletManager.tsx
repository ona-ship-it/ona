// /frontend/src/components/AdminWalletManager.tsx 

import React, { useState, useEffect } from 'react'; 
import { supabase } from '@/lib/supabaseClient'; 
import { useAuth } from '@/lib/auth'; 
import { User } from '@supabase/supabase-js'; 

// Define a minimal type for the users we fetch 
interface AppUser { 
  id: string; 
  email: string; 
} 

/** 
 * @component AdminWalletManager 
 * @description Provides an interface for admin users to add fiat funds to any user's wallet 
 * by directly calling the secure PostgreSQL RPC function. 
 */ 
export function AdminWalletManager() { 
  const { isAdmin } = useAuth(); // Assume useAuth provides isAdmin status 
  const [users, setUsers] = useState<AppUser[]>([]); 
  const [selectedUserId, setSelectedUserId] = useState(''); 
  const [amount, setAmount] = useState<number | string>(''); 
  const [loading, setLoading] = useState(false); 

  useEffect(() => { 
    // Only fetch user list if the current user is an admin 
    if (isAdmin) { 
      fetchUsers(); 
    } 
  }, [isAdmin]); 

  // --- Data Fetching --- 

  const fetchUsers = async () => { 
    // Note: We need a table that lists all application users (e.g., 'app_users' or 'profiles'). 
    // Assuming 'app_users' exists based on docs/USER_ID_SYNC.md 
    const { data, error } = await supabase 
      .from('app_users') 
      .select('id, email') 
      .order('email', { ascending: true }) 
      .limit(100); // Limit fetch for admin panel 

    if (error) { 
      console.error('Error fetching users:', error); 
      return; 
    } 
    setUsers(data || []); 
  }; 

  // --- RPC Execution --- 

  const addFunds = async () => { 
    if (!selectedUserId || typeof amount !== 'number' || amount <= 0) { 
      alert('Please select a user and enter a valid amount greater than zero.'); 
      return; 
    } 
    
    setLoading(true); 

    try { 
      // 1. Call the secure RPC function directly. 
      // 2. We use 'add_funds_to_wallet_fiat' as deployed in Step 1. 
      const { data: success, error } = await supabase.rpc('add_funds_to_wallet_fiat', { 
        user_uuid: selectedUserId, 
        amount_to_add: amount, 
      }); 

      if (error) throw error; 

      // The RPC returns TRUE on successful update. 
      if (success) { 
        alert(`Successfully added $${amount.toFixed(2)} USDT to user ${selectedUserId}'s wallet.`); 
      } else { 
        // This case should ideally not happen if ensure_user_wallet works, but for safety: 
        alert('Operation failed. User wallet might not exist or update failed.'); 
      } 
      
      setAmount(''); 
      setSelectedUserId(''); 

    } catch (e: any) { 
      console.error('Error adding funds:', e); 
      alert(`Error: Could not add funds. Details: ${e.message || e.toString()}`); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  // --- Rendering --- 

  if (!isAdmin) { 
    return <p className="text-red-500">Access Denied: Admin privileges required for wallet management.</p>; 
  } 
  
  return ( 
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-purple-700/50"> 
      <h3 className="text-xl font-bold text-white mb-6">💰 Admin Wallet Manager (Fiat)</h3> 
      
      <div className="space-y-4"> 
        {/* User Selection */} 
        <label className="block text-sm font-medium text-gray-300">Select User</label> 
        <select 
          value={selectedUserId} 
          onChange={(e) => setSelectedUserId(e.target.value)} 
          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500" 
        > 
          <option value="" disabled>-- Select a User --</option> 
          {users.map(user => ( 
            <option key={user.id} value={user.id}> 
              {user.email} (ID: {user.id.substring(0, 8)}...) 
            </option> 
          ))} 
        </select> 
        
        {/* Amount Input */} 
        <label className="block text-sm font-medium text-gray-300">Amount to Add (USDT)</label> 
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(parseFloat(e.target.value))} 
          placeholder="0.00" 
          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500" 
          min="0.01" 
          step="0.01" 
        /> 
        
        {/* Submit Button */} 
        <button 
          onClick={addFunds} 
          disabled={loading || !selectedUserId || typeof amount !== 'number' || amount <= 0} 
          className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
        > 
          {loading ? 'Adding Funds...' : `Add $${typeof amount === 'number' && amount > 0 ? amount.toFixed(2) : '0.00'} USDT`} 
        </button> 
      </div> 
    </div> 
  ); 
}