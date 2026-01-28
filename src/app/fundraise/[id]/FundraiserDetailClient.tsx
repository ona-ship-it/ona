'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DonationModal from '@/components/DonationModal';
import { IconHeart, IconShare, IconClock, IconMapPin, IconUser } from '@tabler/icons-react';
import Link from 'next/link';

interface Fundraiser {
  id: string;
  user_id: string;
  title: string;
  story: string;
  category: string;
  goal_amount: number;
  raised_amount: number;
  cover_image: string | null;
  location: string | null;
  total_donors: number;
  total_donations: number;
  wallet_address: string;
  beneficiary_name: string | null;
  created_at: string;
  status: string;
}

interface Donation {
  id: string;
  amount: number;
  donor_name: string | null;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
  transaction_hash: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function FundraiserDetailClient({ fundraiserId }: { fundraiserId: string }) {
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'donations'>('story');

  useEffect(() => {
    fetchFundraiser();
    fetchDonations();
    fetchUpdates();
  }, [fundraiserId]);

  async function fetchFundraiser() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('fundraisers')
        .select('*')
        .eq('id', fundraiserId)
        .single();

      if (error) throw error;
      setFundraiser(data);
    } catch (error) {
      console.error('Error fetching fundraiser:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDonations() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('fundraiser_id', fundraiserId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  }

  async function fetchUpdates() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('fundraiser_updates')
        .select('*')
        .eq('fundraiser_id', fundraiserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  }

  function calculatePercentage() {
    if (!fundraiser || fundraiser.goal_amount === 0) return 0;
    return Math.min(Math.round((fundraiser.raised_amount / fundraiser.goal_amount) * 100), 100);
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-white">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Campaign Not Found</h1>
          <Link href="/fundraise" className="text-green-400 hover:underline">
            Browse other campaigns
          </Link>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Campaign Details */}
              <div className="lg:col-span-2">
                {/* Cover Image */}
                <div className="relative h-96 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl overflow-hidden mb-6">
                  {fundraiser.cover_image ? (
                    <img
                      src={fundraiser.cover_image}
                      alt={fundraiser.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <IconHeart size={128} className="text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white text-green-700 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {fundraiser.category}
                    </span>
                  </div>
                </div>

                {/* Title & Meta */}
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{fundraiser.title}</h1>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    {fundraiser.location && (
                      <div className="flex items-center gap-1">
                        <IconMapPin size={18} />
                        {fundraiser.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <IconClock size={18} />
                      Created {formatTimeAgo(fundraiser.created_at)}
                    </div>
                    {fundraiser.beneficiary_name && (
                      <div className="flex items-center gap-1">
                        <IconUser size={18} />
                        For {fundraiser.beneficiary_name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <div className="flex gap-8">
                    <button
                      onClick={() => setActiveTab('story')}
                      className={`pb-4 font-semibold border-b-2 transition-colors ${
                        activeTab === 'story'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Story
                    </button>
                    <button
                      onClick={() => setActiveTab('updates')}
                      className={`pb-4 font-semibold border-b-2 transition-colors ${
                        activeTab === 'updates'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Updates ({updates.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('donations')}
                      className={`pb-4 font-semibold border-b-2 transition-colors ${
                        activeTab === 'donations'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Donations ({fundraiser.total_donors})
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'story' && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                        {fundraiser.story}
                      </p>
                    </div>
                  )}

                  {activeTab === 'updates' && (
                    <div className="space-y-6">
                      {updates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No updates yet
                        </div>
                      ) : (
                        updates.map((update) => (
                          <div key={update.id} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-bold text-gray-900">{update.title}</h3>
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(update.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'donations' && (
                    <div className="space-y-4">
                      {donations.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          Be the first to donate!
                        </div>
                      ) : (
                        donations.map((donation) => (
                          <div key={donation.id} className="bg-gray-50 rounded-lg p-4 flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <IconHeart size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-900">
                                  {donation.is_anonymous ? 'Anonymous' : (donation.donor_name || 'Anonymous')}
                                </span>
                                <span className="font-bold text-green-600">
                                  ${donation.amount.toLocaleString()} USDC
                                </span>
                              </div>
                              {donation.message && (
                                <p className="text-gray-600 text-sm mb-2">{donation.message}</p>
                              )}
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatTimeAgo(donation.created_at)}</span>
                                <a
                                  href={`https://polygonscan.com/tx/${donation.transaction_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline"
                                >
                                  View TX
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Donation Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                    {/* Progress */}
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ${fundraiser.raised_amount.toLocaleString()} USDC
                      </div>
                      <div className="text-gray-600 mb-3">
                        raised of ${fundraiser.goal_amount.toLocaleString()} goal
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{fundraiser.total_donors} donors</span>
                        <span>{fundraiser.total_donations} donations</span>
                      </div>
                    </div>

                    {/* Donate Button */}
                    <button
                      onClick={() => setShowDonationModal(true)}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors mb-4 shadow-md"
                    >
                      Donate Now with Crypto
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied!');
                      }}
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <IconShare size={20} />
                      Share Campaign
                    </button>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">💚 Crypto Donations</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>✓ Instant transfer to organizer</li>
                        <li>✓ Transparent on blockchain</li>
                        <li>✓ Lower fees than traditional</li>
                        <li>✓ USDC on Polygon network</li>
                      </ul>
                    </div>

                    {/* Wallet Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Funds go directly to:</p>
                      <p className="text-xs font-mono text-gray-900 break-all">
                        {fundraiser.wallet_address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <DonationModal
          fundraiser={fundraiser}
          onClose={() => setShowDonationModal(false)}
          onSuccess={() => {
            setShowDonationModal(false);
            fetchFundraiser();
            fetchDonations();
          }}
        />
      )}
    </>
  );
}
