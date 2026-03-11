'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase'

type Raffle = {
  id: string
  title: string
  description: string | null
  images: string[] | null
  prize_value: number | null
  ticket_price: number
  max_tickets: number
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
      .select('id,title,description,images,prize_value,ticket_price,max_tickets,tickets_sold,status,end_date,country_restriction')
      .eq('status', filter)
      .order('created_at', { ascending: false })
      .limit(24)
    setRaffles(data ?? [])
    setLoading(false)
  }

  const pct = (r: Raffle) => Math.min(100, Math.round((r.tickets_sold / r.max_tickets) * 100))

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {raffles.map((r) => (
              <Link key={r.id} href={`/raffles/${r.id}`} className="group block rounded-2xl border transition-all hover:border-green-500/40" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                {/* Image */}
                <div className="relative h-44 overflow-hidden rounded-t-2xl bg-gray-900">
                  {r.images?.[0] ? (
                    <img src={r.images[0]} alt={r.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🏆</div>
                  )}
                  {/* Status badge */}
                  <span className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: r.status === 'active' ? 'rgba(0,255,136,0.15)' : 'transparent', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>
                    {r.status.toUpperCase()}
                  </span>
                  {r.country_restriction && (
                    <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                      {r.country_restriction} only
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="mb-1 truncate font-bold" style={{ color: 'var(--text-primary)' }}>{r.title}</h3>
                  {r.prize_value && (
                    <p className="mb-3 text-lg font-extrabold" style={{ color: 'var(--accent-green)' }}>
                      ${r.prize_value.toLocaleString()} prize
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct(r)}%`, background: 'var(--accent-green)' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{r.tickets_sold}/{r.max_tickets} tickets</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${r.ticket_price} USDC</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
