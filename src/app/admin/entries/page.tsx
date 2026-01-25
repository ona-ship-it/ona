'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'

type Entry = {
  id: string
  created_at: string
  purchase_price: number
  payment_currency: string
  is_winner: boolean
  profiles: {
    full_name: string
    email: string
  } | null
  giveaways: {
    title: string
    emoji: string
  } | null
}

export default function AdminEntriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<Entry[]>([])
  const [page, setPage] = useState(0)
  const entriesPerPage = 50

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isAdmin(user.email)) {
      router.push('/')
      return
    }

    fetchEntries()
  }, [user, page])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          created_at,
          purchase_price,
          payment_currency,
          is_winner,
          user_id,
          giveaway_id
        `)
        .order('created_at', { ascending: false })
        .range(page * entriesPerPage, (page + 1) * entriesPerPage - 1)

      if (error) throw error

      // Fetch related data separately
      const enrichedEntries = await Promise.all(
        (data || []).map(async (entry) => {
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', entry.user_id)
            .single()

          // Get giveaway
          const { data: giveaway } = await supabase
            .from('giveaways')
            .select('title, emoji')
            .eq('id', entry.giveaway_id)
            .single()

          return {
            id: entry.id,
            created_at: entry.created_at,
            purchase_price: entry.purchase_price,
            payment_currency: entry.payment_currency,
            is_winner: entry.is_winner,
            profiles: profile,
            giveaways: giveaway,
          }
        })
      )

      setEntries(enrichedEntries)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-4xl font-black text-white mb-2">All Entries</h2>
          <p className="text-slate-400">View all entries across all giveaways</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading entries...</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Giveaway</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? 'bg-slate-800/20' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">
                        {entry.profiles?.full_name || 'Unknown'}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {entry.profiles?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{entry.giveaways?.emoji || '🎁'}</span>
                        <span className="text-white">{entry.giveaways?.title || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${entry.purchase_price === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {entry.purchase_price === 0 ? 'FREE' : `${entry.purchase_price} ${entry.payment_currency}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {entry.is_winner ? (
                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full text-yellow-400 text-xs font-bold">
                          🏆 WINNER
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500 rounded-full text-blue-400 text-xs font-bold">
                          Entry
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
              >
                Previous
              </button>
              <span className="text-slate-400">Page {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={entries.length < entriesPerPage}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
