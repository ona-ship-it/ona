'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { IconPlus, IconEdit, IconEye, IconTrash, IconTrendingUp, IconUsers } from '@tabler/icons-react';

interface Fundraiser {
  id: string;
  title: string;
  category: string;
  goal_amount: number;
  raised_amount: number;
  status: string;
  total_donors: number;
  total_donations: number;
  created_at: string;
  cover_image: string | null;
}

export default function MyFundraisersClient() {
  const router = useRouter();
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login?redirect=/fundraise/my-campaigns');
      return;
    }
    setUser(user);
    fetchMyFundraisers(user.id);
  }

  async function fetchMyFundraisers(userId: string) {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .schema('onagui').from('fundraisers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFundraisers(data || []);
    } catch (error) {
      console.error('Error fetching fundraisers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .schema('onagui').from('fundraisers')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setFundraisers(prev =>
        prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update campaign status');
    }
  }

  async function deleteFundraiser(id: string) {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .schema('onagui').from('fundraisers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFundraisers(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting fundraiser:', error);
      alert('Failed to delete campaign');
    }
  }

  function calculatePercentage(raised: number, goal: number) {
    if (goal === 0) return 0;
    return Math.min(Math.round((raised / goal) * 100), 100);
  }

  const totalRaised = fundraisers.reduce((sum, f) => sum + f.raised_amount, 0);
  const totalDonors = fundraisers.reduce((sum, f) => sum + f.total_donors, 0);
  const activeCampaigns = fundraisers.filter(f => f.status === 'active').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-white">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Campaigns</h1>
            <p className="text-gray-300">Manage your fundraising campaigns</p>
          </div>
          <Link
            href="/fundraise/create"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <IconPlus size={20} />
            Create Campaign
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <IconTrendingUp size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  ${totalRaised.toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm">Total Raised</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <IconUsers size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalDonors}</div>
                <div className="text-gray-300 text-sm">Total Donors</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <IconEye size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{activeCampaigns}</div>
                <div className="text-gray-300 text-sm">Active Campaigns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        {fundraisers.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconPlus size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-gray-300 mb-6">Start your first fundraising campaign today</p>
            <Link
              href="/fundraise/create"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors inline-block"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {fundraisers.map((fundraiser) => {
              const percentage = calculatePercentage(fundraiser.raised_amount, fundraiser.goal_amount);
              
              return (
                <div
                  key={fundraiser.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Cover Image */}
                      <div className="w-48 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex-shrink-0 overflow-hidden">
                        {fundraiser.cover_image ? (
                          <img
                            src={fundraiser.cover_image}
                            alt={fundraiser.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                            💚
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900">
                                {fundraiser.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  fundraiser.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : fundraiser.status === 'paused'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {fundraiser.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {fundraiser.category} • Created {new Date(fundraiser.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              href={`/fundraise/${fundraiser.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <IconEye size={20} />
                            </Link>
                            <button
                              onClick={() => toggleStatus(fundraiser.id, fundraiser.status)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title={fundraiser.status === 'active' ? 'Pause' : 'Activate'}
                            >
                              <IconEdit size={20} />
                            </button>
                            <button
                              onClick={() => deleteFundraiser(fundraiser.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <IconTrash size={20} />
                            </button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-900">
                              ${fundraiser.raised_amount.toLocaleString()} raised
                            </span>
                            <span className="text-gray-600">
                              {percentage}% of ${fundraiser.goal_amount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {fundraiser.total_donors}
                            </span>{' '}
                            donors
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">
                              {fundraiser.total_donations}
                            </span>{' '}
                            donations
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
