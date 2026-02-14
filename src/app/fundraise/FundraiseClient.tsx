'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { IconHeart, IconSearch, IconPlus, IconTrendingUp } from '@tabler/icons-react';
import LikeSaveButtons from '@/components/LikeSaveButtons';
import Header from '@/components/Header';

interface Fundraiser {
  id: string;
  title: string;
  story: string;
  category: string;
  goal_amount: number;
  raised_amount: number;
  cover_image: string | null;
  location: string | null;
  total_donors: number;
  created_at: string;
  user_id: string;
}

const CATEGORIES = [
  'All',
  'Medical',
  'Emergency',
  'Education',
  'Memorial',
  'Animals & Pets',
  'Community',
  'Sports',
  'Creative',
  'Other'
];

export default function FundraiseClient() {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'goal'>('recent');
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
    totalDonors: 0,
  });

  useEffect(() => {
    fetchFundraisers();
    fetchStats();
  }, [selectedCategory, sortBy]);

  async function fetchStats() {
    try {
      const supabase = createClient();
      
      // Get total raised across all fundraisers
      const { data: fundraisersData } = await supabase
        .from('fundraisers')
        .select('raised_amount, total_donors');

      if (fundraisersData) {
        const totalRaised = fundraisersData.reduce((sum, f) => sum + (f.raised_amount || 0), 0);
        const totalDonors = fundraisersData.reduce((sum, f) => sum + (f.total_donors || 0), 0);
        
        setStats({
          totalRaised,
          totalCampaigns: fundraisersData.length,
          totalDonors,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchFundraisers() {
    try {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from('fundraisers')
        .select('*')
        .eq('status', 'active');

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'trending') {
        query = query.order('total_donors', { ascending: false });
      } else {
        query = query.order('goal_amount', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setFundraisers(data || []);
    } catch (error) {
      console.error('Error fetching fundraisers:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFundraisers = fundraisers.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.story.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function calculatePercentage(raised: number, goal: number) {
    if (goal === 0) return 0;
    return Math.min(Math.round((raised / goal) * 100), 100);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="border-b" style={{ 
        background: 'var(--secondary-bg)',
        borderColor: 'var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Fundraise with Crypto
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            The #1 platform for crypto crowdfunding. Start a campaign, raise money, change lives.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/fundraise/create"
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all inline-flex items-center gap-2"
              style={{ background: 'var(--accent-green)', color: 'var(--text-primary)' }}
            >
              <IconPlus size={24} />
              Start a Campaign
            </Link>
            <Link
              href="#browse"
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all"
              style={{ background: 'var(--accent-blue)', color: 'var(--text-primary)' }}
            >
              Browse Campaigns
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b" style={{ 
        background: 'var(--secondary-bg)',
        borderColor: 'var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--accent-green)' }}>
                ${stats.totalRaised.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Raised in Crypto</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--accent-green)' }}>
                {stats.totalCampaigns.toLocaleString()}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Campaigns Funded</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--accent-green)' }}>
                {stats.totalDonors.toLocaleString()}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Generous Donors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div id="browse" className="border-b sticky top-0 z-10 backdrop-blur-xl" style={{ 
        background: 'rgba(22, 26, 30, 0.95)',
        borderColor: 'var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <IconSearch 
                className="absolute left-4 top-1/2 transform -translate-y-1/2" 
                size={20}
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  background: 'var(--secondary-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-full font-medium transition-all"
                style={{
                  background: selectedCategory === category ? 'var(--accent-green)' : 'var(--secondary-bg)',
                  color: 'var(--text-primary)',
                  borderWidth: '1px',
                  borderColor: selectedCategory === category ? 'var(--accent-green)' : 'var(--border)'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex gap-3">
            <button
              onClick={() => setSortBy('recent')}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: sortBy === 'recent' ? 'rgba(43, 111, 237, 0.1)' : 'transparent',
                color: sortBy === 'recent' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderColor: sortBy === 'recent' ? 'var(--accent-blue)' : 'var(--border)'
              }}
            >
              Most Recent
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className="px-4 py-2 rounded-lg font-medium inline-flex items-center gap-1 transition-all"
              style={{
                background: sortBy === 'trending' ? 'rgba(43, 111, 237, 0.1)' : 'transparent',
                color: sortBy === 'trending' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderColor: sortBy === 'trending' ? 'var(--accent-blue)' : 'var(--border)'
              }}
            >
              <IconTrendingUp size={18} />
              Trending
            </button>
            <button
              onClick={() => setSortBy('goal')}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: sortBy === 'goal' ? 'rgba(43, 111, 237, 0.1)' : 'transparent',
                color: sortBy === 'goal' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderColor: sortBy === 'goal' ? 'var(--accent-blue)' : 'var(--border)'
              }}
            >
              Biggest Goals
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div 
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" 
              style={{ borderColor: 'var(--accent-green)' }}
            ></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading campaigns...</p>
          </div>
        ) : filteredFundraisers.length === 0 ? (
          <div className="text-center py-20">
            <IconHeart size={64} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>No campaigns found</p>
            <Link
              href="/fundraise/create"
              className="px-6 py-3 rounded-lg font-bold inline-block transition-all"
              style={{ background: 'var(--accent-green)', color: 'var(--text-primary)' }}
            >
              Start the First One
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFundraisers.map((fundraiser) => {
              const percentage = calculatePercentage(fundraiser.raised_amount, fundraiser.goal_amount);
              
              return (
                <Link
                  key={fundraiser.id}
                  href={`/fundraise/${fundraiser.id}`}
                  className="rounded-lg overflow-hidden hover:shadow-xl transition-all group"
                  style={{
                    background: 'var(--card-bg)',
                    borderWidth: '1px',
                    borderColor: 'var(--border)'
                  }}
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden" style={{ background: 'var(--secondary-bg)' }}>
                    {fundraiser.cover_image ? (
                      <img
                        src={fundraiser.cover_image}
                        alt={fundraiser.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <IconHeart size={64} style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span 
                        className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(0, 192, 135, 0.1)',
                          color: 'var(--accent-green)'
                        }}
                      >
                        {fundraiser.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      className="font-bold text-lg mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {fundraiser.title}
                    </h3>

                    <div
                      className="mb-4"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      <LikeSaveButtons
                        postId={fundraiser.id}
                        postType="fundraiser"
                        showCount={false}
                        size="sm"
                      />
                    </div>

                    {/* Story Preview */}
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {fundraiser.story}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full rounded-full h-2 mb-2" style={{ background: 'var(--secondary-bg)' }}>
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            background: 'var(--accent-green)'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          ${fundraiser.raised_amount.toLocaleString()} USDC
                        </span>
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          {percentage}% of ${fundraiser.goal_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div 
                      className="flex items-center justify-between text-sm pt-3 border-t"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <div>
                        <IconHeart size={16} className="inline mr-1" />
                        {fundraiser.total_donors} donors
                      </div>
                      {fundraiser.location && (
                        <div className="text-xs">{fundraiser.location}</div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}