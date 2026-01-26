'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import Image from 'next/image'
const { user, loading: authLoading } = useAuth()

// Change the useEffect to:
useEffect(() => {
  if (authLoading) return // Wait for auth to load
  
  if (!user) {
    router.push('/login')
    return
  }

  if (!isAdmin(user.email)) {
    router.push('/')
    return
  }

  fetchGiveaways()
}, [user, authLoading, filter])

type Giveaway = {
  id: string
  title: string
  description: string
  emoji: string
  image_url: string | null
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  is_free: boolean
  ticket_price: number
  ticket_currency: string
  status: string
  end_date: string
  created_at: string
  winner_id: string | null
}

export default function AdminGiveawaysPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'ended' | 'completed'>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isAdmin(user.email)) {
      router.push('/')
      return
    }

    fetchGiveaways()
  }, [user, filter])

  const fetchGiveaways = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('giveaways')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('status', 'active').gte('end_date', new Date().toISOString())
      } else if (filter === 'ended') {
        query = query.eq('status', 'active').lt('end_date', new Date().toISOString()).is('winner_id', null)
      } else if (filter === 'completed') {
        query = query.not('winner_id', 'is', null)
      }

      const { data, error } = await query

      if (error) throw error
      setGiveaways(data || [])
    } catch (error) {
      console.error('Error fetching giveaways:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (giveawayId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      const { error } = await supabase
        .from('giveaways')
        .update({ status: newStatus })
        .eq('id', giveawayId)

      if (error) throw error
      fetchGiveaways()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const deleteGiveaway = async (giveawayId: string) => {
    if (!confirm('Are you sure you want to delete this giveaway? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('giveaways')
        .delete()
        .eq('id', giveawayId)

      if (error) throw error
      fetchGiveaways()
    } catch (error) {
      console.error('Error deleting giveaway:', error)
      alert('Failed to delete giveaway. It may have entries.')
    }
  }

  const getStatusBadge = (giveaway: Giveaway) => {
    const hasEnded = new Date(giveaway.end_date) < new Date()
    
    if (giveaway.winner_id) {
      return <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-xs font-bold">✅ Winner Drawn</span>
    }
    
    if (hasEnded) {
      return <span className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-400 text-xs font-bold">⏱️ Needs Winner</span>
    }
    
    if (giveaway.status === 'active') {
      return <span className="px-3 py-1 bg-blue-500/20 border border-blue-500 rounded-full text-blue-400 text-xs font-bold">🔥 Active</span>
    }
    
    return <span className="px-3 py-1 bg-slate-500/20 border border-slate-500 rounded-full text-slate-400 text-xs font-bold">⏸️ Inactive</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
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
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-black text-white mb-2">Manage Giveaways</h2>
          <p className="text-slate-400">View and manage all giveaways on the platform</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All ({giveaways.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'ended'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Needs Winner
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Giveaways List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading giveaways...</p>
          </div>
        ) : giveaways.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Giveaways Found</h3>
            <p className="text-slate-400">Try changing the filter or create a new giveaway</p>
          </div>
        ) : (
          <div className="space-y-4">
            {giveaways.map((giveaway) => (
              <div
                key={giveaway.id}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
                    {giveaway.image_url ? (
                      <Image src={giveaway.image_url} alt={giveaway.title} width={96} height={96} className="object-cover w-full h-full" />
                    ) : (
                      giveaway.emoji
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{giveaway.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2">{giveaway.description}</p>
                      </div>
                      {getStatusBadge(giveaway)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Prize</div>
                        <div className="text-lg font-bold text-green-400">${giveaway.prize_value}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Entries</div>
                        <div className="text-lg font-bold text-blue-400">{giveaway.tickets_sold}/{giveaway.total_tickets}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Price</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {giveaway.is_free ? 'FREE' : `${giveaway.ticket_price} ${giveaway.ticket_currency}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Ends</div>
                        <div className="text-lg font-bold text-white">
                          {new Date(giveaway.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        href={`/giveaways/${giveaway.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm"
                      >
                        View
                      </Link>
                      
                      {!giveaway.winner_id && new Date(giveaway.end_date) < new Date() && (
                        <Link
                          href={`/admin/winners?giveaway=${giveaway.id}`}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-all text-sm"
                        >
                          Draw Winner
                        </Link>
                      )}

                      <button
                        onClick={() => toggleStatus(giveaway.id, giveaway.status)}
                        className={`px-4 py-2 font-semibold rounded-lg transition-all text-sm ${
                          giveaway.status === 'active'
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {giveaway.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => deleteGiveaway(giveaway.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
