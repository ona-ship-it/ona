'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import LikeSaveButtons from '@/components/LikeSaveButtons'

type Fundraiser = {
  id: string
  title: string
  cover_image: string | null
  category: string | null
  goal_amount: number
  raised_amount: number
  currency: string
  total_donors: number
  status: string
  created_at: string | null
}

const CATEGORIES = [
  'All', 'Medical', 'Emergency', 'Education', 'Memorial',
  'Animals & Pets', 'Community', 'Sports', 'Creative', 'Other',
]

const SORT_OPTIONS = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'trending', label: '📈 Trending' },
  { id: 'biggest', label: 'Biggest Goals' },
]

const FALLBACK = 'https://placehold.co/400x200/1a1f2e/00ff88?text=Campaign'

export default function FundraisePage() {
  const supabase = createClient()
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSort, setActiveSort] = useState('recent')
  const [stats, setStats] = useState({ raised: 0, campaigns: 0, donors: 0 })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('fundraisers')
        .select('id, title, cover_image, category, goal_amount, raised_amount, currency, total_donors, status, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)
      const list = data || []
      setFundraisers(list)
      setStats({
        raised: list.reduce((sum, f) => sum + (f.raised_amount || 0), 0),
        campaigns: list.length,
        donors: list.reduce((sum, f) => sum + (f.total_donors || 0), 0),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = fundraisers
    .filter(f => activeCategory === 'All' || f.category === activeCategory)
    .sort((a, b) => {
      if (activeSort === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      if (activeSort === 'trending') return (b.total_donors || 0) - (a.total_donors || 0)
      if (activeSort === 'biggest') return (b.goal_amount || 0) - (a.goal_amount || 0)
      return 0
    })

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            Fundraise with Crypto
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 560 }}>
            The #1 platform for crypto crowdfunding. Start a campaign, raise money, change lives.
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
            <Link
              href="/fundraise/create"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-green)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
            >
              + Start a Campaign
            </Link>
            <button
              onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--accent-blue)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
            >
              Browse Campaigns
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)' }}>
                ${stats.raised.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Raised in Crypto</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)' }}>
                {stats.campaigns}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Campaigns Funded</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)' }}>
                {stats.donors}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Generous Donors</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Campaigns ─────────────────────────────────────────────────── */}
      <div id="campaigns" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: activeCategory === cat ? 'var(--accent-green)' : 'var(--bg-secondary)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setActiveSort(opt.id)}
              style={{
                padding: '10px 16px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                border: activeSort === opt.id ? '1px solid var(--accent-blue)' : '1px solid transparent',
                borderRadius: 8, background: 'transparent',
                color: activeSort === opt.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="items-grid">
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ height: 160, background: 'var(--bg-tertiary)' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 16, background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 12, background: 'var(--bg-tertiary)', borderRadius: 4, width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            No campaigns found.
          </div>
        ) : (
          <div className="items-grid">
            {filtered.map(campaign => {
              const progress = campaign.goal_amount > 0
                ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
                : 0
              const currency = campaign.currency === 'USD' ? '$' : campaign.currency
              return (
                <Link
                  key={campaign.id}
                  href={'/fundraise/' + campaign.id}
                  style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)', textDecoration: 'none', display: 'block' }}
                >
                  {/* Image */}
                  <div className="card-img">
                    <Image
                      src={campaign.cover_image || FALLBACK}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                    <span className="card-badge">{campaign.category || 'Fundraise'}</span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {campaign.title}
                    </h3>

                    <div
                      onClick={e => { e.preventDefault(); e.stopPropagation() }}
                      style={{ marginBottom: 12 }}
                    >
                      <LikeSaveButtons postId={campaign.id} postType="fundraiser" showCount={false} size="sm" />
                    </div>

                    {/* Raised */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Raised</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-green)' }}>
                        {currency}{campaign.raised_amount.toLocaleString()}
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        <span>{Math.round(progress)}%</span>
                        <span>{campaign.total_donors} donors</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                        <div style={{ height: '100%', borderRadius: 999, background: 'var(--accent-green)', width: progress + '%', transition: 'width 0.5s' }} />
                      </div>
                    </div>

                    <button style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: 'var(--accent-green)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                      Donate Now
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
