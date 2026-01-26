'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

type Raffle = {
  id: string
  title: string
  description: string
  emoji: string
  image_urls: string[]
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  base_ticket_price: number
  is_powered_by_onagui: boolean
  country: string | null
  tags: string[]
  status: string
  creator_id: string
  creator_name: string
  creator_avatar: string | null
  creator_verified: boolean
  view_count: number
  created_at: string
}

export default function RafflesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [filter, setFilter] = useState<'all' | 'featured' | 'ending'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRaffles()
  }, [filter])

  async function fetchRaffles() {
    setLoading(true)
    try {
      let query = supabase
        .from('raffles')
        .select(`
          id,
          title,
          description,
          emoji,
          image_urls,
          prize_value,
          prize_currency,
          total_tickets,
          tickets_sold,
          base_ticket_price,
          is_powered_by_onagui,
          country,
          tags,
          status,
          creator_id,
          view_count,
          created_at
        `)
        .eq('status', 'active')

      if (filter === 'featured') {
        query = query.eq('is_powered_by_onagui', true)
      }

      const { data: rafflesData, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Fetch creator profiles
      const enrichedRaffles = await Promise.all(
        (rafflesData || []).map(async (raffle) => {
          const { data: profile } = await supabase
            .from('creator_profiles')
            .select('display_name, avatar_url, verification_level')
            .eq('user_id', raffle.creator_id)
            .single()

          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', raffle.creator_id)
            .single()

          return {
            ...raffle,
            creator_name: profile?.display_name || userProfile?.full_name || 'Anonymous',
            creator_avatar: profile?.avatar_url || null,
            creator_verified: profile?.verification_level !== 'none' && profile?.verification_level !== null,
          }
        })
      )

      setRaffles(enrichedRaffles)
    } catch (error) {
      console.error('Error fetching raffles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRaffles = raffles.filter(raffle =>
    raffle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    raffle.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProgressPercentage = (sold: number, total: number) => {
    return Math.min((sold / total) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  ONAGUI
                </h1>
              </Link>
              <p className="text-slate-400 text-sm">Raffles - Win Amazing Prizes</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/raffles/create"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all"
              >
                Create Raffle
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
              >
                Giveaways
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-white mb-4">
            🎟️ Active Raffles
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Buy tickets, win amazing prizes. Every ticket counts!
          </p>

          {/* Search & Filters */}
          <div className="max-w-2xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search raffles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              All Raffles
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                filter === 'featured'
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              ⚡ Powered by Onagui
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading raffles...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRaffles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Raffles Found</h3>
            <p className="text-slate-400 mb-8">Be the first to create a raffle!</p>
            <Link
              href="/raffles/create"
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
            >
              Create Raffle
            </Link>
          </div>
        )}

        {/* Raffles Grid */}
        {!loading && filteredRaffles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRaffles.map((raffle) => (
              <Link
                key={raffle.id}
                href={`/raffles/${raffle.id}`}
                className={`group block ${
                  raffle.is_powered_by_onagui
                    ? 'relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-yellow-500/20 before:to-orange-500/20 before:blur-xl before:animate-pulse'
                    : ''
                }`}
              >
                <div className="relative bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden transition-all group-hover:scale-105 group-hover:border-blue-500">
                  {/* Powered by Onagui Badge */}
                  {raffle.is_powered_by_onagui && (
                    <div className="absolute top-4 right-4 z-10 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                      <span className="text-white font-bold text-sm flex items-center gap-2">
                        ⚡ Powered by Onagui
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900">
                    {raffle.image_urls && raffle.image_urls.length > 0 ? (
                      <Image
                        src={raffle.image_urls[0]}
                        alt={raffle.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-8xl">
                        {raffle.emoji}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Creator Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {raffle.creator_avatar ? (
                          <Image
                            src={raffle.creator_avatar}
                            alt={raffle.creator_name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          raffle.creator_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {raffle.creator_name}
                          </span>
                          {raffle.creator_verified && (
                            <span className="text-blue-400">✓</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {raffle.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {raffle.description}
                    </p>

                    {/* Prize Value */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Prize Value</div>
                        <div className="text-2xl font-black text-yellow-400">
                          ${raffle.prize_value.toLocaleString()} {raffle.prize_currency}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Per Ticket</div>
                        <div className="text-xl font-bold text-green-400">
                          ${raffle.base_ticket_price}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">
                          {raffle.tickets_sold.toLocaleString()} / {raffle.total_tickets.toLocaleString()} sold
                        </span>
                        <span className="text-blue-400 font-bold">
                          {getProgressPercentage(raffle.tickets_sold, raffle.total_tickets).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${getProgressPercentage(raffle.tickets_sold, raffle.total_tickets)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>👁️ {raffle.view_count} views</span>
                      <span>{raffle.country || 'Global'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-3xl">
          <div className="flex items-start gap-6">
            <div className="text-6xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">How Raffles Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
                <div>
                  <div className="text-4xl mb-2">1️⃣</div>
                  <h4 className="font-bold text-white mb-1">Buy Tickets</h4>
                  <p className="text-sm">Purchase tickets with USDC. More tickets = better odds!</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">2️⃣</div>
                  <h4 className="font-bold text-white mb-1">Wait for Draw</h4>
                  <p className="text-sm">When all tickets sell, winner is drawn fairly & transparently</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">3️⃣</div>
                  <h4 className="font-bold text-white mb-1">Win Prize</h4>
                  <p className="text-sm">Winner gets the prize or USDC equivalent. It's that simple!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}