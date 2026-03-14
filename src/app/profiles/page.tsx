'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('onagui_profiles')
      .select('*, profiles(avatar_url)')
      .order('created_at', { ascending: false })
      .limit(48)
      .then(({ data }) => { setProfiles(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = profiles.filter((p) =>
    !search || (p.username ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: 'var(--text-primary)' }}
          >
            Profiles
          </h1>
          <input
            type="search"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: 256, maxWidth: '100%' }}
          />
        </div>

        {loading ? (
          <div className="profiles-grid">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl"
                style={{ background: 'var(--bg-secondary)' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl">👤</div>
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {search ? "No profiles found" : "No profiles yet"}
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {search ? "Try a different search" : "Be the first to sign up!"}
            </p>
          </div>
        ) : (
          <div className="profiles-grid">
            {filtered.map((p: any) => (
              <Link
                key={p.id}
                href={'/profile/' + p.username}
                className="flex items-center gap-4 rounded-2xl border p-4 transition-transform hover:scale-[1.02]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border text-lg font-bold"
                  style={{ borderColor: 'var(--accent-green)', background: 'var(--bg-primary)', color: 'var(--accent-green)' }}
                >
                  {p.profiles?.avatar_url ? (
                    <img
                      src={p.profiles.avatar_url}
                      alt={p.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    (p.username ?? "?")[0].toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {'@' + (p.username ?? 'anonymous')}
                  </p>
                  <p
                    className="mt-0.5 truncate text-xs capitalize"
                    style={{ color: 'var(--accent-green)' }}
                  >
                    {p.onagui_type ?? 'member'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}