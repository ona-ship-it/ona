'use client'

import { useState } from 'react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1a2e] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            ADMIN PANEL
          </h1>
          <p className="text-xs text-gray-500 mt-1">Onagui Platform</p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Dashboard' },
              { id: 'giveaways', icon: '🎁', label: 'Giveaways' },
              { id: 'users', icon: '👥', label: 'Users' },
              { id: 'transactions', icon: '💰', label: 'Transactions' },
              { id: 'payouts', icon: '💸', label: 'Payouts' },
              { id: 'analytics', icon: '📈', label: 'Analytics' },
              { id: 'settings', icon: '⚙️', label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Admin User</div>
              <div className="text-xs text-gray-500">admin@onagui.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-[#1a1a2e] border-b border-white/10 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
              <p className="text-sm text-gray-400">Platform management and monitoring</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all">
                New Action
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: '$125,430', change: '+12.5%', trend: 'up', icon: '💰', color: 'green' },
                  { label: 'Active Users', value: '8,432', change: '+5.2%', trend: 'up', icon: '👥', color: 'blue' },
                  { label: 'Active Giveaways', value: '342', change: '-2.1%', trend: 'down', icon: '🎁', color: 'purple' },
                  { label: 'Pending Payouts', value: '$12,450', change: '+8.3%', trend: 'up', icon: '💸', color: 'orange' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-xl flex items-center justify-center text-2xl`}>
                        {stat.icon}
                      </div>
                      <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold mb-4">Revenue Overview</h3>
                  <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
                    [Revenue Chart Placeholder]
                  </div>
                </div>

                {/* User Growth */}
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold mb-4">User Growth</h3>
                  <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
                    [User Growth Chart Placeholder]
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Recent Platform Activity</h3>
                <div className="space-y-3">
                  {[
                    { type: 'giveaway', text: 'New giveaway created: Gaming PC Bundle', time: '5m ago', user: 'User_4521' },
                    { type: 'payout', text: 'Payout processed: $1,200 to User_8934', time: '12m ago', user: 'System' },
                    { type: 'user', text: 'New user registered', time: '23m ago', user: 'User_9102' },
                    { type: 'transaction', text: 'Large deposit: $5,000 USDC', time: '1h ago', user: 'User_3456' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        {activity.type === 'giveaway' && '🎁'}
                        {activity.type === 'payout' && '💸'}
                        {activity.type === 'user' && '👤'}
                        {activity.type === 'transaction' && '💰'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.text}</div>
                        <div className="text-xs text-gray-500">{activity.user} • {activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'giveaways' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium">All</button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Active</button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Pending</button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Ended</button>
                </div>
                <input
                  type="search"
                  placeholder="Search giveaways..."
                  className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Giveaway</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Creator</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Prize</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Entries</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      { name: 'Gaming PC Bundle', creator: 'TechGamer', prize: '$3,000', entries: '12.5K', status: 'active' },
                      { name: 'iPhone 15 Pro', creator: 'TechReview', prize: '$1,200', entries: '25K', status: 'active' },
                      { name: 'Crypto Airdrop', creator: 'CryptoKing', prize: '10 ETH', entries: '45K', status: 'pending' },
                    ].map((giveaway, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-xl">🎁</div>
                            <div className="font-medium">{giveaway.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{giveaway.creator}</td>
                        <td className="px-6 py-4 font-semibold text-green-400">{giveaway.prize}</td>
                        <td className="px-6 py-4">{giveaway.entries}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            giveaway.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {giveaway.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button className="p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all">
                              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1a1a2e] rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Total Users</div>
                  <div className="text-2xl font-bold">8,432</div>
                </div>
                <div className="bg-[#1a1a2e] rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Active Today</div>
                  <div className="text-2xl font-bold text-green-400">1,247</div>
                </div>
                <div className="bg-[#1a1a2e] rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">New This Week</div>
                  <div className="text-2xl font-bold text-blue-400">342</div>
                </div>
              </div>

              <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Entries</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Spent</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[1,2,3,4,5].map((i) => (
                      <tr key={i} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center font-bold">
                              U
                            </div>
                            <div className="font-medium">User_{Math.floor(Math.random() * 9999)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">user{i}@example.com</td>
                        <td className="px-6 py-4 text-gray-400">{i} days ago</td>
                        <td className="px-6 py-4">{Math.floor(Math.random() * 50)}</td>
                        <td className="px-6 py-4 font-semibold text-green-400">${Math.floor(Math.random() * 1000)}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium">Pending</button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Processing</button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Completed</button>
                </div>
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all">
                  Process All
                </button>
              </div>

              <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Winner</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Giveaway</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Prize</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Won Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      { winner: 'User_4521', giveaway: 'iPhone 15 Pro', prize: '$1,200', date: '2h ago', status: 'pending' },
                      { winner: 'User_8934', giveaway: 'PS5 Bundle', prize: '$650', date: '1d ago', status: 'processing' },
                      { winner: 'User_2187', giveaway: 'AirPods Pro', prize: '$249', date: '3d ago', status: 'completed' },
                    ].map((payout, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center font-bold">
                              W
                            </div>
                            <div className="font-medium">{payout.winner}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{payout.giveaway}</td>
                        <td className="px-6 py-4 font-semibold text-green-400">{payout.prize}</td>
                        <td className="px-6 py-4 text-gray-400">{payout.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payout.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                            payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {payout.status === 'pending' && (
                            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-all">
                              Process
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
