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
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')
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
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-50 backdrop-blur-xl" style={{ 
        background: 'rgba(11, 14, 17, 0.8)',
        borderColor: 'var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>
                ONAGUI
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link 
                href="/" 
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                Giveaways
              </Link>
              <Link 
                href="/raffles" 
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Raffles
              </Link>
              <Link 
                href="/fundraise" 
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Fundraise
              </Link>
              <Link 
                href="/marketplace" 
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Marketplace
              </Link>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Dashboard
              </Link>
            </nav>

            {/* Create Button with Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCreateMenu(true)}
                onMouseLeave={() => setShowCreateMenu(false)}
                className="px-5 py-2.5 text-sm font-semibold rounded-md transition-all"
                style={{ 
                  background: 'var(--accent-green)',
                  color: 'var(--text-primary)'
                }}
              >
                + Create
              </button>

              {showCreateMenu && (
                <div
                  onMouseEnter={() => setShowCreateMenu(true)}
                  onMouseLeave={() => setShowCreateMenu(false)}
                  className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-xl overflow-hidden"
                  style={{ 
                    background: 'var(--secondary-bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <Link
                    href="/create"
                    className="block px-4 py-3 transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Giveaway
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Create a free or paid giveaway
                    </div>
                  </Link>
                  
                  <Link
                    href="/raffles/create"
                    className="block px-4 py-3 transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Raffle
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Launch a raffle for prizes
                    </div>
                  </Link>
                  
                  <Link
                    href="/fundraise/create"
                    className="block px-4 py-3 transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Fundraise
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Start a fundraising campaign
                    </div>
                  </Link>
                  
                  <Link
                    href="/marketplace/create"
                    className="block px-4 py-3 transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Marketplace
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      List an item for sale
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile */}
            <Link href="/profile">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent-blue)', color: 'var(--text-primary)' }}
              >
                T
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b" style={{ 
        background: 'var(--secondary-bg)',
        borderColor: 'var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Active Giveaways
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {giveaways.length}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Total Prizes
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>
                ${giveaways.reduce((sum, g) => sum + g.prize_value, 0).toLocaleString()}+
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Winners
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>
                15.2K
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b" style={{ 
        background: 'var(--secondary-bg)',
        borderColor: 'var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 py-3">
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 text-sm font-medium rounded-md transition-all"
              style={{ 
                background: filter === 'all' ? 'var(--accent-blue)' : 'transparent',
                color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('free')}
              className="px-4 py-2 text-sm font-medium rounded-md transition-all"
              style={{ 
                background: filter === 'free' ? 'var(--accent-blue)' : 'transparent',
                color: filter === 'free' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              Free
            </button>
            <button
              onClick={() => setFilter('paid')}
              className="px-4 py-2 text-sm font-medium rounded-md transition-all"
              style={{ 
                background: filter === 'paid' ? 'var(--accent-blue)' : 'transparent',
                color: filter === 'paid' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              Paid
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-t-transparent" style={{ borderColor: 'var(--accent-blue)' }}></div>
          </div>
        ) : giveaways.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Giveaways Found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Check back soon for new giveaways
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {giveaways.map((giveaway) => (
              <Link
                key={giveaway.id}
                href={`/giveaways/${giveaway.id}`}
                className="card group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-lg" style={{ background: 'var(--tertiary-bg)' }}>
                  {giveaway.image_url ? (
                    <Image src={giveaway.image_url} alt={giveaway.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">
                      {giveaway.emoji}
                    </div>
                  )}
                  
                  {/* Timer Badge */}
                  <div 
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(11, 14, 17, 0.8)', color: 'var(--accent-red)' }}
                  >
                    {getTimeRemaining(giveaway.end_date)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>
                    {giveaway.title}
                  </h3>

                  {/* Prize Value */}
                  <div className="mb-3">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Prize Value
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                      ${giveaway.prize_value.toLocaleString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>{getProgressPercentage(giveaway.tickets_sold, giveaway.total_tickets).toFixed(0)}%</span>
                      <span>{giveaway.tickets_sold} entries</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tertiary-bg)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${getProgressPercentage(giveaway.tickets_sold, giveaway.total_tickets)}%`,
                          background: 'var(--accent-blue)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Enter Button */}
                  <button 
                    className="w-full py-2.5 rounded-md text-sm font-semibold transition-all"
                    style={{ 
                      background: giveaway.is_free ? 'var(--accent-green)' : 'var(--accent-blue)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {giveaway.is_free ? 'Enter Free' : `${giveaway.ticket_price} USDC`}
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
