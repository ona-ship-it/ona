'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

type Giveaway = {
  id: string
  title: string
  description: string
  emoji: string
  image_url: string | null
  prize_value: number
  prize_currency: string
  tickets_sold: number
  total_tickets: number
  ticket_price: number
  is_free: boolean
  status: string
  end_date: string
}

export default function HomePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [filter, setFilter] = useState<'all' | 'hot' | 'featured' | 'new' | 'ending' | 'free' | 'paid'>('all')
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  useEffect(() => {
    fetchGiveaways()
  }, [filter])

  async function fetchGiveaways() {
    setLoading(true)
    try {
      let query = supabase
        .from('giveaways')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (filter === 'free') {
        query = query.eq('is_free', true)
      } else if (filter === 'paid') {
        query = query.eq('is_free', false)
      } else if (filter === 'ending') {
        query = query.order('end_date', { ascending: true }).limit(20)
      } else if (filter === 'new') {
        query = query.order('created_at', { ascending: false }).limit(20)
      }

      const { data, error } = await query

      if (error) throw error
      setGiveaways(data || [])
    } catch (error) {
      console.error('Error fetching giveaways:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (sold: number, total: number) => {
    return Math.min((sold / total) * 100, 100)
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now

    if (diff < 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              <Link href="/" className="text-white font-semibold hover:text-blue-400 transition-colors">
                Giveaways
              </Link>
              <Link href="/raffles" className="text-slate-400 font-semibold hover:text-blue-400 transition-colors">
                Raffles
              </Link>
              <Link href="/dashboard" className="text-slate-400 font-semibold hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/fundraise" className="text-slate-400 font-semibold hover:text-blue-400 transition-colors">
                Fundraise
              </Link>
              <Link href="/marketplace" className="text-slate-400 font-semibold hover:text-blue-400 transition-colors">
                Marketplace
              </Link>
            </nav>

            {/* Create Button with Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCreateMenu(true)}
                onMouseLeave={() => setShowCreateMenu(false)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                + Create
              </button>

              {/* Dropdown Menu */}
              {showCreateMenu && (
                <div
                  onMouseEnter={() => setShowCreateMenu(true)}
                  onMouseLeave={() => setShowCreateMenu(false)}
                  className="absolute top-full right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <Link
                    href="/create"
                    className="block px-6 py-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800"
                  >
                    <div className="font-bold text-white mb-1">Giveaway</div>
                    <div className="text-sm text-slate-400">Create a free or paid giveaway</div>
                  </Link>
                  
                  <Link
                    href="/raffles/create"
                    className="block px-6 py-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800"
                  >
                    <div className="font-bold text-white mb-1">Raffle</div>
                    <div className="text-sm text-slate-400">Launch a raffle for prizes</div>
                  </Link>
                  
                  <Link
                    href="/fundraise/create"
                    className="block px-6 py-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800"
                  >
                    <div className="font-bold text-white mb-1">Fundraise</div>
                    <div className="text-sm text-slate-400">Start a fundraising campaign</div>
                  </Link>
                  
                  <Link
                    href="/marketplace/create"
                    className="block px-6 py-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="font-bold text-white mb-1">Marketplace</div>
                    <div className="text-sm text-slate-400">List an item for sale</div>
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile (if logged in) */}
            <Link href="/profile">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform">
                T
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-sm text-slate-400 mb-1">Active Giveaways</div>
              <div className="text-3xl font-black text-white">{giveaways.length}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Total Prizes</div>
              <div className="text-3xl font-black text-green-400">
                ${giveaways.reduce((sum, g) => sum + g.prize_value, 0).toLocaleString()}+
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Winners</div>
              <div className="text-3xl font-black text-blue-400">15.2K</div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="font-semibold">Next draw in 02:14:35</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('hot')}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === 'hot'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              Hot
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === 'featured'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilter('ending')}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === 'ending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              Ending Soon
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === 'paid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              Paid
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : giveaways.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Giveaways Found</h3>
            <p className="text-slate-400">Check back soon for new giveaways!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {giveaways.map((giveaway) => (
              <Link
                key={giveaway.id}
                href={`/giveaways/${giveaway.id}`}
                className="group"
              >
                <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden transition-all group-hover:scale-105 group-hover:border-blue-500">
                  {/* Paid Badge */}
                  {!giveaway.is_free && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-yellow-500 rounded-full">
                      <span className="text-xs font-bold text-white">Paid</span>
                    </div>
                  )}

                  {/* Timer */}
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-red-500/90 rounded-full">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      {getTimeRemaining(giveaway.end_date)}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900">
                    {giveaway.image_url ? (
                      <Image
                        src={giveaway.image_url}
                        alt={giveaway.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-7xl">
                        {giveaway.emoji}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {giveaway.title}
                    </h3>

                    {/* Prize Value */}
                    <div className="mb-3">
                      <div className="text-xs text-slate-500 mb-1">Prize Value</div>
                      <div className="text-xl font-black text-green-400">
                        ${giveaway.prize_value} USD
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div>
                        <div className="text-xs text-slate-500">Entries</div>
                        <div className="font-bold text-white">{giveaway.tickets_sold}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Total Tickets</div>
                        <div className="font-bold text-white">{giveaway.total_tickets.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{getProgressPercentage(giveaway.tickets_sold, giveaway.total_tickets).toFixed(0)}% filled</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${getProgressPercentage(giveaway.tickets_sold, giveaway.total_tickets)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Enter Button */}
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                      Enter {giveaway.is_free ? 'Free' : `${giveaway.ticket_price} USDC`}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
