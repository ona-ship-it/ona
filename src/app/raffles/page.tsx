'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'
import RaffleCard from '@/components/RaffleCard'

type Raffle = {
  id: string
  title: string
  description: string
  images: string[]
  image_urls?: string[]
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  ticket_price: number
  base_ticket_price?: number
  max_per_user: number
  is_powered_by_onagui?: boolean
  status: string
  end_date: string
  creator_id: string
  creator_name?: string
  creator_avatar?: string | null
  creator_verified?: boolean
  created_at: string
}

/* ── SVG Icons (no emojis) ── */
const TicketIcon = ({ size = 20, color = '#067a0d' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v0a3 3 0 01-3 3v0a3 3 0 013 3v0a3 3 0 01-3 3H5a3 3 0 01-3-3v0a3 3 0 013-3v0a3 3 0 01-3-3z"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#067a0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fd8312" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 22V2h4v20"/><path d="M8 22h8"/>
  </svg>
)

function getTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

export default function RafflesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [filter, setFilter] = useState<'all' | 'featured'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRaffles()
  }, [filter])

  async function fetchRaffles() {
    setLoading(true)
    try {
      let query = supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')

      if (filter === 'featured') {
        query = query.eq('is_powered_by_onagui', true)
      }

      const { data: rafflesData, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Enrich with creator profiles
      const enrichedRaffles = await Promise.all(
        (rafflesData || []).map(async (raffle) => {
          let creatorName = 'ONAGUI'
          let creatorAvatar = null
          let creatorVerified = false

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', raffle.creator_id)
              .single()

            if (profile) {
              creatorName = profile.full_name || 'ONAGUI'
              creatorAvatar = profile.avatar_url
            }
          } catch (e) {
            // Profile fetch failed, use defaults
          }

          return {
            ...raffle,
            // Normalize column names (support both old and new schema)
            images: raffle.images || raffle.image_urls || [],
            ticket_price: raffle.ticket_price || raffle.base_ticket_price || 1,
            max_per_user: raffle.max_per_user || 1100,
            end_date: raffle.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            creator_name: creatorName,
            creator_avatar: creatorAvatar,
            creator_verified: creatorVerified,
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
    (raffle.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ background: '#0a1929' }}>
      <Header />

      {/* Hero */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(6,122,13,0.06) 0%, transparent 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6,122,13,0.1)', padding: '6px 16px', borderRadius: 99, marginBottom: 16, border: '1px solid rgba(6,122,13,0.2)' }}>
            <TicketIcon size={16} color="#067a0d" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#067a0d', letterSpacing: 0.5 }}>ONAGUI RAFFLES</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f8fafc', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>
            Active Raffles
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
            Buy tickets, win amazing prizes. Every ticket counts. Provably fair draws via Chainlink VRF.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search raffles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: filter === 'all' ? '#067a0d' : '#1e293b',
              color: filter === 'all' ? '#fff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            All Raffles
          </button>
          <button
            onClick={() => setFilter('featured')}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: filter === 'featured' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              background: filter === 'featured' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#1e293b',
              color: filter === 'featured' ? '#fff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <BoltIcon /> Powered by Onagui
          </button>
          <Link
            href="/create-raffle"
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #2be937, #067a0d)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 15px rgba(6,122,13,0.3)',
            }}
          >
            <PlusIcon /> Create Raffle
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div style={{ width: 48, height: 48, border: '3px solid rgba(6,122,13,0.2)', borderTop: '3px solid #067a0d', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading raffles...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredRaffles.length === 0 && (
          <div className="text-center py-20">
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(6,122,13,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <TicketIcon size={32} color="#067a0d" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>No Raffles Found</h3>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>Be the first to create a raffle!</p>
            <Link
              href="/create-raffle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #2be937, #067a0d)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                boxShadow: '0 4px 15px rgba(6,122,13,0.3)',
              }}
            >
              <PlusIcon /> Create Raffle
            </Link>
          </div>
        )}

        {/* Raffles Grid */}
        {!loading && filteredRaffles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRaffles.map((raffle) => (
              <RaffleCard
                key={raffle.id}
                id={raffle.id}
                title={raffle.title}
                description={raffle.description}
                image_url={raffle.images?.[0] || null}
                prize_value={raffle.prize_value}
                total_tickets={raffle.total_tickets}
                tickets_sold={raffle.tickets_sold}
                time_remaining={getTimeRemaining(raffle.end_date)}
                photo_count={raffle.images?.length || 1}
                max_per_user={raffle.max_per_user}
                creator={{
                  full_name: raffle.creator_name,
                  avatar_url: raffle.creator_avatar,
                  subscriber_count: 0,
                }}
                is_verified={raffle.creator_verified || false}
              />
            ))}
          </div>
        )}

        {/* How It Works */}
        <div style={{
          marginTop: 64,
          padding: 32,
          background: '#1e293b',
          border: '1px solid rgba(6,122,13,0.15)',
          borderRadius: 20,
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 24, textAlign: 'center' }}>
            How Onagui Raffles Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(6,122,13,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <TicketIcon size={24} color="#067a0d" />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Buy Tickets</h4>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Each ticket costs 1 USDC. More tickets, better odds. Max 1% of supply per user.</p>
            </div>
            <div className="text-center">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ClockIcon />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Wait for Draw</h4>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>When tickets sell out or time runs out, a winner is drawn via Chainlink VRF. Always a winner.</p>
            </div>
            <div className="text-center">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(253,131,18,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <TrophyIcon />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Win Prize</h4>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Winner completes KYC, then chooses: receive the actual prize or a USDC cash alternative.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
