'use client'

import { useState } from 'react'

export default function OnaguiPro() {
  const [activeTab, setActiveTab] = useState('giveaways')
  const [searchQuery, setSearchQuery] = useState('')

  const giveaways = [
    { id: 1, title: 'Gaming PC Bundle', creator: 'TechGamer', prize: '$3,000', entries: '12.5K', timeLeft: '2d 14h', image: '🎮', hot: true },
    { id: 2, title: 'Luxury Vacation', creator: 'TravelPro', prize: '$5,000', entries: '8.2K', timeLeft: '5d 3h', image: '✈️', featured: true },
    { id: 3, title: 'iPhone 15 Pro Max', creator: 'TechReview', prize: '$1,200', entries: '25K', timeLeft: '1d 8h', image: '📱', hot: true },
    { id: 4, title: 'Crypto Airdrop', creator: 'CryptoKing', prize: '10 ETH', entries: '45K', timeLeft: '12h', image: '💎', featured: true },
    { id: 5, title: 'PS5 + Games', creator: 'GameZone', prize: '$800', entries: '18K', timeLeft: '3d 22h', image: '🎯', new: true },
    { id: 6, title: 'MacBook Pro M3', creator: 'AppleFan', prize: '$2,500', entries: '15K', timeLeft: '4d 16h', image: '💻', hot: true },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900/10 via-blue-800/10 to-blue-900/10 border-b border-white/5 px-4 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">8,432 Online</span>
            </div>
            <div className="text-gray-400">Total Prizes: <span className="text-white font-semibold">$2.4M+</span></div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">🎁 Next Draw in <span className="text-orange-400 font-mono">02:14:35</span></span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f23]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-2xl">
                  🎁
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    ONAGUI
                  </h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Provably Fair</p>
                </div>
              </div>

              {/* Main Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {['Giveaways', 'Raffles', 'Fundraise', 'Marketplace'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTab(item.toLowerCase())}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === item.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search giveaways..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
                <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Wallet Balance */}
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg px-4 py-2">
                <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase">Balance</div>
                  <div className="text-sm font-bold text-green-400">$0.00</div>
                </div>
              </div>

              {/* Create Button */}
              <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg px-5 py-2.5 font-semibold transition-all shadow-lg shadow-blue-500/25">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create
              </button>

              {/* User */}
              <button className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center font-bold">
                U
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-blue-900/40 to-blue-950/40 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Total Giveaways</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">1,247</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Active Now</div>
              <div className="text-3xl font-bold text-green-400">342</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Total Winners</div>
              <div className="text-3xl font-bold text-orange-400">15.2K</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Prizes Awarded</div>
              <div className="text-3xl font-bold text-blue-400">$2.4M</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-white/5 bg-[#0f0f23]/50 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['🔥 Hot', '⭐ Featured', '🆕 New', '⏰ Ending Soon', '💎 High Value', '🎯 Low Entry'].map((filter) => (
              <button
                key={filter}
                className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giveaways.map((item) => (
            <div
              key={item.id}
              className="group bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
            >
              {/* Image/Icon */}
              <div className="relative h-56 bg-gradient-to-br from-blue-950/60 to-blue-900/60 flex items-center justify-center overflow-hidden">
                <div className="text-8xl filter drop-shadow-2xl">{item.image}</div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.hot && (
                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      🔥 HOT
                    </div>
                  )}
                  {item.featured && (
                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      ⭐ FEATURED
                    </div>
                  )}
                  {item.new && (
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      🆕 NEW
                    </div>
                  )}
                </div>

                {/* Time Left */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-lg border border-white/20">
                  ⏰ {item.timeLeft}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg py-3 font-bold transition-all">
                    Enter Now
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">by {item.creator}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Prize Value</div>
                    <div className="text-lg font-bold text-green-400">{item.prize}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Entries</div>
                    <div className="text-lg font-bold text-blue-400">{item.entries}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Tickets</span>
                    <span>75% filled</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full"></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg py-3 font-semibold transition-all">
                    Free Entry
                  </button>
                  <button className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-8 py-4 font-semibold transition-all">
            Load More Giveaways
          </button>
        </div>
      </main>

      {/* Live Chat Button */}
      <button className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center hover:scale-110 transition-transform z-50">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  )
}
