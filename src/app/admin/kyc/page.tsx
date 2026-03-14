'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';
import { useRouter } from 'next/navigation';
import { IconFileDescription, IconCheck, IconX, IconClock, IconEye } from '@tabler/icons-react';

interface KYCSubmission {
  id: string;
  fundraiser_id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string;
  country: string;
  passport_photo_url: string;
  id_document_url: string | null;
  proof_of_address_url: string | null;
  withdrawal_wallet_address: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  fundraiser: {
    title: string;
    raised_amount: number;
    escrow_balance: number;
    platform_fees: number;
  };
  user: {
    email: string;
  };
}

export default function KYCAdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchSubmissions();
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

  async function fetchSubmissions() {
    let query = supabase
      .from('kyc_submissions')
      .select(`
        *,
        fundraiser:fundraisers(title, raised_amount, escrow_balance, platform_fees),
        user:auth.users(email)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching KYC submissions:', error);
      return;
    }

    setSubmissions(data || []);
  }

  async function updateStatus(submissionId: string, newStatus: 'approved' | 'rejected' | 'under_review') {
    setProcessing(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const updateData: any = {
      status: newStatus,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    };

    if (newStatus === 'rejected') {
      updateData.rejection_reason = rejectionReason || 'Rejected by admin';
    }

    const { error } = await supabase
      .from('kyc_submissions')
      .update(updateData)
      .eq('id', submissionId);

    if (error) {
      console.error('Error updating KYC status:', error);
      alert('Error updating KYC status');
      setProcessing(false);
      return;
    }

    // If approved, call the approve_kyc function to unlock funds
    if (newStatus === 'approved') {
      const { error: approveError } = await supabase.rpc('approve_kyc', {
        submission_id: submissionId,
      });

      if (approveError) {
        console.error('Error approving KYC:', approveError);
        alert('Error approving KYC');
      }
    }

    alert(`KYC ${newStatus} successfully!`);
    setSelectedSubmission(null);
    setAdminNotes('');
    setRejectionReason('');
    setProcessing(false);
    fetchSubmissions();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'under_review':
        return 'text-blue-600 bg-blue-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Submissions</h1>
          <p className="text-gray-600">Review and approve fundraiser creator identity verifications</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-3 font-medium capitalize ${
                  filter === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.replace('_', ' ')}
                <span className="ml-2 text-sm">
                  ({submissions.filter((s) => tab === 'all' || s.status === tab).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <IconFileDescription className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No {filter !== 'all' ? filter : ''} KYC submissions found</p>
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
                      Escrow Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.fundraiser?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Raised: ${submission.fundraiser?.raised_amount?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.full_name}
                        </div>
                        <div className="text-sm text-gray-500">{submission.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${submission.fundraiser?.escrow_balance?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Fees: ${submission.fundraiser?.platform_fees?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          <IconEye className="h-4 w-4" />
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
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">KYC Review</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedSubmission.fundraiser?.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Full Name</label>
                    <p className="font-medium">{selectedSubmission.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone Number</label>
                    <p className="font-medium">{selectedSubmission.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date of Birth</label>
                    <p className="font-medium">{selectedSubmission.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedSubmission.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Address Line 1</label>
                    <p className="font-medium">{selectedSubmission.address_line1}</p>
                  </div>
                  {selectedSubmission.address_line2 && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-600">Address Line 2</label>
                      <p className="font-medium">{selectedSubmission.address_line2}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-600">City</label>
                    <p className="font-medium">{selectedSubmission.city}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State/Province</label>
                    <p className="font-medium">{selectedSubmission.state_province || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Postal Code</label>
                    <p className="font-medium">{selectedSubmission.postal_code}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Country</label>
                    <p className="font-medium">{selectedSubmission.country}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Documents</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Passport/ID Photo</label>
                    <a
                      href={selectedSubmission.passport_photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document →
                    </a>
                  </div>
                  {selectedSubmission.id_document_url && (
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Additional ID</label>
                      <a
                        href={selectedSubmission.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document →
                      </a>
                    </div>
                  )}
                  {selectedSubmission.proof_of_address_url && (
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Proof of Address</label>
                      <a
                        href={selectedSubmission.proof_of_address_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Withdrawal Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Withdrawal Information</h3>
                <div>
                  <label className="text-sm text-gray-600">Wallet Address</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                    {selectedSubmission.withdrawal_wallet_address}
                  </p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Total Raised</label>
                    <p className="text-xl font-bold">
                      ${selectedSubmission.fundraiser?.raised_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Platform Fees</label>
                    <p className="text-xl font-bold text-blue-600">
                      ${selectedSubmission.fundraiser?.platform_fees?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Net to Creator</label>
                    <p className="text-xl font-bold text-green-600">
                      ${selectedSubmission.fundraiser?.escrow_balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

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
                  placeholder="Add any internal notes about this submission..."
                />
              </div>

              {/* Rejection Reason (shown when rejecting) */}
              {selectedSubmission.status !== 'approved' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (Required for rejection)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    rows={2}
                    placeholder="Explain why this KYC is being rejected..."
                  />
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.status !== 'approved' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => updateStatus(selectedSubmission.id, 'under_review')}
                    disabled={processing}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IconClock className="h-5 w-5" />
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to approve this KYC? This will unlock the funds for payout.')) {
                        updateStatus(selectedSubmission.id, 'approved');
                      }
                    }}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IconCheck className="h-5 w-5" />
                    Approve KYC
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectionReason) {
                        alert('Please provide a rejection reason');
                        return;
                      }
                      if (confirm('Are you sure you want to reject this KYC?')) {
                        updateStatus(selectedSubmission.id, 'rejected');
                      }
                    }}
                    disabled={processing}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IconX className="h-5 w-5" />
                    Reject KYC
                  </button>
                </div>
              )}

              {selectedSubmission.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <IconCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">
                    This KYC has been approved. Funds are ready for payout.
                  </p>
                  {selectedSubmission.reviewed_at && (
                    <p className="text-sm text-green-600 mt-1">
                      Approved on {new Date(selectedSubmission.reviewed_at).toLocaleDateString()}
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
