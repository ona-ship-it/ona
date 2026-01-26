'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Raffle = {
  id: string
  title: string
  description: string
  emoji: string
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  base_ticket_price: number
  status: string
  creator_id: string
  creator_name: string
  created_at: string
  is_powered_by_onagui: boolean
}

export default function AdminRafflesPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('pending')

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

    await fetchRaffles()
    setLoading(false)
  }

  async function fetchRaffles() {
    try {
      let query = supabase.from('raffles').select('*').order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('status', 'pending')
      } else if (filter === 'active') {
        query = query.eq('status', 'active')
      } else if (filter === 'completed') {
        query = query.in('status', ['sold_out', 'completed'])
      }

      const { data: rafflesData, error } = await query

      if (error) throw error

      // Enrich with creator names
      const enrichedRaffles = await Promise.all(
        (rafflesData || []).map(async (raffle) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', raffle.creator_id)
            .single()

          return {
            ...raffle,
            creator_name: profile?.full_name || profile?.email || 'Unknown'
          }
        })
      )

      setRaffles(enrichedRaffles)
    } catch (error) {
      console.error('Error fetching raffles:', error)
    }
  }

  async function handleApprove(raffleId: string) {
    if (!confirm('Approve this raffle? It will go live immediately.')) return

    try {
      const { error } = await supabase
        .from('raffles')
        .update({ 
          status: 'active',
          approved_at: new Date().toISOString()
        })
        .eq('id', raffleId)

      if (error) throw error
      await fetchRaffles()
      alert('Raffle approved!')
    } catch (error) {
      console.error('Error approving raffle:', error)
      alert('Failed to approve raffle')
    }
  }

  async function handleReject(raffleId: string) {
    const reason = prompt('Rejection reason:')
    if (!reason) return

    try {
      const { error } = await supabase
        .from('raffles')
        .update({ 
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', raffleId)

      if (error) throw error
      await fetchRaffles()
      alert('Raffle rejected')
    } catch (error) {
      console.error('Error rejecting raffle:', error)
      alert('Failed to reject raffle')
    }
  }

  async function handleDelete(raffleId: string) {
    if (!confirm('Permanently delete this raffle? This cannot be undone!')) return

    try {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', raffleId)

      if (error) throw error
      await fetchRaffles()
      alert('Raffle deleted')
    } catch (error) {
      console.error('Error deleting raffle:', error)
      alert('Failed to delete raffle')
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
            <Link href="/admin" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-white mb-2">Manage Raffles</h2>
          <p className="text-slate-400">Approve, manage, and monitor all raffles</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'active' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'completed' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Raffles List */}
        {raffles.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Raffles</h3>
            <p className="text-slate-400">No raffles found for this filter</p>
          </div>
        ) : (
          <div className="space-y-6">
            {raffles.map((raffle) => (
              <div key={raffle.id} className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{raffle.emoji}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">{raffle.title}</h3>
                          {raffle.is_powered_by_onagui && (
                            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
                              ⚡ Powered by Onagui
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{raffle.description}</p>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-yellow-400 font-semibold">
                            ${raffle.prize_value.toLocaleString()} {raffle.prize_currency}
                          </span>
                          <span className="text-slate-400">
                            {raffle.tickets_sold} / {raffle.total_tickets} sold
                          </span>
                          <span className="text-blue-400 font-semibold">
                            ${raffle.base_ticket_price} per ticket
                          </span>
                          <span className="text-slate-400">
                            by {raffle.creator_name}
                          </span>
                        </div>
                      </div>

                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        raffle.status === 'pending' ? 'bg-orange-500/20 border border-orange-500 text-orange-400' :
                        raffle.status === 'active' ? 'bg-green-500/20 border border-green-500 text-green-400' :
                        raffle.status === 'rejected' ? 'bg-red-500/20 border border-red-500 text-red-400' :
                        'bg-slate-700 border border-slate-600 text-slate-400'
                      }`}>
                        {raffle.status}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/raffles/${raffle.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                      >
                        View
                      </Link>

                      {raffle.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(raffle.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleReject(raffle.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(raffle.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all ml-auto"
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
