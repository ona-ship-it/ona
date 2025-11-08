'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalGiveaways: number;
  activeGiveaways: number;
}

interface RecentGiveaway {
  id: string;
  title: string | null;
  status: string;
  created_at: string | null;
  creator_id: string | null;
}

interface AdminDashboardProps {
  userEmail: string;
  dashboardData: {
    stats: DashboardStats;
    recentGiveaways: RecentGiveaway[];
  };
}

export default function AdminDashboard({ userEmail, dashboardData }: AdminDashboardProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    setActionError(null);
    try {
      const action = currentStatus === 'active' ? 'unpublish' : 'publish';
      const res = await fetch('/api/admin/giveaways/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId: id, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      router.refresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {userEmail}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData.stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <button 
                  onClick={() => router.push('/admin/users')}
                  className="font-medium text-blue-700 hover:text-blue-900"
                >
                  Manage users
                </button>
              </div>
            </div>
          </div>

          {/* Total Giveaways Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Giveaways</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData.stats.totalGiveaways}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <button 
                  onClick={() => router.push('/giveaways')}
                  className="font-medium text-green-700 hover:text-green-900"
                >
                  View all giveaways
                </button>
              </div>
            </div>
          </div>

          {/* Active Giveaways Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Giveaways</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData.stats.activeGiveaways}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <button 
                  onClick={() => router.push('/giveaways?filter=active')}
                  className="font-medium text-purple-700 hover:text-purple-900"
                >
                  View active
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/giveaway/new')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Giveaway
            </button>
            <button 
              onClick={() => router.push('/admin/reports')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View Reports
            </button>
            <button 
              onClick={() => router.push('/admin/users')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Manage Users
            </button>
            <button 
              onClick={() => router.push('/admin/settings')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Giveaways</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {dashboardData.recentGiveaways.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {dashboardData.recentGiveaways.map((giveaway) => (
                  <li key={giveaway.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{giveaway.title || 'Untitled'}</div>
                      <div className="text-sm text-gray-500">
                        {giveaway.created_at ? new Date(giveaway.created_at).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        Creator ID: {giveaway.creator_id || 'Unknown'} • Status: {giveaway.status}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(giveaway.id, giveaway.status)}
                          disabled={updatingId === giveaway.id}
                          className={`px-3 py-1 rounded text-white ${
                            giveaway.status === 'active'
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : 'bg-green-600 hover:bg-green-700'
                          } ${updatingId === giveaway.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {updatingId === giveaway.id
                            ? 'Updating…'
                            : giveaway.status === 'active'
                              ? 'Unpublish'
                              : 'Publish'}
                        </button>
                      </div>
                    </div>
                    {actionError && (
                      <div className="mt-2 text-sm text-red-600">{actionError}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No recent giveaways found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}