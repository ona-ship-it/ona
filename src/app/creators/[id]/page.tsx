'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Creator = {
  id: string
  user_id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  cover_image_url: string | null
  verification_level: string
  country: string | null
  city: string | null
  total_raffles_created: number
  total_raffles_completed: number
  total_funds_raised: number
  follower_count: number
  average_rating: number
  total_reviews: number
  successful_completion_rate: number
  average_delivery_days: number
  badges: any
  website: string | null
  twitter: string | null
  instagram: string | null
  tier: string
}

type Raffle = {
  id: string
  title: string
  emoji: string
  prize_value: number
  prize_currency: string
  tickets_sold: number
  total_tickets: number
  status: string
  is_powered_by_onagui: boolean
}

export default function CreatorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [user, setUser] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchCreator()
  }, [params.id])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      checkIfFollowing(session.user.id)
    }
  }

  async function checkIfFollowing(userId: string) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', params.id)
      .single()
    
    setIsFollowing(!!data)
  }

  async function fetchCreator() {
    try {
      const { data: creatorData, error } = await supabase
        .from('creator_profiles')
        .select('id, user_id, display_name, bio, avatar_url, cover_image_url, verification_level, country, city, total_raffles_created, total_raffles_completed, total_funds_raised, follower_count, average_rating, total_reviews, successful_completion_rate, average_delivery_days, badges, website, twitter, instagram, tier')
        .eq('user_id', params.id)
        .single()

      if (error || !creatorData) {
        router.push('/raffles')
        return
      }

      setCreator(creatorData)

      // Fetch creator's raffles
      const { data: rafflesData } = await supabase
        .from('raffles')
        .select('id, title, emoji, prize_value, prize_currency, tickets_sold, total_tickets, status, is_powered_by_onagui')
        .eq('creator_id', params.id)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(6)

      setRaffles(rafflesData || [])
    } catch (error) {
      console.error('Error fetching creator:', error)
      router.push('/raffles')
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow() {
    if (!user) {
      router.push('/login')
      return
    }

    setFollowLoading(true)

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', params.id)
        setIsFollowing(false)
      } else {
        await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: params.id as string
        })
        setIsFollowing(true)
      }

      // Refresh creator to update follower count
      await fetchCreator()
    } catch (error) {
      console.error('Error following:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const getVerificationBadge = () => {
    if (!creator) return null
    
    switch (creator.verification_level) {
      case 'basic':
        return <span className="text-blue-400" title="Basic Verified">✓</span>
      case 'business':
        return <span className="text-blue-400" title="Business Verified">✓✓</span>
      case 'premium':
        return <span className="text-yellow-400" title="Premium Verified">✓✓✓</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-2xl font-bold text-white mb-2">Creator Not Found</h3>
          <Link href="/raffles" className="text-blue-400 hover:underline">
            Back to Raffles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/raffles" className="text-blue-400 hover:text-blue-300 font-semibold">
              ← Back to Raffles
            </Link>
            <Link href="/">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-900 to-cyan-900">
        {creator.cover_image_url && (
          <Image
            src={creator.cover_image_url}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-20 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
            <div className="flex items-start gap-6 flex-wrap">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-5xl border-4 border-slate-900">
                  {creator.avatar_url ? (
                    <Image
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      width={128}
                      height={128}
                      className="rounded-full"
                    />
                  ) : (
                    creator.display_name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black text-white">{creator.display_name}</h2>
                  {getVerificationBadge()}
                </div>

                {creator.bio && (
                  <p className="text-slate-300 mb-4 max-w-2xl">{creator.bio}</p>
                )}

                <div className="flex items-center gap-6 text-sm">
                  {creator.country && (
                    <span className="text-slate-400">📍 {creator.country}</span>
                  )}
                  <span className="text-slate-400">
                    👥 {creator.follower_count} followers
                  </span>
                  <span className="text-slate-400">
                    🎟️ {creator.total_raffles_completed} raffles completed
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-4">
                  {creator.website && (
                    <a
                      href={creator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
                    >
                      🌐 Website
                    </a>
                  )}
                  {creator.twitter && (
                    <a
                      href={`https://twitter.com/${creator.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
                    >
                      🐦 Twitter
                    </a>
                  )}
                  {creator.instagram && (
                    <a
                      href={`https://instagram.com/${creator.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
                    >
                      📷 Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={handleFollow}
                disabled={followLoading || !user}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  isFollowing
                    ? 'bg-slate-700 text-white hover:bg-slate-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
            <div className="text-sm text-slate-400 mb-2">Total Raised</div>
            <div className="text-3xl font-black text-green-400">
              ${creator.total_funds_raised.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
            <div className="text-sm text-slate-400 mb-2">Rating</div>
            <div className="text-3xl font-black text-yellow-400">
              ⭐ {creator.average_rating.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">{creator.total_reviews} reviews</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
            <div className="text-sm text-slate-400 mb-2">Success Rate</div>
            <div className="text-3xl font-black text-blue-400">
              {creator.successful_completion_rate.toFixed(0)}%
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
            <div className="text-sm text-slate-400 mb-2">Avg Delivery</div>
            <div className="text-3xl font-black text-purple-400">
              {creator.average_delivery_days} days
            </div>
          </div>
        </div>

        {/* Raffles */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Active & Completed Raffles</h3>

          {raffles.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🎟️</div>
              <p className="text-slate-400">No raffles yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle) => (
                <Link
                  key={raffle.id}
                  href={`/raffles/${raffle.id}`}
                  className="group"
                >
                  <div className={`bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6 transition-all group-hover:scale-105 group-hover:border-blue-500 ${
                    raffle.is_powered_by_onagui ? 'relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-yellow-500/20 before:to-orange-500/20 before:blur-xl' : ''
                  }`}>
                    {raffle.is_powered_by_onagui && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
                        ⚡ Onagui
                      </div>
                    )}

                    <div className="text-6xl mb-4 text-center">{raffle.emoji}</div>
                    <h4 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {raffle.title}
                    </h4>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-yellow-400 font-bold">
                        ${raffle.prize_value.toLocaleString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        raffle.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {raffle.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {raffle.tickets_sold} / {raffle.total_tickets} sold
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
