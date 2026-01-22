'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import Image from 'next/image'

type Giveaway = {
  id: string
  title: string
  emoji: string
  image_url: string | null
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  is_free: boolean
  ticket_price: number
  ticket_currency: string
  end_date: string
  status: string
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchGiveaways()
  }, [])

  const fetchGiveaways = async () => {
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGiveaways(data || [])
    } catch (error) {
      console.error('Error fetching giveaways:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    const diff = end - now

    if (diff <= 0) return 'Ended'

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
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">
                Giveaways
              </Link>
              <Link href="/raffles" className="hover:text-white transition-colors">
                Raffles
              </Link>
              <Link href="/fundraise" className="hover:text-white transition-colors">
                Fundraise
              </Link>
              <Link href="/marketplace" className="hover:text-white transition-colors">
                Marketplace
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/create-giveaway"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/50"
                  >
                    + Create
                  </Link>
                  <Link
                    href="/profile"
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold"
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/50"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-blue-950/50 to-cyan-950/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold text-white">{giveaways.length}</div>
                <div className="text-slate-400 text-sm">Active Giveaways</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">$2.4M+</div>
                <div className="text-slate-400 text-sm">Total Prizes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">15.2K</div>
                <div className="text-slate-400 text-sm">Winners</div>
              </div>
            </div>
            <div className="text-slate-400 text-sm">
              ⏰ Next draw in <span className="text-white font-semibold">02:14:35</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {['All', 'Hot', 'Featured', 'New', 'Ending Soon', 'Free', 'Paid'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f.toLowerCase())}
              className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === f.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading giveaways...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && giveaways.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Active Giveaways Yet</h3>
            <p className="text-slate-400 mb-6">Be the first to create a giveaway!</p>
            {user && (
              <Link
                href="/create-giveaway"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/50"
              >
                Create First Giveaway
              </Link>
            )}
          </div>
        )}

        {/* Giveaways Grid */}
        {!loading && giveaways.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {giveaways.map((giveaway) => (
              <Link
                key={giveaway.id}
                href={`/giveaways/${giveaway.id}`}
                className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all hover:-translate-y-1"
              >
                {/* Image or Emoji Header */}
                <div className="relative h-48 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 flex items-center justify-center overflow-hidden">
                  {giveaway.image_url ? (
                    <Image
                      src={giveaway.image_url}
                      alt={giveaway.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-7xl group-hover:scale-110 transition-transform">
                      {giveaway.emoji}
                    </div>
                  )}
                  
                  {/* Overlay badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {!giveaway.is_free && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-600 rounded-lg text-xs font-bold text-white shadow-lg">
                      💰 Paid
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900/90 backdrop-blur rounded-lg text-xs font-semibold text-slate-300">
                    ⏰ {getTimeRemaining(giveaway.end_date)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {giveaway.title}
                  </h3>

                  {/* Prize Value */}
                  <div className="mb-3 p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800/50 rounded-xl">
                    <div className="text-xs text-green-400 mb-1">Prize Value</div>
                    <div className="text-2xl font-bold text-white">
                      ${giveaway.prize_value.toLocaleString()} {giveaway.prize_currency}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div>
                      <div className="text-slate-500 text-xs">Entries</div>
                      <div className="text-white font-semibold">
                        {giveaway.tickets_sold.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Total Tickets</div>
                      <div className="text-white font-semibold">
                        {giveaway.total_tickets.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all"
                        style={{
                          width: `${Math.min((giveaway.tickets_sold / giveaway.total_tickets) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {((giveaway.tickets_sold / giveaway.total_tickets) * 100).toFixed(0)}% filled
                    </div>
                  </div>

                  {/* Enter Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 group-hover:shadow-xl">
                    {giveaway.is_free ? 'Enter Free' : `Enter ${giveaway.ticket_price} ${giveaway.ticket_currency}`}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}