'use client'

import { useState } from 'react'

export default function RaffleSystem() {
  const [ticketCount, setTicketCount] = useState(1)
  const ticketPrice = 2.50

  const raffles = [
    { id: 1, title: 'MacBook Pro M3', price: '$2,500', ticketPrice: '$5', sold: 850, total: 1000, ends: '2d 4h' },
    { id: 2, title: 'Tesla Model 3', price: '$45,000', ticketPrice: '$50', sold: 450, total: 500, ends: '5d 12h' },
    { id: 3, title: 'Rolex Watch', price: '$12,000', ticketPrice: '$25', sold: 320, total: 400, ends: '1d 8h' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      {/* Header */}
      <header className="bg-[#0f0f23]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            ONAGUI RAFFLES
          </h1>
          <p className="text-gray-400 text-sm mt-1">Buy tickets, win big prizes</p>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 to-blue-900/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl font-bold mb-4">🎟️ Premium Raffles</h2>
          <p className="text-xl text-gray-300 mb-6">Limited tickets • Better odds • Bigger prizes</p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">3 Active Raffles</span>
            </div>
            <div className="text-gray-300">Total Prize Pool: <span className="text-blue-400 font-bold">$59,500</span></div>
            <div className="text-gray-300">Tickets Sold: <span className="text-orange-400 font-bold">1,620</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Raffles */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Active Raffles</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium">All</button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Ending Soon</button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium">Low Tickets</button>
              </div>
            </div>

            {raffles.map((raffle) => (
              <div key={raffle.id} className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all">
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  {/* Image */}
                  <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-xl aspect-square flex items-center justify-center">
                    <div className="text-6xl">💻</div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{raffle.title}</h3>
                          <div className="text-sm text-gray-400">Prize Value: <span className="text-green-400 font-semibold">{raffle.price}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Ticket Price</div>
                          <div className="text-2xl font-bold text-blue-400">{raffle.ticketPrice}</div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Tickets Sold</span>
                          <span>{raffle.sold} / {raffle.total}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full"
                            style={{width: `${(raffle.sold / raffle.total) * 100}%`}}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Your Tickets</div>
                          <div className="text-lg font-bold text-orange-400">0</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Your Odds</div>
                          <div className="text-lg font-bold text-blue-400">0%</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Ends In</div>
                          <div className="text-lg font-bold text-red-400">{raffle.ends}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg py-3 font-semibold transition-all">
                        Buy Tickets
                      </button>
                      <button className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div className="space-y-6">
            {/* Quick Buy */}
            <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-2xl p-6 border border-blue-500/30 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Quick Purchase</h3>
              
              {/* Ticket Counter */}
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-3">Number of Tickets</div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center font-bold transition-all"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold">{ticketCount}</div>
                  </div>
                  <button 
                    onClick={() => setTicketCount(ticketCount + 1)}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center font-bold transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Select */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[5, 10, 25, 50].map((num) => (
                  <button 
                    key={num}
                    onClick={() => setTicketCount(num)}
                    className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="bg-black/30 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price per ticket</span>
                  <span className="font-medium">${ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Quantity</span>
                  <span className="font-medium">×{ticketCount}</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2"></div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-blue-400">${(ticketPrice * ticketCount).toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg py-4 font-bold transition-all shadow-lg shadow-blue-500/25 mb-3">
                Purchase Tickets
              </button>

              <div className="text-center text-xs text-gray-400">
                🎯 Win chance increases by {((ticketCount / 1000) * 100).toFixed(2)}%
              </div>
            </div>

            {/* Recent Winners */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-400">🏆</span> Recent Winners
              </h3>
              <div className="space-y-3">
                {[
                  { user: 'User_4521', prize: 'iPhone 15 Pro', amount: '$1,200' },
                  { user: 'User_8934', prize: 'PS5 Bundle', amount: '$650' },
                  { user: 'User_2187', prize: 'AirPods Pro', amount: '$249' },
                ].map((winner, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center font-bold">
                      W
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{winner.user}</div>
                      <div className="text-gray-400 text-xs">{winner.prize}</div>
                    </div>
                    <div className="text-green-400 font-semibold">{winner.amount}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">1</div>
                  <div>Choose a raffle and select number of tickets</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">2</div>
                  <div>Complete payment with crypto or wallet balance</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">3</div>
                  <div>Get your ticket numbers instantly</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">4</div>
                  <div>Winner drawn when all tickets sold or timer ends</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold flex-shrink-0">5</div>
                  <div>Winner gets prize delivered or transferred</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}