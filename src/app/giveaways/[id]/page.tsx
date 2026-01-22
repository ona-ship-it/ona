'use client'

import { useState } from 'react'

export default function GiveawayDetail() {
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [entryType, setEntryType] = useState('free')

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      {/* Header */}
      <header className="bg-[#0f0f23]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              ONAGUI
            </h1>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg px-6 py-2 font-semibold transition-all">
            Share
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950/60 to-blue-900/60 aspect-video border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-9xl">🎮</div>
              </div>
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">🔥 HOT</div>
                <div className="bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">⭐ FEATURED</div>
              </div>
              {/* Time Left */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <div className="text-xs text-gray-300 mb-1">Ends in</div>
                <div className="text-xl font-bold text-orange-400 font-mono">02:14:35</div>
              </div>
            </div>

            {/* Title & Creator */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">Gaming PC Ultimate Bundle</h1>
                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                        T
                      </div>
                      <span>by <span className="text-white font-medium">TechGamer</span></span>
                    </div>
                    <span>•</span>
                    <span>Created 3 days ago</span>
                  </div>
                </div>
                <button className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-6 h-6 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Prize Value</div>
                  <div className="text-2xl font-bold text-green-400">$3,000</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Total Entries</div>
                  <div className="text-2xl font-bold text-blue-400">12,547</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Your Entries</div>
                  <div className="text-2xl font-bold text-orange-400">3</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold mb-4">About this Giveaway</h2>
              <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                <p>Win an incredible high-end gaming PC bundle worth $3,000! This premium setup includes everything you need to dominate in the latest AAA games.</p>
                
                <h3 className="text-white font-semibold text-lg mt-6 mb-3">What's Included:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>RTX 4090 Graphics Card</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Intel i9-13900K Processor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>32GB DDR5 RAM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>2TB NVMe SSD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Custom RGB Case</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Mechanical Keyboard & Gaming Mouse</span>
                  </li>
                </ul>

                <h3 className="text-white font-semibold text-lg mt-6 mb-3">How to Enter:</h3>
                <p>Simply claim your free entry or purchase additional entries to increase your chances. Winner will be selected randomly when the timer ends.</p>
              </div>
            </div>

            {/* Entry Methods */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold mb-4">Entry Methods</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div>
                      <div className="font-semibold">Free Entry</div>
                      <div className="text-sm text-gray-400">1 entry per user</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">FREE</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💎</span>
                    </div>
                    <div>
                      <div className="font-semibold">Premium Entry</div>
                      <div className="text-sm text-gray-400">5 entries</div>
                    </div>
                  </div>
                  <div className="text-blue-400 font-bold">$5.00</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                      <div className="font-semibold">Max Entries</div>
                      <div className="text-sm text-gray-400">50 entries</div>
                    </div>
                  </div>
                  <div className="text-orange-400 font-bold">$25.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Entry Card */}
            <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-2xl p-6 border border-blue-500/30 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-400 mb-2">Tickets Remaining</div>
                <div className="text-4xl font-bold text-white mb-1">7,453</div>
                <div className="text-sm text-gray-400">of 20,000 total</div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>62.7%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full" style={{width: '62.7%'}}></div>
                </div>
              </div>

              {/* Entry Button */}
              <button 
                onClick={() => setShowEntryModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg py-4 font-bold text-lg transition-all shadow-lg shadow-blue-500/25 mb-3"
              >
                Enter Giveaway
              </button>
              <div className="text-center text-sm text-gray-400">
                🎯 Your chance to win: 1 in 4,182
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-gray-300">Provably Fair Draw</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-300">Secure Transactions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-gray-300">Instant Winner Notification</span>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-green-400">●</span> Recent Entries
              </h3>
              <div className="space-y-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white">User_{Math.floor(Math.random() * 9999)}</div>
                      <div className="text-gray-500 text-xs">{i} entries</div>
                    </div>
                    <div className="text-gray-500 text-xs">{i}m ago</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full border border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Enter Giveaway</h2>
              <button onClick={() => setShowEntryModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Entry Type Selection */}
              <div className="space-y-2">
                <button
                  onClick={() => setEntryType('free')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    entryType === 'free' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl">🎁</div>
                      <div className="text-left">
                        <div className="font-bold">Free Entry</div>
                        <div className="text-sm text-gray-400">1 entry</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-green-400">FREE</div>
                  </div>
                </button>

                <button
                  onClick={() => setEntryType('premium')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    entryType === 'premium' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">💎</div>
                      <div className="text-left">
                        <div className="font-bold">Premium Entry</div>
                        <div className="text-sm text-gray-400">5 entries</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-400">$5.00</div>
                  </div>
                </button>

                <button
                  onClick={() => setEntryType('max')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    entryType === 'max' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center text-2xl">⚡</div>
                      <div className="text-left">
                        <div className="font-bold">Max Entries</div>
                        <div className="text-sm text-gray-400">50 entries • Best value!</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-orange-400">$25.00</div>
                  </div>
                </button>
              </div>

              {/* Payment Method (if not free) */}
              {entryType !== 'free' && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-3">Payment Method</div>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all">
                      <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">💳</div>
                      <span className="font-medium">Wallet Balance: $45.00</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all">
                      <div className="w-8 h-8 bg-orange-500/20 rounded flex items-center justify-center">🔗</div>
                      <span className="font-medium">Connect Crypto Wallet</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg py-4 font-bold transition-all shadow-lg shadow-blue-500/25">
                {entryType === 'free' ? 'Claim Free Entry' : 'Confirm Purchase'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By entering, you agree to our Terms of Service and that you are 18+
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
