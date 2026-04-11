'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, CheckCircle, Star, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import LikeSaveButtons from '@/components/LikeSaveButtons'

type Raffle = {
  id: string
  title: string
  description: string | null
  image_urls: string[] | null
  prize_value: number | null
  ticket_price: number
  total_tickets: number
  tickets_sold: number
  status: string
  end_date: string | null
  country_restriction: string | null
}

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'completed'>('active')
  const supabase = createClient()

  useEffect(() => {
    fetchRaffles()
  }, [filter])

  async function fetchRaffles() {
    setLoading(true)
    const { data } = await supabase
      .from('raffles')
      .select('id,title,description,image_urls,prize_value,ticket_price,total_tickets,tickets_sold,status,end_date,country_restriction')
      .eq('status', filter)
      .order('created_at', { ascending: false })
      .limit(24)
    setRaffles(data ?? [])
    setLoading(false)
  }

  const raffleFallbackImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop'

  const getRatingData = (seed: string) => {
    let hash = 0
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }
    return {
      rating: (4.3 + (hash % 70) / 100).toFixed(1),
      count: 50 + (hash % 200),
    }
  }

  const getRaffleHighlight = (r: Raffle) => {
    if (r.total_tickets > 0 && r.tickets_sold / r.total_tickets >= 0.8) return 'Almost Sold Out'
    if (r.total_tickets > 0 && r.tickets_sold / r.total_tickets >= 0.5) return 'Popular Raffle'
    return 'New Raffle'
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Raffles
          </h1>
          <Link
            href="/raffles/create"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent-green)' }}
          >
            + Create Raffle
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          {(['active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all"
              style={{
                background: filter === f ? 'var(--accent-green)' : 'var(--bg-secondary)',
                color: filter === f ? '#0a1929' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'var(--accent-green)' : 'var(--border)'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="items-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl" style={{ background: 'var(--bg-secondary)' }} />
            ))}
          </div>
        ) : raffles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl">🎟️</div>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No {filter} raffles yet</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Be the first to create one!</p>
            <Link href="/raffles/create" className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: 'var(--accent-green)' }}>
              Create Raffle
            </Link>
          </div>
        ) : (
          <div className="items-grid">
            {raffles.map((r) => (
              <Link key={r.id} href={`/raffles/${r.id}`} className="bc-game-card group">
                {/* Image */}
                <div className="bc-card-image-wrapper">
                  <Image
                    src={r.image_urls?.[0] || raffleFallbackImage}
                    alt={r.title}
                    fill
                    className="bc-card-image"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="bc-image-overlay" />

                  {r.tickets_sold > 2500 && (
                    <div className="bc-trending-badge">
                      <TrendingUp size={14} />
                      <span>TRENDING</span>
                    </div>
                  )}

                  <div className="bc-verified-icon">
                    <CheckCircle size={20} fill="#00d4d4" stroke="#0f1419" />
                  </div>

                  <div className="bc-condition-tag">RAFFLE</div>
                </div>

                {/* Content */}
                <div className="bc-card-body">
                  <div className="bc-rating-row">
                    <div className="bc-rating-display">
                      <Star size={12} fill="#ff8800" stroke="none" />
                      <span className="rating-value">{getRatingData(r.id).rating}</span>
                      <span className="rating-count">({getRatingData(r.id).count})</span>
                    </div>
                    <div
                      style={{ marginLeft: 'auto' }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    >
                      <LikeSaveButtons postId={r.id} postType="raffle" showCount={false} size="sm" />
                    </div>
                  </div>

                  <div className="bc-highlight">{getRaffleHighlight(r)}</div>

                  <h3 className="bc-card-title">{r.title}</h3>

                  <p className="bc-card-subtitle">
                    {r.tickets_sold} of {r.total_tickets} tickets sold
                  </p>

                  <div className="bc-host-info">
                    <span>by</span>
                    <span className="bc-host-name">ONAGUI</span>
                  </div>

                  <div className="bc-price-section">
                    <div className="bc-price-display">
                      <span className="bc-currency">$</span>
                      <span className="bc-price-value">
                        {(r.prize_value ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button className="bc-action-button">
                    <ShoppingCart size={16} />
                    <span>BUY TICKET</span>
                    <div className="bc-btn-glow" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
