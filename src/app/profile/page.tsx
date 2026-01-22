'use client'

import { useState } from 'react'

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      {/* Header */}
      <header className="bg-[#0f0f23]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            MY DASHBOARD
          </h1>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-950/60 to-blue-900/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-4xl font-bold">
                U
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0f0f23] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">User_8472</h2>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold">
                  ⭐ Verified
                </span>
                <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-semibold">
                  🔥 Level 5
                </span>
              </div>
              <p className="text-gray-400 mb-4">Member since Jan 2024 • Last active 2 hours ago</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">42</div>
                  <div className="text-xs text-gray-400">Entries</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">3</div>
                  <div className="text-xs text-gray-400">Wins</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-400">$1.2K</div>
                  <div className="text-xs text-gray-400">Won</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">89%</div>
                  <div className="text-xs text-gray-400">Luck Score</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 transition-all">
                Edit Profile
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 sticky top-0 z-30 bg-[#0f0f23]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {['Overview', 'Wallet', 'Entries', 'History', 'Achievements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.toLowerCase()
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Overview */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Wallet Balance</h3>
                    <button className="text-sm text-blue-400 hover:text-blue-300">View Details →</button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-black/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">💵</div>
                        <span className="text-sm text-gray-400">USDC</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">$1,247.50</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">💎</div>
                        <span className="text-sm text-gray-400">ETH</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">0.547</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">⚡</div>
                        <span className="text-sm text-gray-400">MATIC</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">247.89</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg py-3 font-semibold transition-all">
                      Deposit
                    </button>
                    <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-3 font-semibold transition-all">
                      Withdraw
                    </button>
                  </div>
                </div>

                {/* Active Entries */}
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Active Entries</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Gaming PC Bundle', entries: 5, ends: '2d 14h', prize: '$3,000' },
                      { title: 'iPhone 15 Pro', entries: 3, ends: '1d 8h', prize: '$1,200' },
                      { title: 'Crypto Airdrop', entries: 10, ends: '12h', prize: '10 ETH' },
                    ].map((entry, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-lg flex items-center justify-center text-2xl">
                          🎁
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{entry.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{entry.entries} entries</span>
                            <span>•</span>
                            <span>Ends in {entry.ends}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Prize</div>
                          <div className="font-bold text-green-400">{entry.prize}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { type: 'entry', text: 'Entered Gaming PC Bundle', time: '2h ago', icon: '🎫' },
                      { type: 'win', text: 'Won $250 Raffle Prize!', time: '1d ago', icon: '🏆' },
                      { type: 'deposit', text: 'Deposited 100 USDC', time: '2d ago', icon: '💰' },
                      { type: 'entry', text: 'Claimed free entry', time: '3d ago', icon: '🎁' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-xl">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.text}</div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Progress */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Level Progress</h3>
                <span className="text-orange-400 font-bold">Level 5</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>XP Progress</span>
                  <span>2,450 / 3,000</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style={{width: '81.6%'}}></div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                550 XP to Level 6
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-3 gap-3">
                {['🏆', '⭐', '💎', '🎯', '🔥', '👑'].map((emoji, i) => (
                  <div key={i} className="aspect-square bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-3xl transition-all cursor-pointer border border-white/10">
                    {emoji}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">
                View All Achievements →
              </button>
            </div>

            {/* Stats */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="font-semibold text-green-400">7.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Spent</span>
                  <span className="font-semibold">$847.50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Won</span>
                  <span className="font-semibold text-green-400">$1,247.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Net Profit</span>
                  <span className="font-semibold text-green-400">+$399.50</span>
                </div>
              </div>
            </div>

            {/* Referral */}
            <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-2xl p-6 border border-blue-500/30">
              <h3 className="font-bold mb-3">Refer Friends</h3>
              <p className="text-sm text-gray-300 mb-4">Get $10 for each friend who joins!</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value="ONAGUI8472"
                  readOnly
                  className="flex-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium transition-all">
                  Copy
                </button>
              </div>
              <div className="text-sm text-gray-400">
                👥 {Math.floor(Math.random() * 20)} friends referred
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}