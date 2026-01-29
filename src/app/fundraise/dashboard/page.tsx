'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { IconWallet, IconCheck, IconClock, IconAlertCircle, IconFileDescription } from '@tabler/icons-react';
import KYCForm from '@/components/KYCForm';

interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised_amount: number;
  escrow_balance: number;
  platform_fees: number;
  net_amount: number;
  total_donations: number;
  status: string;
  kyc_status: string;
  payout_status: string;
  kyc_submitted_at: string | null;
  kyc_approved_at: string | null;
  payout_requested_at: string | null;
  payout_completed_at: string | null;
  payout_transaction_hash: string | null;
  created_at: string;
}

interface KYCSubmission {
  id: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface PayoutRequest {
  id: string;
  gross_amount: number;
  platform_fees: number;
  net_amount: number;
  status: string;
  transaction_hash: string | null;
  created_at: string;
  processed_at: string | null;
}

export default function FundraiserDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [selectedFundraiser, setSelectedFundraiser] = useState<Fundraiser | null>(null);
  const [kycSubmission, setKycSubmission] = useState<KYCSubmission | null>(null);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [showPayoutRequest, setShowPayoutRequest] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [blockchain, setBlockchain] = useState('polygon');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    await fetchFundraisers(session.user.id);
    setLoading(false);
  }

  async function fetchFundraisers(userId: string) {
    const { data, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fundraisers:', error);
      return;
    }

    setFundraisers(data || []);
  }

  async function fetchKYCStatus(fundraiserId: string) {
    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('fundraiser_id', fundraiserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching KYC:', error);
      return;
    }

    setKycSubmission(data);
  }

  async function fetchPayoutRequests(fundraiserId: string) {
    const { data, error } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('fundraiser_id', fundraiserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payout requests:', error);
      return;
    }

    setPayoutRequests(data || []);
  }

  async function selectFundraiser(fundraiser: Fundraiser) {
    setSelectedFundraiser(fundraiser);
    await fetchKYCStatus(fundraiser.id);
    await fetchPayoutRequests(fundraiser.id);
  }

  async function submitPayoutRequest() {
    if (!selectedFundraiser || !walletAddress) {
      alert('Please enter a wallet address');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    setLoading(true);

    const { error } = await supabase
      .from('payout_requests')
      .insert({
        fundraiser_id: selectedFundraiser.id,
        user_id: session.user.id,
        gross_amount: selectedFundraiser.raised_amount,
        platform_fees: selectedFundraiser.platform_fees,
        net_amount: selectedFundraiser.escrow_balance,
        wallet_address: walletAddress,
        blockchain: blockchain,
        status: 'pending',
      });

    if (error) {
      console.error('Error creating payout request:', error);
      alert('Error creating payout request');
      setLoading(false);
      return;
    }

    // Update fundraiser status
    await supabase
      .from('fundraisers')
      .update({
        payout_status: 'processing',
        payout_requested_at: new Date().toISOString(),
      })
      .eq('id', selectedFundraiser.id);

    alert('Payout request submitted successfully!');
    setShowPayoutRequest(false);
    setWalletAddress('');
    setLoading(false);
    
    // Refresh data
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      await fetchFundraisers(currentSession.user.id);
      await fetchPayoutRequests(selectedFundraiser.id);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'submitted':
      case 'under_review':
        return 'text-blue-600 bg-blue-100';
      case 'approved':
      case 'ready':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Fundraisers</h1>
          <p className="text-gray-600">Manage your fundraisers, submit KYC, and request payouts</p>
        </div>

        {fundraisers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">You haven't created any fundraisers yet</p>
            <button
              onClick={() => router.push('/fundraise/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Create Your First Fundraiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {fundraisers.map((fundraiser) => (
              <div key={fundraiser.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{fundraiser.title}</h3>
                      <div className="flex gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(fundraiser.status)}`}>
                          {fundraiser.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(fundraiser.kyc_status)}`}>
                          KYC: {fundraiser.kyc_status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(fundraiser.payout_status)}`}>
                          Payout: {fundraiser.payout_status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => selectFundraiser(fundraiser)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Raised</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${fundraiser.raised_amount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Platform Fees</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${fundraiser.platform_fees?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Your Balance</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${fundraiser.escrow_balance?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Donations</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {fundraiser.total_donations || 0}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((fundraiser.raised_amount / fundraiser.goal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {((fundraiser.raised_amount / fundraiser.goal) * 100).toFixed(1)}% of ${fundraiser.goal.toFixed(0)} goal
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fundraiser Detail Modal */}
      {selectedFundraiser && !showKYCForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedFundraiser.title}</h2>
                  <p className="text-gray-600 mt-1">Fundraiser Dashboard</p>
                </div>
                <button
                  onClick={() => setSelectedFundraiser(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              {/* Financial Summary */}
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Raised</div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${selectedFundraiser.raised_amount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Platform Fees (2.9% + $0.30)</div>
                    <div className="text-3xl font-bold text-blue-600">
                      -${selectedFundraiser.platform_fees?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Your Net Balance</div>
                    <div className="text-3xl font-bold text-green-600">
                      ${selectedFundraiser.escrow_balance?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC Status Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">KYC Verification</h3>
                
                {selectedFundraiser.kyc_status === 'pending' && !kycSubmission && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <IconAlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-1">KYC Required</h4>
                        <p className="text-sm text-yellow-800 mb-3">
                          To withdraw funds, you must complete identity verification. This helps protect both you and donors.
                        </p>
                        <button
                          onClick={() => setShowKYCForm(true)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700"
                        >
                          Submit KYC Verification
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {kycSubmission && (
                  <div className={`border rounded-lg p-4 ${
                    kycSubmission.status === 'approved' ? 'bg-green-50 border-green-200' :
                    kycSubmission.status === 'rejected' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {kycSubmission.status === 'approved' ? (
                        <IconCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : kycSubmission.status === 'rejected' ? (
                        <IconX className="h-6 w-6 text-red-600 flex-shrink-0" />
                      ) : (
                        <IconClock className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${
                          kycSubmission.status === 'approved' ? 'text-green-900' :
                          kycSubmission.status === 'rejected' ? 'text-red-900' :
                          'text-blue-900'
                        }`}>
                          KYC Status: {kycSubmission.status}
                        </h4>
                        <p className="text-sm text-gray-700">
                          Submitted on {new Date(kycSubmission.created_at).toLocaleDateString()}
                        </p>
                        {kycSubmission.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                            <strong>Rejection reason:</strong> {kycSubmission.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payout Request Section */}
              {selectedFundraiser.kyc_status === 'approved' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Payout Requests</h3>
                  
                  {payoutRequests.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <IconWallet className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 mb-1">Ready to Withdraw</h4>
                          <p className="text-sm text-green-800 mb-3">
                            Your KYC is approved. You can now request a payout of ${selectedFundraiser.escrow_balance?.toFixed(2)}.
                          </p>
                          <button
                            onClick={() => setShowPayoutRequest(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                          >
                            Request Payout
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payoutRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Payout Amount</div>
                              <div className="text-xl font-bold text-green-600">
                                ${request.net_amount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </div>
                          {request.transaction_hash && (
                            <div className="mt-2 p-2 bg-green-50 rounded">
                              <div className="text-sm font-medium text-green-900 mb-1">Transaction Hash:</div>
                              <div className="text-xs font-mono break-all text-green-700">
                                {request.transaction_hash}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {selectedFundraiser.payout_status !== 'completed' && (
                        <button
                          onClick={() => setShowPayoutRequest(true)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                        >
                          Request Another Payout
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payout Request Form */}
              {showPayoutRequest && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Request Payout</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm"
                        placeholder="0x..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blockchain Network
                      </label>
                      <select
                        value={blockchain}
                        onChange={(e) => setBlockchain(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      >
                        <option value="polygon">Polygon</option>
                        <option value="ethereum">Ethereum</option>
                        <option value="base">Base</option>
                        <option value="bnb">BNB Chain</option>
                        <option value="arbitrum">Arbitrum</option>
                        <option value="optimism">Optimism</option>
                      </select>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>Payout Amount:</strong> ${selectedFundraiser.escrow_balance?.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={submitPayoutRequest}
                        disabled={loading || !walletAddress}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        Submit Request
                      </button>
                      <button
                        onClick={() => setShowPayoutRequest(false)}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC Form Modal */}
      {showKYCForm && selectedFundraiser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <KYCForm
              fundraiserId={selectedFundraiser.id}
              fundraiserTitle={selectedFundraiser.title}
              escrowBalance={selectedFundraiser.escrow_balance}
              onComplete={() => {
                setShowKYCForm(false);
                fetchKYCStatus(selectedFundraiser.id);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
