'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function GiveawaysPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('giveaways')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(24)
      .then(({ data }) => { setItems(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-3xl font-extrabold"
            style={{ color: 'var(--text-primary)' }}
          >
            Giveaways
          </h1>
          <Link
            href="/giveaways/create"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent-green)' }}
          >
            + Create Giveaway
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl"
                style={{ background: 'var(--bg-secondary)' }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl">🎁</div>
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              No giveaways yet
            </h2>
            <p
              className="mb-6 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Be the first to start one!
            </p>
            <Link
              href="/giveaways/create"
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: 'var(--accent-green)' }}
            >
              Create Giveaway
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((g: any) => (
              <Link
                key={g.id}
                href={'/giveaways/' + g.id}
                className="group rounded-2xl border overflow-hidden transition-transform hover:scale-[1.02]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
              >
                {g.image_url ? (
                  <div className="relative h-44 overflow-hidden">
                    <img src={g.image_url} alt={g.title} className="h-full w-full object-cover" />
                    <span
                      className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ background: 'rgba(0,255,136,0.15)', color: 'var(--accent-green)', border: '1px solid rgba(0,255,136,0.3)' }}
                    >
                      GIVEAWAY
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex h-44 items-center justify-center text-4xl"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    🎁
                  </div>
                )}
                <div className="p-4">
                  <p
                    className="truncate font-semibold"
                    style={{ color: 'var(--accent-green)' }}
                  >{g.title}</p>
                  {g.prize_value && (
                    <p
                      className="mt-1 text-xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {'$'}{g.prize_value}
                    </p>
                  )}
                  {g.description && (
                    <p
                      className="mt-1 line-clamp-2 text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >{g.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}