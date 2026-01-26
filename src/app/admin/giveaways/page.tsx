'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  winner_id: string | null
}

export default function AdminGiveawaysPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'ended' | 'completed'>('all')

  useEffect(() => {
    checkAuth()
  }, [filter])

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

    await fetchGiveaways()
    setLoading(false)
  }

  async function fetchGiveaways() {
    try {
      let query = supabase.from('giveaways').select('*').order('created_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('status', 'active').gt('end_date', new Date().toISOString())
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
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      const { error } = await supabase
        .from('giveaways')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      await fetchGiveaways()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  async function deleteGiveaway(id: string) {
    if (!confirm('Are you sure you want to delete this giveaway? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('giveaways')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchGiveaways()
    } catch (error) {
      console.error('Error deleting giveaway:', error)
      alert('Failed to delete giveaway. It may have entries.')
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
          <h2 className="text-4xl font-black text-white mb-2">Manage Giveaways</h2>
          <p className="text-slate-400">View, edit, and manage all giveaways on the platform</p>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All
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
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Ended
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

        {giveaways.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Giveaways</h3>
            <p className="text-slate-400">No giveaways found for this filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {giveaways.map((giveaway) => (
              <div key={giveaway.id} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{giveaway.emoji}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{giveaway.title}</h3>
                        <p className="text-slate-400 text-sm mb-3">{giveaway.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-yellow-400 font-semibold">
                            ${giveaway.prize_value} {giveaway.prize_currency}
                          </span>
                          <span className="text-slate-400">
                            {giveaway.tickets_sold} / {giveaway.total_tickets} entries
                          </span>
                          <span className="text-blue-400 font-semibold">
                            {giveaway.is_free ? 'FREE' : `$${giveaway.ticket_price}`}
                          </span>
                          <span className="text-slate-400">
                            Ends: {new Date(giveaway.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {giveaway.status === 'active' ? (
                          new Date(giveaway.end_date) < new Date() && !giveaway.winner_id ? (
                            <span className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-xl text-orange-400 text-sm font-bold">
                              Ended
                            </span>
                          ) : (
                            <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-xl text-green-400 text-sm font-bold">
                              Active
                            </span>
                          )
                        ) : (
                          <span className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-slate-400 text-sm font-bold">
                            Inactive
                          </span>
                        )}
                        
                        {giveaway.winner_id && (
                          <span className="px-4 py-2 bg-yellow-500/20 border border-yellow-500 rounded-xl text-yellow-400 text-sm font-bold">
                            Winner Drawn
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/giveaways/${giveaway.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                      >
                        View
                      </Link>
                      
                      {new Date(giveaway.end_date) < new Date() && !giveaway.winner_id && (
                        <Link
                          href={`/admin/winners?giveaway=${giveaway.id}`}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-all"
                        >
                          Draw Winner
                        </Link>
                      )}
                      
                      <button
                        onClick={() => toggleStatus(giveaway.id, giveaway.status)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                      >
                        {giveaway.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        onClick={() => deleteGiveaway(giveaway.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
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
