'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'

type Analytics = {
  totalRevenue: number
  freeEntries: number
  paidEntries: number
  averageTicketPrice: number
  topGiveaways: Array<{
    title: string
    emoji: string
    entries: number
    revenue: number
  }>
  revenueByDay: Array<{
    date: string
    revenue: number
  }>
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    freeEntries: 0,
    paidEntries: 0,
    averageTicketPrice: 0,
    topGiveaways: [],
    revenueByDay: [],
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

    fetchAnalytics()
  }, [user])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Total revenue
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, currency, created_at')
        .eq('status', 'completed')
        .neq('currency', 'FREE')

      const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

      // Free vs Paid entries
      const { count: freeEntries } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('payment_currency', 'FREE')

      const { count: paidEntries } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .neq('payment_currency', 'FREE')

      const averageTicketPrice = paidEntries ? totalRevenue / paidEntries : 0

      // Top giveaways
      const { data: giveaways } = await supabase
        .from('giveaways')
        .select(`
          id,
          title,
          emoji,
          tickets_sold,
          ticket_price,
          is_free
        `)
        .order('tickets_sold', { ascending: false })
        .limit(5)

      const topGiveaways = giveaways?.map(g => ({
        title: g.title,
        emoji: g.emoji,
        entries: g.tickets_sold,
        revenue: g.is_free ? 0 : g.tickets_sold * g.ticket_price,
      })) || []

      setAnalytics({
        totalRevenue,
        freeEntries: freeEntries || 0,
        paidEntries: paidEntries || 0,
        averageTicketPrice,
        topGiveaways,
        revenueByDay: [],
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ONAGUI
                </h1>
              </Link>
              <div className="px-4 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full">
                <span className="text-yellow-400 font-bold text-sm">👑 ADMIN</span>
              </div>
            </div>
            <Link href="/admin" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-white mb-2">Platform Analytics</h2>
          <p className="text-slate-400">Detailed insights into your platform performance</p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-8">
            <div className="text-4xl mb-3">💰</div>
            <div className="text-sm text-green-400 mb-2">Total Revenue</div>
            <div className="text-4xl font-black text-white">${analytics.totalRevenue.toFixed(2)}</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
            <div className="text-4xl mb-3">🎫</div>
            <div className="text-sm text-slate-400 mb-2">Free Entries</div>
            <div className="text-4xl font-black text-white">{analytics.freeEntries}</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
            <div className="text-4xl mb-3">💳</div>
            <div className="text-sm text-slate-400 mb-2">Paid Entries</div>
            <div className="text-4xl font-black text-white">{analytics.paidEntries}</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-sm text-slate-400 mb-2">Avg Ticket Price</div>
            <div className="text-4xl font-black text-white">${analytics.averageTicketPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* Top Giveaways */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Top Performing Giveaways</h3>
          <div className="space-y-4">
            {analytics.topGiveaways.map((giveaway, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{giveaway.emoji}</div>
                  <div>
                    <div className="font-bold text-white">{giveaway.title}</div>
                    <div className="text-sm text-slate-400">{giveaway.entries} entries</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  ${giveaway.revenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
