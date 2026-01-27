'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { IconHeart, IconSearch, IconPlus, IconTrendingUp } from '@tabler/icons-react';

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

  useEffect(() => {
    fetchFundraisers();
  }, [selectedCategory, sortBy]);

  async function fetchFundraisers() {
    try {
      setLoading(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Fundraise with Crypto</h1>
          <p className="text-xl mb-8 opacity-90">
            The #1 platform for crypto crowdfunding. Start a campaign, raise money, change lives.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/fundraise/create"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <IconPlus size={24} />
              Start a Campaign
            </Link>
            <Link
              href="#browse"
              className="bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-800 transition-colors"
            >
              Browse Campaigns
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">$2.5M+</div>
              <div className="text-gray-600">Raised in Crypto</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">15K+</div>
              <div className="text-gray-600">Campaigns Funded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Generous Donors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div id="browse" className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex gap-3">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg font-medium ${
                sortBy === 'recent'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Most Recent
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`px-4 py-2 rounded-lg font-medium inline-flex items-center gap-1 ${
                sortBy === 'trending'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <IconTrendingUp size={18} />
              Trending
            </button>
            <button
              onClick={() => setSortBy('goal')}
              className={`px-4 py-2 rounded-lg font-medium ${
                sortBy === 'goal'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading campaigns...</p>
          </div>
        ) : filteredFundraisers.length === 0 ? (
          <div className="text-center py-20">
            <IconHeart size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-400 mb-6">No campaigns found</p>
            <Link
              href="/fundraise/create"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors inline-block"
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
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-teal-500 overflow-hidden">
                    {fundraiser.cover_image ? (
                      <img
                        src={fundraiser.cover_image}
                        alt={fundraiser.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <IconHeart size={64} className="text-white opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {fundraiser.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {fundraiser.title}
                    </h3>

                    {/* Story Preview */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {fundraiser.story}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-900">
                          ${fundraiser.raised_amount.toLocaleString()} USDC
                        </span>
                        <span className="text-gray-500">
                          {percentage}% of ${fundraiser.goal_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
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