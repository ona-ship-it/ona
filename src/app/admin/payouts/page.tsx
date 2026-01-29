'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';
import { useRouter } from 'next/navigation';
import { IconWallet, IconCheck, IconX, IconClock, IconExternalLink } from '@tabler/icons-react';
import { ethers } from 'ethers';
import { getCryptoById } from '@/lib/cryptoConfig';

interface PayoutRequest {
  id: string;
  fundraiser_id: string;
  user_id: string;
  gross_amount: number;
  platform_fees: number;
  net_amount: number;
  wallet_address: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transaction_hash: string | null;
  blockchain: string;
  processed_by: string | null;
  processed_at: string | null;
  failure_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  fundraiser: {
    title: string;
    wallet_address: string;
    kyc_status: string;
  };
  user: {
    email: string;
  };
}

export default function PayoutRequestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'processing' | 'completed' | 'failed'>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [txHash, setTxHash] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchRequests();
    }
  }, [filter, loading]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const email = session.user.email;
    if (!isAdmin(email)) {
      router.push('/');
      return;
    }

    setLoading(false);
  }

  async function fetchRequests() {
    let query = supabase
      .from('payout_requests')
      .select(`
        *,
        fundraiser:fundraisers(title, wallet_address, kyc_status),
        user:auth.users(email)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payout requests:', error);
      return;
    }

    setRequests(data || []);
  }

  async function updateStatus(
    requestId: string,
    newStatus: 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled',
    transactionHash?: string,
    failureReason?: string
  ) {
    setProcessing(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const updateData: any = {
      status: newStatus,
      processed_by: session.user.id,
      processed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    };

    if (transactionHash) {
      updateData.transaction_hash = transactionHash;
    }

    if (failureReason) {
      updateData.failure_reason = failureReason;
    }

    const { error } = await supabase
      .from('payout_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      console.error('Error updating payout status:', error);
      alert('Error updating payout status');
      setProcessing(false);
      return;
    }

    // Update fundraiser payout status if completed
    if (newStatus === 'completed' && selectedRequest) {
      await supabase
        .from('fundraisers')
        .update({
          payout_status: 'completed',
          payout_completed_at: new Date().toISOString(),
          payout_transaction_hash: transactionHash,
        })
        .eq('id', selectedRequest.fundraiser_id);
    }

    alert(`Payout ${newStatus} successfully!`);
    setSelectedRequest(null);
    setAdminNotes('');
    setTxHash('');
    setProcessing(false);
    fetchRequests();
  }

  async function processPayout() {
    if (!selectedRequest) return;

    if (!window.ethereum) {
      alert('Please install MetaMask to process payouts');
      return;
    }

    setProcessing(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      // Get the crypto config for this blockchain
      const crypto = getCryptoById(selectedRequest.blockchain);
      if (!crypto) {
        throw new Error('Unsupported blockchain');
      }

      // Switch to the correct network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: crypto.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          alert('Please add this network to MetaMask first');
          setProcessing(false);
          return;
        }
        throw switchError;
      }

      // Send the transaction
      const tx = await signer.sendTransaction({
        to: selectedRequest.wallet_address,
        value: ethers.utils.parseEther(selectedRequest.net_amount.toString()),
      });

      // Mark as processing
      await updateStatus(selectedRequest.id, 'processing', null);

      // Wait for confirmation
      await tx.wait();

      // Mark as completed with transaction hash
      await updateStatus(selectedRequest.id, 'completed', tx.hash);

      alert(`Payout completed! Transaction: ${tx.hash}`);
    } catch (error) {
      console.error('Error processing payout:', error);
      alert(`Error processing payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProcessing(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-purple-600 bg-purple-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  function getBlockchainExplorer(blockchain: string, txHash: string) {
    const explorers: { [key: string]: string } = {
      ethereum: `https://etherscan.io/tx/${txHash}`,
      polygon: `https://polygonscan.com/tx/${txHash}`,
      base: `https://basescan.org/tx/${txHash}`,
      bnb: `https://bscscan.com/tx/${txHash}`,
      arbitrum: `https://arbiscan.io/tx/${txHash}`,
      optimism: `https://optimistic.etherscan.io/tx/${txHash}`,
    };
    return explorers[blockchain] || '#';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Requests</h1>
          <p className="text-gray-600">Manage fundraiser creator payout requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {(['all', 'pending', 'approved', 'processing', 'completed', 'failed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${
                  filter === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
                <span className="ml-2 text-sm">
                  ({requests.filter((r) => tab === 'all' || r.status === tab).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <IconWallet className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No {filter !== 'all' ? filter : ''} payout requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fundraiser
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Creator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.fundraiser?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          KYC: {request.fundraiser?.kyc_status || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${request.net_amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Gross: ${request.gross_amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium capitalize">{request.blockchain}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payout Request</h2>
                  <p className="text-gray-600 mt-1">{selectedRequest.fundraiser?.title}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              {/* Financial Details */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Financial Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Amount:</span>
                    <span className="font-semibold">${selectedRequest.gross_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fees (2.9% + $0.30):</span>
                    <span className="font-semibold text-blue-600">
                      -${selectedRequest.platform_fees.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Net Payout:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${selectedRequest.net_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payout Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Payout Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Wallet Address</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                      {selectedRequest.wallet_address}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Blockchain</label>
                    <p className="font-medium capitalize">{selectedRequest.blockchain}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Creator Email</label>
                    <p className="font-medium">{selectedRequest.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">KYC Status</label>
                    <p className="font-medium capitalize">{selectedRequest.fundraiser?.kyc_status}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Hash (if exists) */}
              {selectedRequest.transaction_hash && (
                <div className="mb-6 bg-green-50 p-4 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2">Transaction Hash</label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm flex-1 break-all">
                      {selectedRequest.transaction_hash}
                    </p>
                    <a
                      href={getBlockchainExplorer(selectedRequest.blockchain, selectedRequest.transaction_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <IconExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  rows={3}
                  placeholder="Add any internal notes..."
                />
              </div>

              {/* Manual Transaction Hash Input */}
              {selectedRequest.status !== 'completed' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Hash (for manual completion)
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm"
                    placeholder="0x..."
                  />
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (selectedRequest.fundraiser?.kyc_status !== 'approved') {
                        alert('KYC must be approved before approving payout');
                        return;
                      }
                      if (confirm('Approve this payout request?')) {
                        updateStatus(selectedRequest.id, 'approved');
                      }
                    }}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Cancel this payout request?')) {
                        updateStatus(selectedRequest.id, 'cancelled');
                      }
                    }}
                    disabled={processing}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {selectedRequest.status === 'approved' && (
                <div className="space-y-3">
                  <button
                    onClick={processPayout}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IconWallet className="h-5 w-5" />
                    {processing ? 'Processing...' : 'Process Payout with MetaMask'}
                  </button>
                  <button
                    onClick={() => {
                      if (!txHash) {
                        alert('Please enter a transaction hash');
                        return;
                      }
                      if (confirm('Mark this payout as completed?')) {
                        updateStatus(selectedRequest.id, 'completed', txHash);
                      }
                    }}
                    disabled={processing}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark as Completed (Manual)
                  </button>
                </div>
              )}

              {selectedRequest.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <IconCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">Payout Completed</p>
                  {selectedRequest.processed_at && (
                    <p className="text-sm text-green-600 mt-1">
                      Processed on {new Date(selectedRequest.processed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
