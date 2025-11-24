// /frontend/src/components/AdminTicketManager.tsx 

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
 * @component AdminTicketManager 
 * @description Provides an interface for admin users to add integer tickets to any user's wallet 
 * by directly calling the secure PostgreSQL RPC function. 
 */ 
export function AdminTicketManager() { 
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

  // --- Data Fetching (Reusing logic from Fiat Manager) --- 

  const fetchUsers = async () => { 
    // Assuming 'app_users' exists and is readable by admins 
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
    const ticketAmount = parseInt(String(amount), 10); // Ensure integer conversion 
    
    if (!selectedUserId || isNaN(ticketAmount) || ticketAmount <= 0) { 
      alert('Please select a user and enter a valid integer amount greater than zero.'); 
      return; 
    } 
    
    setLoading(true); 

    try { 
      // 1. Call the secure RPC function for tickets. 
      // 2. We use 'add_funds_to_wallet_tickets' as deployed in Step 1. 
      const { data: success, error } = await supabase.rpc('add_funds_to_wallet_tickets', { 
        user_uuid: selectedUserId, 
        amount_to_add: ticketAmount, // Pass integer amount 
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
          <option value="" disabled>-- Select a User --</option> 
          {users.map(user => ( 
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
          step="1" // Ensure integer steps 
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