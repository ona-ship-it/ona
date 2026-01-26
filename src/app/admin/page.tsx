'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'

type DashboardStats = {
  totalGiveaways: number
  activeGiveaways: number
  totalEntries: number
  totalRevenue: number
  pendingDraws: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalGiveaways: 0,
    activeGiveaways: 0,
    totalEntries: 0,
    totalRevenue: 0,
    pendingDraws: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isAdmin(user.email)) {
      router.push('/')
      return
    }

    fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      // Total giveaways
      const { count: totalGiveaways } = await supabase
        .from('giveaways')
        .select('*', { count: 'exact', head: true })

      // Active giveaways
      const { count: activeGiveaways } = await supabase
        .from('giveaways')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Total entries
      const { count: totalEntries } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })

      // Total revenue
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .neq('currency', 'FREE')

      const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

      // Pending draws (ended but no winner)
      const { count: pendingDraws } = await supabase
        .from('giveaways')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('end_date', new Date().toISOString())
        .is('winner_id', null)

      setStats({
        totalGiveaways: totalGiveaways || 0,
        activeGiveaways: activeGiveaways || 0,
        totalEntries: totalEntries || 0,
        totalRevenue,
        pendingDraws: pendingDraws || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
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
              <Link
                href="/"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
              >
                View Site
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-white mb-2">Admin Dashboard</h2>
          <p className="text-slate-400">Manage your platform, view analytics, and draw winners</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Total Giveaways */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="text-4xl mb-3">🎁</div>
            <div className="text-3xl font-black text-white mb-1">{stats.totalGiveaways}</div>
            <div className="text-sm text-slate-400">Total Giveaways</div>
          </div>

          {/* Active Giveaways */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="text-4xl mb-3">🔥</div>
            <div className="text-3xl font-black text-green-400 mb-1">{stats.activeGiveaways}</div>
            <div className="text-sm text-slate-400">Active Now</div>
          </div>

          {/* Total Entries */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="text-4xl mb-3">🎫</div>
            <div className="text-3xl font-black text-blue-400 mb-1">{stats.totalEntries}</div>
            <div className="text-sm text-slate-400">Total Entries</div>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="text-4xl mb-3">💰</div>
            <div className="text-3xl font-black text-yellow-400 mb-1">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-slate-400">Total Revenue</div>
          </div>

          {/* Pending Draws */}
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-3xl p-6">
            <div className="text-4xl mb-3">⚠️</div>
            <div className="text-3xl font-black text-red-400 mb-1">{stats.pendingDraws}</div>
            <div className="text-sm text-red-400 font-semibold">Needs Winner</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Manage Giveaways */}
          <Link href="/admin/giveaways" className="group">
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 hover:border-blue-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Manage Giveaways
              </h3>
              <p className="text-slate-400 text-sm">
                View, edit, and manage all giveaways on the platform
              </p>
            </div>
          </Link>

          {/* Draw Winners */}
          <Link href="/admin/winners" className="group">
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 hover:border-yellow-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                Draw Winners
              </h3>
              <p className="text-slate-400 text-sm">
                Randomly select winners for ended giveaways
              </p>
              {stats.pendingDraws > 0 && (
                <div className="mt-3 px-3 py-1 bg-red-500 rounded-full inline-block">
                  <span className="text-white font-bold text-xs">{stats.pendingDraws} Pending</span>
                </div>
              )}
            </div>
          </Link>

          {/* View Entries */}
          <Link href="/admin/entries" className="group">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 hover:border-purple-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                View Entries
              </h3>
              <p className="text-slate-400 text-sm">
                See all entries across all giveaways
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics" className="group">
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 hover:border-green-500 rounded-3xl p-8 transition-all hover:scale-105">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                Analytics
              </h3>
              <p className="text-slate-400 text-sm">
                View detailed platform statistics and insights
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Info */}
        <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="text-3xl">ℹ️</div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2">Admin Access</h4>
              <p className="text-slate-400 text-sm">
                You're logged in as <span className="text-blue-400 font-semibold">{user?.email}</span>. 
                You have full access to all platform management features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
