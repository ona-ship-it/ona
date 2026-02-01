'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [stats, setStats] = useState({
    // Giveaways
    totalGiveaways: 0,
    activeGiveaways: 0,
    totalEntries: 0,
    totalRevenue: 0,
    pendingDraws: 0,
    
    // Raffles
    totalRaffles: 0,
    activeRaffles: 0,
    pendingRaffles: 0,
    raffleRevenue: 0,
    raffleTicketsSold: 0,
    
    // Fundraisers
    totalFundraisers: 0,
    activeFundraisers: 0,
    fundraiserRevenue: 0,
    fundraiserPlatformFees: 0,
    pendingKYC: 0,
    pendingPayouts: 0,
    
    // Social Verification
    pendingVerifications: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    const email = session.user.email
    if (!isAdmin(email)) {
      router.push('/')
      return
    }

    setUserEmail(email || '')
    await fetchStats()
    setLoading(false)
  }

  async function fetchStats() {
    try {
      // GIVEAWAYS STATS
      const { count: totalGiveaways } = await supabase
        .from('giveaways')
        .select('*', { count: 'exact', head: true })

      const { count: activeGiveaways } = await supabase
        .from('giveaways')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: totalEntries } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .neq('currency', 'FREE')

      const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

      const { count: pendingDraws } = await supabase
        .from('giveaways')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('end_date', new Date().toISOString())
        .is('winner_id', null)

      // RAFFLES STATS
      const { count: totalRaffles } = await supabase
        .from('raffles')
        .select('*', { count: 'exact', head: true })

      const { count: activeRaffles } = await supabase
        .from('raffles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: pendingRaffles } = await supabase
        .from('raffles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { data: raffleTickets } = await supabase
        .from('raffle_tickets')
        .select('final_price, quantity')

      const raffleRevenue = raffleTickets?.reduce((sum, ticket) => sum + (ticket.final_price || 0), 0) || 0
      const raffleTicketsSold = raffleTickets?.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0) || 0

      // FUNDRAISERS STATS
      const { count: totalFundraisers } = await supabase
        .from('fundraisers')
        .select('*', { count: 'exact', head: true })

      const { count: activeFundraisers } = await supabase
        .from('fundraisers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { data: fundraisers } = await supabase
        .from('fundraisers')
        .select('raised_amount, platform_fees')

      const fundraiserRevenue = fundraisers?.reduce((sum, f) => sum + (f.raised_amount || 0), 0) || 0
      const fundraiserPlatformFees = fundraisers?.reduce((sum, f) => sum + (f.platform_fees || 0), 0) || 0

      const { count: pendingKYC } = await supabase
        .from('kyc_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: pendingPayouts } = await supabase
        .from('payout_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // SOCIAL VERIFICATION STATS
      const { count: pendingVerifications } = await supabase
        .from('social_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false)

      setStats({
        totalGiveaways: totalGiveaways || 0,
        activeGiveaways: activeGiveaways || 0,
        totalEntries: totalEntries || 0,
        totalRevenue,
        pendingDraws: pendingDraws || 0,
        totalRaffles: totalRaffles || 0,
        activeRaffles: activeRaffles || 0,
        pendingRaffles: pendingRaffles || 0,
        raffleRevenue,
        raffleTicketsSold,
        totalFundraisers: totalFundraisers || 0,
        activeFundraisers: activeFundraisers || 0,
        fundraiserRevenue,
        fundraiserPlatformFees,
        pendingKYC: pendingKYC || 0,
        pendingPayouts: pendingPayouts || 0,
        pendingVerifications: pendingVerifications || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ONAGUI
                </h1>
              </Link>
              <div className="px-4 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full">
                <span className="text-yellow-400 font-bold text-sm">👑 ADMIN</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all">
                View Site
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                {userEmail.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-white mb-2">Admin Dashboard</h2>
          <p className="text-slate-400">Manage your platform, view analytics, and draw winners</p>
        </div>

        {/* GIVEAWAYS SECTION */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Giveaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">🎁</div>
              <div className="text-3xl font-black text-white mb-1">{stats.totalGiveaways}</div>
              <div className="text-sm text-slate-400">Total Giveaways</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">🔥</div>
              <div className="text-3xl font-black text-green-400 mb-1">{stats.activeGiveaways}</div>
              <div className="text-sm text-slate-400">Active Now</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">🎫</div>
              <div className="text-3xl font-black text-blue-400 mb-1">{stats.totalEntries}</div>
              <div className="text-sm text-slate-400">Total Entries</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-3xl font-black text-yellow-400 mb-1">${stats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Revenue</div>
            </div>

            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-3xl p-6">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="text-3xl font-black text-red-400 mb-1">{stats.pendingDraws}</div>
              <div className="text-sm text-red-400 font-semibold">Needs Winner</div>
            </div>
          </div>
        </div>

        {/* RAFFLES SECTION */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Raffles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">🎟️</div>
              <div className="text-3xl font-black text-white mb-1">{stats.totalRaffles}</div>
              <div className="text-sm text-slate-400">Total Raffles</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-3xl font-black text-green-400 mb-1">{stats.activeRaffles}</div>
              <div className="text-sm text-slate-400">Active Raffles</div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-2 border-orange-500/50 rounded-3xl p-6">
              <div className="text-4xl mb-3">⏳</div>
              <div className="text-3xl font-black text-orange-400 mb-1">{stats.pendingRaffles}</div>
              <div className="text-sm text-orange-400 font-semibold">Pending Approval</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">🎫</div>
              <div className="text-3xl font-black text-purple-400 mb-1">{stats.raffleTicketsSold}</div>
              <div className="text-sm text-slate-400">Tickets Sold</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">💵</div>
              <div className="text-3xl font-black text-yellow-400 mb-1">${stats.raffleRevenue.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Raffle Revenue</div>
            </div>
          </div>
        </div>

        {/* COMBINED REVENUE */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-400 mb-2">Total Platform Revenue</div>
                <div className="text-5xl font-black text-white">
                  ${(stats.totalRevenue + stats.raffleRevenue + stats.fundraiserRevenue).toFixed(2)}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  Giveaways: ${stats.totalRevenue.toFixed(2)} + Raffles: ${stats.raffleRevenue.toFixed(2)} + Fundraisers: ${stats.fundraiserRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-green-400 mt-1 font-semibold">
                  Platform Fees Earned: ${stats.fundraiserPlatformFees.toFixed(2)}
                </div>
              </div>
              <div className="text-8xl">💰</div>
            </div>
          </div>
        </div>

        {/* FUNDRAISERS SECTION */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Fundraisers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">💝</div>
              <div className="text-3xl font-black text-white mb-1">{stats.totalFundraisers}</div>
              <div className="text-sm text-slate-400">Total Fundraisers</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">🔥</div>
              <div className="text-3xl font-black text-green-400 mb-1">{stats.activeFundraisers}</div>
              <div className="text-sm text-slate-400">Active Now</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">💵</div>
              <div className="text-3xl font-black text-blue-400 mb-1">${stats.fundraiserRevenue.toFixed(0)}</div>
              <div className="text-sm text-slate-400">Total Raised</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-3xl font-black text-yellow-400 mb-1">${stats.fundraiserPlatformFees.toFixed(0)}</div>
              <div className="text-sm text-slate-400">Platform Fees</div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-2 border-orange-500/50 rounded-3xl p-6">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-3xl font-black text-orange-400 mb-1">{stats.pendingKYC}</div>
              <div className="text-sm text-orange-400 font-semibold">Pending KYC</div>
            </div>

            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-3xl p-6">
              <div className="text-4xl mb-3">💸</div>
              <div className="text-3xl font-black text-red-400 mb-1">{stats.pendingPayouts}</div>
              <div className="text-sm text-red-400 font-semibold">Pending Payouts</div>
            </div>
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Giveaways Management */}
          <Link href="/admin/giveaways" className="group">
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 hover:border-blue-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Manage Giveaways
              </h3>
              <p className="text-slate-400 text-sm">View, edit, and manage all giveaways</p>
            </div>
          </Link>

          {/* Draw Winners */}
          <Link href="/admin/winners" className="group">
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 hover:border-yellow-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                Draw Winners
              </h3>
              <p className="text-slate-400 text-sm">Randomly select winners for ended giveaways</p>
              {stats.pendingDraws > 0 && (
                <div className="mt-3 px-3 py-1 bg-red-500 rounded-full inline-block">
                  <span className="text-white font-bold text-xs">{stats.pendingDraws} Pending</span>
                </div>
              )}
            </div>
          </Link>

          {/* Raffle Management */}
          <Link href="/admin/raffles" className="group">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 hover:border-purple-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">🎟️</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                Manage Raffles
              </h3>
              <p className="text-slate-400 text-sm">Approve and manage all raffles</p>
              {stats.pendingRaffles > 0 && (
                <div className="mt-3 px-3 py-1 bg-orange-500 rounded-full inline-block">
                  <span className="text-white font-bold text-xs">{stats.pendingRaffles} Pending</span>
                </div>
              )}
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics" className="group">
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 hover:border-green-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                Analytics
              </h3>
              <p className="text-slate-400 text-sm">View detailed platform statistics</p>
            </div>
          </Link>

          {/* KYC Review */}
          <Link href="/admin/kyc" className="group">
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-2 border-orange-500/50 hover:border-orange-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                KYC Review
              </h3>
              <p className="text-slate-400 text-sm">Review and approve identity verifications</p>
              {stats.pendingKYC > 0 && (
                <div className="mt-3 px-3 py-1 bg-orange-500 rounded-full inline-block">
                  <span className="text-white font-bold text-xs">{stats.pendingKYC} Pending</span>
                </div>
              )}
            </div>
          </Link>

          {/* Payout Requests */}
          <Link href="/admin/payouts" className="group">
            <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 border-2 border-red-500/50 hover:border-red-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                Payout Requests
              </h3>
              <p className="text-slate-400 text-sm">Process fundraiser creator payouts</p>
              {stats.pendingPayouts > 0 && (
                <div className="mt-3 px-3 py-1 bg-red-500 rounded-full inline-block">
                  <span className="text-white font-bold text-xs">{stats.pendingPayouts} Pending</span>
                </div>
              )}
            </div>
          </Link>

          {/* Social Verification */}
          <Link href="/admin/verify-social" className="group">
            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 hover:border-blue-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Social Verification
              </h3>
              <p className="text-slate-400 text-sm">Verify social media accounts</p>
              {stats.pendingVerifications > 0 && (
                <div className="mt-3 px-3 py-1 bg-blue-500 rounded-full inline-block">
                  <span className="text-white font-bold text-xs">{stats.pendingVerifications} Pending</span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Admin Info */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="text-3xl">ℹ️</div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2">Admin Access</h4>
              <p className="text-slate-400 text-sm">
                You're logged in as <span className="text-blue-400 font-semibold">{userEmail}</span>. 
                You have full access to all platform management features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
