'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface ProfileData {
  full_name: string
  phone_number: string
  avatar_url: string | null
}

interface WalletData {
  usdc_balance: number
  eth_balance: number
  matic_balance: number
}

interface GiveawayStats {
  totalGiveaways: number
  activeGiveaways: number
}

interface TicketStats {
  totalEntries: number
  totalWins: number
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [giveawayStats, setGiveawayStats] = useState<GiveawayStats>({
    totalGiveaways: 0,
    activeGiveaways: 0,
  })
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    totalEntries: 0,
    totalWins: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfileData(profileData)
        }

        // Fetch wallet data
        const { data: walletData } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (walletData) {
          setWalletData(walletData)
        }

        // Fetch giveaway stats
        const { data: giveawaysData } = await supabase
          .from('giveaways')
          .select('status')
          .eq('creator_id', user.id)

        if (giveawaysData) {
          const total = giveawaysData.length
          const active = giveawaysData.filter((g) => g.status === 'active').length
          setGiveawayStats({
            totalGiveaways: total,
            activeGiveaways: active,
          })
        }

        // Fetch ticket stats
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('won')
          .eq('user_id', user.id)

        if (ticketsData) {
          const total = ticketsData.length
          const wins = ticketsData.filter((t) => t.won).length
          setTicketStats({
            totalEntries: total,
            totalWins: wins,
          })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, supabase, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-blue-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const initials = profileData?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            ONAGUI
          </Link>
          <button
            onClick={() => {
              supabase.auth.signOut()
              router.push('/')
            }}
            className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-500/50"
          >
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="mb-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {profileData?.full_name || 'User'}
              </h1>
              <p className="text-slate-400 text-lg mb-4">{user.email}</p>
              {profileData?.phone_number && (
                <p className="text-slate-400">{profileData.phone_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Giveaways */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Giveaways</p>
            <p className="text-4xl font-bold text-blue-400">
              {giveawayStats.totalGiveaways}
            </p>
          </div>

          {/* Active Giveaways */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">Active Giveaways</p>
            <p className="text-4xl font-bold text-cyan-400">
              {giveawayStats.activeGiveaways}
            </p>
          </div>

          {/* Total Entries */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Entries</p>
            <p className="text-4xl font-bold text-purple-400">
              {ticketStats.totalEntries}
            </p>
          </div>

          {/* Total Wins */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Wins</p>
            <p className="text-4xl font-bold text-green-400">
              {ticketStats.totalWins}
            </p>
          </div>
        </div>

        {/* Wallet Section */}
        {walletData && (
          <div className="mb-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Wallet</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* USDC Balance */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/20 border border-slate-700 rounded-2xl p-6">
                <p className="text-slate-400 text-sm mb-2">USDC Balance</p>
                <p className="text-3xl font-bold text-white">
                  ${walletData.usdc_balance.toFixed(2)}
                </p>
                <p className="text-slate-500 text-xs mt-2">USD Coin</p>
              </div>

              {/* ETH Balance */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/20 border border-slate-700 rounded-2xl p-6">
                <p className="text-slate-400 text-sm mb-2">ETH Balance</p>
                <p className="text-3xl font-bold text-white">
                  {walletData.eth_balance.toFixed(4)}
                </p>
                <p className="text-slate-500 text-xs mt-2">Ethereum</p>
              </div>

              {/* MATIC Balance */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/20 border border-slate-700 rounded-2xl p-6">
                <p className="text-slate-400 text-sm mb-2">MATIC Balance</p>
                <p className="text-3xl font-bold text-white">
                  {walletData.matic_balance.toFixed(4)}
                </p>
                <p className="text-slate-500 text-xs mt-2">Polygon</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/giveaways/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 px-8 rounded-2xl transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 text-center flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Giveaway
          </Link>

          <Link
            href="/giveaways"
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-6 px-8 rounded-2xl transition-all shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/50 text-center flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Giveaways
          </Link>
        </div>
      </div>
    </div>
  )
}
