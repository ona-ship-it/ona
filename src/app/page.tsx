'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import { TrendingUp, CheckCircle, Star, ShoppingCart } from 'lucide-react'

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
  creator_id?: string | null
  creator_name?: string | null
  creator_avatar_url?: string | null
  paid_ticket_count?: number
  paid_ticket_revenue?: number
  prize_boost?: number
  onagui_subs?: number
}

type Raffle = {
  id: string
  title: string
  emoji: string
  prize_value: number
  tickets_sold: number
  total_tickets: number
  base_ticket_price: number
  status: string
}

type MarketplaceListing = {
  id: string
  title: string
  description: string | null
  price: number
  currency: string
  category: string | null
  image_url: string | null
  seller_id: string | null
  seller_name: string | null
  views: number
  sales: number
  created_at: string | null
}

type TopProfile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string | null
  giveawaysHosted: number
  totalEntries: number
  followers: number
}

export default function HomePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [analyticsSessionId, setAnalyticsSessionId] = useState<string | null>(null)
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([])
  const [topProfiles, setTopProfiles] = useState<TopProfile[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let sessionId = window.localStorage.getItem('onagui_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      window.localStorage.setItem('onagui_session_id', sessionId)
    }
    setAnalyticsSessionId(sessionId)
    trackEvent('landing_view', undefined, undefined, { page: 'home' }, sessionId)
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch top 4 giveaways
      const { data: giveawaysData } = await supabase
        .from('giveaways')
        .select('*')
        .eq('status', 'active')
        .order('tickets_sold', { ascending: false })
        .limit(4)

      // Fetch top 4 raffles
      const { data: rafflesData } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .order('tickets_sold', { ascending: false })
        .limit(4)

      const { data: paidTickets, error: paidTicketsError } = await supabase
        .from('tickets')
        .select('giveaway_id, quantity')
        .eq('is_free', false)

      if (paidTicketsError) {
        console.error('Error fetching paid tickets:', paidTicketsError)
      }

      const paidTicketCounts = new Map<string, number>()
      ;(paidTickets || []).forEach((ticket) => {
        if (!ticket.giveaway_id) return
        paidTicketCounts.set(
          ticket.giveaway_id,
          (paidTicketCounts.get(ticket.giveaway_id) || 0) + (ticket.quantity || 1)
        )
      })

      const giveawayCreatorIds = (giveawaysData || [])
        .map((giveaway) => giveaway.creator_id)
        .filter((id): id is string => !!id)

      let giveawayCreators: { id: string; username: string | null; full_name: string | null; avatar_url: string | null }[] = []
      if (giveawayCreatorIds.length > 0) {
        const { data: creators, error: creatorsError } = await supabase
          .from('onagui_profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', giveawayCreatorIds)

        if (creatorsError) {
          console.error('Error fetching giveaway creators:', creatorsError)
        } else {
          giveawayCreators = creators || []
        }
      }

      const { data: marketplaceData, error: marketplaceError } = await supabase
        .from('marketplace_listings')
        .select('id, title, description, price, currency, category, image_url, seller_id, views, sales, created_at')
        .eq('status', 'active')
        .order('views', { ascending: false })
        .limit(4)

      if (marketplaceError) {
        console.error('Error fetching marketplace listings:', marketplaceError)
      }

      const sellerIds = (marketplaceData || [])
        .map((listing) => listing.seller_id)
        .filter((id): id is string => !!id)

      let sellersData: { id: string; username: string | null; full_name: string | null }[] = []
      if (sellerIds.length > 0) {
        const { data: sellers, error: sellersError } = await supabase
          .from('onagui_profiles')
          .select('id, username, full_name')
          .in('id', sellerIds)

        if (sellersError) {
          console.error('Error fetching marketplace sellers:', sellersError)
        } else {
          sellersData = sellers || []
        }
      }

      const enrichedMarketplace = (marketplaceData || []).map((listing) => {
        const seller = sellersData.find((item) => item.id === listing.seller_id)
        return {
          ...listing,
          seller_name: seller?.full_name || seller?.username || null
        }
      })

      const { data: followerRows, error: followerError } = await supabase
        .from('profile_followers')
        .select('profile_id')
        .limit(1000)

      if (followerError) {
        console.error('Error fetching follower data:', followerError)
      }

      const followerCounts = new Map<string, number>()
      ;(followerRows || []).forEach((row) => {
        if (!row.profile_id) return
        followerCounts.set(row.profile_id, (followerCounts.get(row.profile_id) || 0) + 1)
      })

      const { data: creatorGiveaways, error: creatorGiveawaysError } = await supabase
        .from('giveaways')
        .select('creator_id, tickets_sold')
        .eq('status', 'active')
        .limit(200)

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

      const rankedByFollowers = [...followerCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id]) => id)

      const rankedByEntries = [...creatorStats.entries()]
        .sort((a, b) => b[1].totalEntries - a[1].totalEntries)
        .slice(0, 4)
        .map(([id]) => id)

      const topProfileIds = rankedByFollowers.length > 0 ? rankedByFollowers : rankedByEntries

      let profilesData: { id: string; username: string | null; full_name: string | null; avatar_url: string | null; created_at: string | null }[] = []
      if (topProfileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('onagui_profiles')
          .select('id, username, full_name, avatar_url, created_at')
          .in('id', topProfileIds)

        if (profilesError) {
          console.error('Error fetching top profiles:', profilesError)
        } else {
          profilesData = profiles || []
        }
      }

      const rankedProfiles = topProfileIds
        .map((id) => {
          const profile = profilesData.find((item) => item.id === id)
          const stats = creatorStats.get(id)
          const followers = followerCounts.get(id) || 0
          if (!profile) return null
          return {
            ...profile,
            giveawaysHosted: stats?.giveawaysHosted || 0,
            totalEntries: stats?.totalEntries || 0,
            followers
          }
        })
        .filter((profile): profile is TopProfile => !!profile)

      const enrichedGiveaways = (giveawaysData || []).map((giveaway) => {
        const ticketPrice = giveaway.ticket_price || 0
        const paidCount = paidTicketCounts.get(giveaway.id) || 0
        const paidRevenue = paidCount * ticketPrice
        const creator = giveawayCreators.find((item) => item.id === giveaway.creator_id)
        return {
          ...giveaway,
          paid_ticket_count: paidCount,
          paid_ticket_revenue: paidRevenue,
          prize_boost: paidRevenue * 0.4,
          onagui_subs: paidRevenue * 0.1,
          creator_name: creator?.full_name || creator?.username || null,
          creator_avatar_url: creator?.avatar_url || null,
        }
      })

      setGiveaways(enrichedGiveaways)
      setRaffles(rafflesData || [])
      setMarketplaceListings(enrichedMarketplace)
      setTopProfiles(rankedProfiles)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for marketplace (TODO: Remove when real data is ready)
  const mockMarketplace = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1696446702403-69e5f8ab97ec?w=400',
      category: 'Electronics',
      seller: 'TechStore'
    },
    {
      id: '2',
      title: 'Sony PS5 Console',
      price: 499,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
      category: 'Gaming',
      seller: 'GameHub'
    },
    {
      id: '3',
      title: 'MacBook Pro M3',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      category: 'Computers',
      seller: 'AppleStore'
    },
    {
      id: '4',
      title: 'AirPods Pro 2',
      price: 249,
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      category: 'Audio',
      seller: 'AudioTech'
    }
  ]

  const marketplaceItems: MarketplaceListing[] = marketplaceListings.length > 0
    ? marketplaceListings
    : mockMarketplace.map((item) => ({
        id: item.id,
        title: item.title,
        description: null,
        price: item.price,
        currency: 'USD',
        category: item.category,
        image_url: item.image,
        seller_id: null,
        seller_name: item.seller,
        views: 0,
        sales: 0,
        created_at: null,
      }))

  // Mock data for fundraise (TODO: Remove when real data is ready)
  const mockFundraise = [
    {
      id: '1',
      title: 'Help Build Clean Water Wells in Africa',
      raised: 45000,
      goal: 100000,
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
      category: 'Charity',
      donors: 1234
    },
    {
      id: '2',
      title: 'Support Local Animal Shelter',
      raised: 12500,
      goal: 25000,
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
      category: 'Animals',
      donors: 543
    },
    {
      id: '3',
      title: 'Medical Treatment for Children',
      raised: 67000,
      goal: 80000,
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400',
      category: 'Medical',
      donors: 2156
    },
    {
      id: '4',
      title: 'Education Fund for Underprivileged Kids',
      raised: 33000,
      goal: 50000,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      category: 'Education',
      donors: 876
    }
  ]

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

  const getRatingData = (seed: string) => {
    let hash = 0
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }

    const rating = 4.3 + (hash % 70) / 100
    const count = 50 + (hash % 200)

    return {
      rating: rating.toFixed(1),
      count
    }
  }

  const getGiveawayHighlight = (giveaway: Giveaway) => {
    const endTime = new Date(giveaway.end_date).getTime()
    const hoursLeft = (endTime - Date.now()) / (1000 * 60 * 60)
    if (hoursLeft > 0 && hoursLeft <= 24) return 'Ending Soon'
    if (giveaway.total_tickets > 0 && giveaway.tickets_sold / giveaway.total_tickets >= 0.7) return 'Most Entered'
    return 'Hot Right Now'
  }

  const getRaffleHighlight = (raffle: Raffle) => {
    if (raffle.total_tickets > 0 && raffle.tickets_sold / raffle.total_tickets >= 0.8) return 'Almost Sold Out'
    if (raffle.total_tickets > 0 && raffle.tickets_sold / raffle.total_tickets >= 0.5) return 'Popular Raffle'
    return 'New Raffle'
  }

  const getMarketplaceHighlight = (listing: MarketplaceListing) => {
    if (listing.sales >= 50) return 'Best Seller'
    if (listing.views >= 1000) return 'Most Viewed'
    return 'New Listing'
  }

  const getProfileHighlight = (profile: TopProfile) => {
    if (profile.followers >= 1000) return 'Most Followed'
    if (profile.totalEntries >= 10000) return 'Top Entries'
    return 'Top Creator'
  }

  const raffleFallbackImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop'
  const profileFallbackImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop'

  const trackEvent = (
    eventType: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
    sessionOverride?: string | null
  ) => {
    const sessionId = sessionOverride ?? analyticsSessionId
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        entityType,
        entityId,
        sessionId,
        metadata,
      }),
    }).catch((error) => {
      console.error('Analytics tracking error:', error)
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      <Header />
      
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        
        {/* ROW 1: POPULAR GIVEAWAYS */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Popular Giveaways
            </h2>
            <Link 
              href="/giveaways" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {giveaways.map((giveaway) => (
              <Link
                key={giveaway.id}
                href={`/giveaways/${giveaway.id}`}
                className="bc-game-card group"
                onClick={() => trackEvent('card_click', 'giveaway', giveaway.id)}
              >
                {/* Image */}
                <div className="bc-card-image-wrapper">
                  {giveaway.image_url ? (
                    <Image
                      src={giveaway.image_url}
                      alt={giveaway.title}
                      fill
                      className="bc-card-image"
                    />
                  ) : (
                    <Image
                      src={raffleFallbackImage}
                      alt={giveaway.title}
                      fill
                      className="bc-card-image"
                    />
                  )}

                  <div className="bc-image-overlay"></div>

                  {giveaway.tickets_sold > 5000 && (
                    <div className="bc-trending-badge">
                      <TrendingUp size={14} />
                      <span>TRENDING</span>
                    </div>
                  )}

                  <div className="bc-verified-icon">
                    <CheckCircle size={20} fill="#00d4d4" stroke="#0f1419" />
                  </div>

                  <div className="bc-condition-tag">GIVEAWAY</div>
                </div>

                {/* Content */}
                <div className="bc-card-body">
                  <div className="bc-rating-row">
                    <div className="bc-rating-display">
                      <Star size={12} fill="#ff8800" stroke="none" />
                      <span className="rating-value">
                        {getRatingData(giveaway.id).rating}
                      </span>
                      <span className="rating-count">
                        ({getRatingData(giveaway.id).count})
                      </span>
                    </div>
                  </div>

                  <div className="bc-highlight">{getGiveawayHighlight(giveaway)}</div>

                  <div className="bc-title-row">
                    <div className="bc-creator-column">
                      <Image
                        src={giveaway.creator_avatar_url || profileFallbackImage}
                        alt={giveaway.creator_name || 'Creator'}
                        width={32}
                        height={32}
                        className="bc-creator-avatar"
                      />
                      <span className="bc-subs-badge">
                        {Math.round(giveaway.onagui_subs || 0)} subs
                      </span>
                    </div>
                    <div className="bc-title-stack">
                      <h3 className="bc-card-title">{giveaway.title}</h3>
                      <p className="bc-card-subtitle">
                        {giveaway.description?.substring(0, 50) || 'Exclusive giveaway'}...
                      </p>
                    </div>
                  </div>

                  <div className="bc-host-info">
                    <span>by</span>
                    <span className="bc-host-name">{giveaway.creator_name || 'ONAGUI'}</span>
                  </div>

                  <div className="bc-price-section">
                    <div className="bc-price-display">
                      <span className="bc-currency">{giveaway.prize_currency === 'USD' ? '$' : giveaway.prize_currency}</span>
                      <span className="bc-price-value">
                        {giveaway.prize_value.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bc-prize-progression">
                    <span>Prize boost</span>
                    <div className="bc-progression-values">
                      <span>
                        {giveaway.prize_currency === 'USD' ? '$' : giveaway.prize_currency}
                        {giveaway.prize_value.toLocaleString()}
                      </span>
                      <span className="bc-progression-arrow">→</span>
                      <span>
                        {giveaway.prize_currency === 'USD' ? '$' : giveaway.prize_currency}
                        {(giveaway.prize_value + (giveaway.prize_boost || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bc-action-stack">
                    <button
                      className="bc-action-button"
                      onClick={() => trackEvent('cta_click', 'giveaway', giveaway.id, { cta: 'claim_free_ticket' })}
                    >
                      <ShoppingCart size={16} />
                      <span>CLAIM FREE TICKET</span>
                      <div className="bc-btn-glow"></div>
                    </button>
                    <button
                      className="bc-action-secondary"
                      onClick={() => trackEvent('cta_click', 'giveaway', giveaway.id, { cta: 'buy_ticket_1usdc' })}
                    >
                      BUY TICKET 1 USDC
                    </button>
                    <div className="bc-action-note">1 chance per user</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 2: POPULAR RAFFLES */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Popular Raffles
            </h2>
            <Link 
              href="/raffles" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {raffles.map((raffle) => (
              <Link
                key={raffle.id}
                href={`/raffles/${raffle.id}`}
                className="bc-game-card group"
                onClick={() => trackEvent('card_click', 'raffle', raffle.id)}
              >
                {/* Image */}
                <div className="bc-card-image-wrapper">
                  <Image
                    src={raffleFallbackImage}
                    alt={raffle.title}
                    fill
                    className="bc-card-image"
                  />

                  <div className="bc-image-overlay"></div>

                  {raffle.tickets_sold > 2500 && (
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
                      <span className="rating-value">
                        {getRatingData(raffle.id).rating}
                      </span>
                      <span className="rating-count">
                        ({getRatingData(raffle.id).count})
                      </span>
                    </div>
                  </div>

                  <div className="bc-highlight">{getRaffleHighlight(raffle)}</div>

                  <h3 className="bc-card-title">{raffle.title}</h3>

                  <p className="bc-card-subtitle">
                    {raffle.tickets_sold} of {raffle.total_tickets} tickets sold
                  </p>

                  <div className="bc-host-info">
                    <span>by</span>
                    <span className="bc-host-name">ONAGUI</span>
                  </div>

                  <div className="bc-price-section">
                    <div className="bc-price-display">
                      <span className="bc-currency">$</span>
                      <span className="bc-price-value">
                        {raffle.prize_value.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button className="bc-action-button">
                    <ShoppingCart size={16} />
                    <span>BUY TICKET</span>
                    <div className="bc-btn-glow"></div>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 3: MARKETPLACE (MOCK DATA - TODO: REMOVE) */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Marketplace
            </h2>
            <Link 
              href="/marketplace" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {marketplaceItems.map((item) => (
              <Link
                key={item.id}
                href={`/marketplace/${item.id}`}
                className="bc-game-card group"
                onClick={() => trackEvent('card_click', 'marketplace', item.id)}
              >
                {/* Image */}
                <div className="bc-card-image-wrapper">
                  <Image
                    src={item.image_url || raffleFallbackImage}
                    alt={item.title}
                    fill
                    className="bc-card-image"
                  />

                  <div className="bc-image-overlay"></div>

                  {item.price > 1000 && (
                    <div className="bc-trending-badge">
                      <TrendingUp size={14} />
                      <span>TRENDING</span>
                    </div>
                  )}

                  <div className="bc-verified-icon">
                    <CheckCircle size={20} fill="#00d4d4" stroke="#0f1419" />
                  </div>

                  <div className="bc-condition-tag">MARKETPLACE</div>
                </div>

                {/* Content */}
                <div className="bc-card-body">
                  <div className="bc-rating-row">
                    <div className="bc-rating-display">
                      <Star size={12} fill="#ff8800" stroke="none" />
                      <span className="rating-value">
                        {getRatingData(item.id).rating}
                      </span>
                      <span className="rating-count">
                        ({getRatingData(item.id).count})
                      </span>
                    </div>
                  </div>

                  <div className="bc-highlight">{getMarketplaceHighlight(item)}</div>

                  <h3 className="bc-card-title">{item.title}</h3>

                  <p className="bc-card-subtitle">
                    {item.category || 'Marketplace'} listing by {item.seller_name || 'Onagui Seller'}
                  </p>

                  <div className="bc-host-info">
                    <span>by</span>
                    <span className="bc-host-name">{item.seller_name || 'Onagui Seller'}</span>
                  </div>

                  <div className="bc-price-section">
                    <div className="bc-price-display">
                      <span className="bc-currency">$</span>
                      <span className="bc-price-value">
                        {item.currency === 'USD' ? item.price.toLocaleString() : `${item.price}`}
                      </span>
                    </div>
                  </div>

                  <button className="bc-action-button">
                    <ShoppingCart size={16} />
                    <span>BUY NOW</span>
                    <div className="bc-btn-glow"></div>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 4: FUNDRAISE (MOCK DATA - TODO: REMOVE) */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Fundraising Campaigns
            </h2>
            <Link 
              href="/fundraise" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {mockFundraise.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/fundraise/${campaign.id}`}
                className="card group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-lg" style={{ background: 'var(--tertiary-bg)' }}>
                  <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
                  
                  {/* Category Badge */}
                  <div 
                    className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(11, 14, 17, 0.8)', color: 'var(--accent-green)' }}
                  >
                    {campaign.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity text-sm" style={{ color: 'var(--text-primary)' }}>
                    {campaign.title}
                  </h3>

                  {/* Raised Amount */}
                  <div className="mb-3">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Raised
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                      ${campaign.raised.toLocaleString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>{Math.round((campaign.raised / campaign.goal) * 100)}%</span>
                      <span>{campaign.donors} donors</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tertiary-bg)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(campaign.raised / campaign.goal) * 100}%`,
                          background: 'var(--accent-green)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button 
                    className="w-full py-2.5 rounded-md text-sm font-semibold transition-all"
                    style={{ 
                      background: 'var(--accent-green)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Donate Now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 5: TOP PROFILES */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Most Popular Profiles
            </h2>
            <Link
              href="/profiles"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {topProfiles.map((profile) => (
              <Link
                key={profile.id}
                href="/profiles"
                className="bc-game-card group"
                onClick={() => trackEvent('card_click', 'profile', profile.id)}
              >
                <div className="bc-card-image-wrapper">
                  <Image
                    src={profile.avatar_url || profileFallbackImage}
                    alt={profile.full_name || profile.username || 'Profile'}
                    fill
                    className="bc-card-image"
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

                <div className="bc-card-body">
                  <div className="bc-highlight">{getProfileHighlight(profile)}</div>
                  <h3 className="bc-card-title">
                    {profile.full_name || profile.username || 'Onagui Creator'}
                  </h3>

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
        </div>

      </div>
    </div>
  )
}
