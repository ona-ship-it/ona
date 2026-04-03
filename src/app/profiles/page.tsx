'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, CheckCircle } from 'lucide-react'

type ProfileData = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string | null
  giveawaysHosted: number
  totalEntries: number
  followers: number
  onagui_type?: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    const supabase = createClient()
    setLoading(true)
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('onagui_profiles')
        .select('id, username, full_name, avatar_url, created_at, onagui_type')
        .order('created_at', { ascending: false })
        .limit(100)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        setProfiles([])
        setLoading(false)
        return
      }

      const profileIds = (profilesData || []).map((p) => p.id).filter((id): id is string => !!id)

      if (profileIds.length === 0) {
        setProfiles([])
        setLoading(false)
        return
      }

      // Get follower counts
      const { data: followerRows, error: followerError } = await supabase
        .from('profile_followers')
        .select('profile_id')
        .limit(10000)

      if (followerError) {
        console.error('Error fetching follower data:', followerError)
      }

      const followerCounts = new Map<string, number>()
      ;(followerRows || []).forEach((row) => {
        if (!row.profile_id) return
        followerCounts.set(row.profile_id, (followerCounts.get(row.profile_id) || 0) + 1)
      })

      // Get giveaway stats
      const { data: creatorGiveaways, error: creatorGiveawaysError } = await supabase
        .from('giveaways')
        .select('creator_id, tickets_sold')
        .limit(500)

      if (creatorGiveawaysError) {
        console.error('Error fetching creator giveaways:', creatorGiveawaysError)
      }

      const creatorStats = new Map<string, { giveawaysHosted: number; totalEntries: number }>()
      ;(creatorGiveaways || []).forEach((giveaway) => {
        if (!giveaway.creator_id) return
        const current = creatorStats.get(giveaway.creator_id) || { giveawaysHosted: 0, totalEntries: 0 }
        creatorStats.set(giveaway.creator_id, {
          giveawaysHosted: current.giveawaysHosted + 1,
          totalEntries: current.totalEntries + (giveaway.tickets_sold || 0)
        })
      })

      // Enhance profiles with stats
      const enrichedProfiles: ProfileData[] = (profilesData || []).map((profile) => ({
        ...profile,
        giveawaysHosted: creatorStats.get(profile.id)?.giveawaysHosted || 0,
        totalEntries: creatorStats.get(profile.id)?.totalEntries || 0,
        followers: followerCounts.get(profile.id) || 0
      }))

      const rankedProfiles = [...enrichedProfiles]
        .sort((a, b) => {
          const scoreA = a.followers * 3 + a.totalEntries + a.giveawaysHosted * 100
          const scoreB = b.followers * 3 + b.totalEntries + b.giveawaysHosted * 100
          return scoreB - scoreA
        })

      setProfiles(rankedProfiles)
    } catch (error) {
      console.error('Error fetching profiles:', error)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  const profileFallbackImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop'

  const getProfileHighlight = (profile: ProfileData) => {
    if (profile.followers >= 1000) return 'Most Followed'
    if (profile.totalEntries >= 10000) return 'Top Entries'
    return 'Top Creator'
  }

  const filtered = profiles.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (p.username ?? "").toLowerCase().includes(q)
      || (p.full_name ?? "").toLowerCase().includes(q)
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px' }}>
        {/* Header with search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', margin: 0 }}>
            Most Popular Profiles
          </h1>
          <input
            type="search"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border px-4 py-2 text-sm"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              width: 256,
              maxWidth: '100%'
            }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="items-grid">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-2xl"
                style={{ background: 'var(--bg-secondary)' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl">👤</div>
            <h2 className="mb-2 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {search ? "No profiles found" : "No profiles yet"}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {search ? "Try a different search" : "Be the first to sign up!"}
            </p>
          </div>
        ) : (
          <div className="items-grid">
            {filtered.map((profile) => (
              <Link
                key={profile.id}
                href={`/profiles/${profile.id}`}
                className="bc-game-card group"
              >
                {/* Image */}
                <div className="bc-card-image-wrapper">
                  <Image
                    src={profile.avatar_url || profileFallbackImage}
                    alt={profile.full_name || profile.username || 'Profile'}
                    fill
                    className="bc-card-image"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  <div className="bc-image-overlay"></div>

                  <div className="bc-trending-badge">
                    <TrendingUp size={14} />
                    <span>TOP CREATOR</span>
                  </div>

                  <div className="bc-verified-icon">
                    <CheckCircle size={20} fill="#00d4d4" stroke="#0f1419" />
                  </div>

                  <div className="bc-condition-tag">PROFILE</div>
                </div>

                {/* Content */}
                <div className="bc-card-body">
                  <div className="bc-highlight">{getProfileHighlight(profile)}</div>

                  <h3 className="bc-card-title">{profile.full_name || profile.username || 'Onagui Creator'}</h3>

                  <p className="bc-card-subtitle">@{profile.username || 'onagui'}</p>

                  <div className="bc-host-info">
                    <span>Giveaways hosted</span>
                    <span className="bc-host-name">{profile.giveawaysHosted}</span>
                  </div>

                  <div className="bc-metric-row">
                    <div>
                      <div className="bc-metric-label">Followers</div>
                      <div className="bc-metric-value">{profile.followers.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="bc-metric-label">Total entries</div>
                      <div className="bc-metric-value">{profile.totalEntries.toLocaleString()}</div>
                    </div>
                  </div>

                  <button className="bc-action-button">
                    <span>VIEW PROFILE</span>
                    <div className="bc-btn-glow"></div>
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