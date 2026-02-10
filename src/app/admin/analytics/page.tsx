'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
}

type ParticipationSummary = {
  totalEvents: number
  eventsByType: Record<string, number>
  recentEvents: Array<{
    id: string
    event_type: string | null
    entity_type: string | null
    entity_id: string | null
    created_at: string | null
    metadata: Record<string, unknown> | null
  }>
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    freeEntries: 0,
    paidEntries: 0,
    averageTicketPrice: 0,
    topGiveaways: [],
  })
  const [participation, setParticipation] = useState<ParticipationSummary>({
    totalEvents: 0,
    eventsByType: {},
    recentEvents: [],
  })
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<'7' | '30'>('7')

  useEffect(() => {
    checkAuth()
  }, [dateRangeFilter])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (!isAdmin(session.user.email)) {
      router.push('/')
      return
    }

    await fetchAnalytics()
    await fetchParticipation()
    setLoading(false)
  }

  async function fetchAnalytics() {
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
        .select('id, title, emoji, tickets_sold, ticket_price, is_free')
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
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  async function fetchParticipation() {
    try {
      const response = await fetch(`/api/admin/participation-events?range=${dateRangeFilter}`)
      if (!response.ok) {
        console.error('Failed to fetch participation events')
        return
      }

      const data = await response.json()
      setParticipation({
        totalEvents: data.totalEvents || 0,
        eventsByType: data.eventsByType || {},
        recentEvents: data.recentEvents || [],
      })
    } catch (error) {
      console.error('Error fetching participation events:', error)
    }
  }

  const filteredEvents = participation.recentEvents.filter((event) => {
    if (eventTypeFilter === 'all') return true
    return event.event_type === eventTypeFilter
  })

  const exportEvents = () => {
    if (filteredEvents.length === 0) return

    const header = ['event_type', 'entity_type', 'entity_id', 'created_at']
    const rows = filteredEvents.map((event) => [
      event.event_type || '',
      event.entity_type || '',
      event.entity_id || '',
      event.created_at || '',
    ])

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `participation-events-${dateRangeFilter}d.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
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
          
          {analytics.topGiveaways.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-400">No giveaways yet</p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Participation Analytics */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 mt-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Participation Analytics</h3>
              <p className="text-slate-400 text-sm">Last {dateRangeFilter} days</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-slate-300 text-sm">Total events: {participation.totalEvents}</div>
              <select
                value={dateRangeFilter}
                onChange={(event) => setDateRangeFilter(event.target.value as '7' | '30')}
                className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
              <select
                value={eventTypeFilter}
                onChange={(event) => setEventTypeFilter(event.target.value)}
                className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
              >
                <option value="all">All events</option>
                {Object.keys(participation.eventsByType).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <button
                onClick={exportEvents}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 transition-all"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(participation.eventsByType).length === 0 ? (
              <div className="col-span-full text-center py-6 text-slate-400">No events recorded yet.</div>
            ) : (
              Object.entries(participation.eventsByType).map(([type, count]) => (
                <div key={type} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
                  <div className="text-xs uppercase text-slate-400 mb-2">{type.replace(/_/g, ' ')}</div>
                  <div className="text-2xl font-black text-white">{count}</div>
                </div>
              ))
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Recent Events</h4>
            {filteredEvents.length === 0 ? (
              <div className="text-slate-400">No recent events.</div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 rounded-xl p-4">
                    <div>
                      <div className="text-white font-semibold">{event.event_type || 'unknown'}</div>
                      <div className="text-xs text-slate-400">
                        {event.entity_type || 'n/a'} • {event.entity_id || 'n/a'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {event.created_at ? new Date(event.created_at).toLocaleString() : 'unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
