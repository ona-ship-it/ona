'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [adminPassphrase, setAdminPassphrase] = useState('');
  const [secondApprover, setSecondApprover] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        router.push('/');
      }
    }
    
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
      
      setLoading(false);
    }
    
    checkAdmin();
    fetchTransactions();
  }, [supabase, router]);
  
  const handleApprove = async (tx: any) => {
    setSelectedTx(tx);
  };
  
  const confirmApproval = async () => {
    if (!selectedTx || !adminPassphrase) {
      setError('Admin passphrase is required');
      return;
    }
    
    // For large withdrawals, require second approver
    const isLargeWithdrawal = 
      selectedTx.type === 'withdrawal' && 
      selectedTx.amount > 1000; // Threshold for "large" withdrawal
    
    if (isLargeWithdrawal && !secondApprover) {
      setError('Second approver is required for large withdrawals');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call API to process the transaction
      const response = await fetch('/api/admin/process-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: selectedTx.id,
          adminPassphrase,
          secondApprover: isLargeWithdrawal ? secondApprover : undefined
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process transaction');
      }
      
      // Update local state
      setTransactions(transactions.filter(tx => tx.id !== selectedTx.id));
      setSelectedTx(null);
      setAdminPassphrase('');
      setSecondApprover('');
      setSuccess('Transaction processed successfully');
      
      // Create audit log
      await supabase.from('audit_logs').insert({
        action: 'transaction_approved',
        user_id: (await supabase.auth.getUser()).data.user?.id,
        details: {
          transaction_id: selectedTx.id,
          type: selectedTx.type,
          amount: selectedTx.amount,
          currency: selectedTx.currency
        }
      });
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async (tx: any) => {
    if (!confirm('Are you sure you want to reject this transaction?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'rejected' })
        .eq('id', tx.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setTransactions(transactions.filter(t => t.id !== tx.id));
      setSuccess('Transaction rejected');
      
      // Create audit log
      await supabase.from('audit_logs').insert({
        action: 'transaction_rejected',
        user_id: (await supabase.auth.getUser()).data.user?.id,
        details: {
          transaction_id: tx.id,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency
        }
      });
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Transaction Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No pending transactions</p>
      ) : (
        <div>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Currency</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Created</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2 px-4 border-b">{tx.id.substring(0, 8)}...</td>
                  <td className="py-2 px-4 border-b">{tx.user_id.substring(0, 8)}...</td>
                  <td className="py-2 px-4 border-b">{tx.type}</td>
                  <td className="py-2 px-4 border-b">{tx.amount}</td>
                  <td className="py-2 px-4 border-b">{tx.currency}</td>
                  <td className="py-2 px-4 border-b">{tx.status}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleApprove(tx)}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(tx)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {selectedTx && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Approve Transaction</h2>
                <p className="mb-4">
                  You are about to approve a {selectedTx.type} of {selectedTx.amount} {selectedTx.currency}.
                </p>
                
                <div className="mb-4">
                  <label className="block mb-2">Admin Passphrase:</label>
                  <input
                    type="password"
                    value={adminPassphrase}
                    onChange={(e) => setAdminPassphrase(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                {selectedTx.type === 'withdrawal' && selectedTx.amount > 1000 && (
                  <div className="mb-4">
                    <label className="block mb-2">Second Approver:</label>
                    <input
                      type="text"
                      value={secondApprover}
                      onChange={(e) => setSecondApprover(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Email of second approver"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Large withdrawals require two-person approval
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="bg-gray-300 px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproval}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}