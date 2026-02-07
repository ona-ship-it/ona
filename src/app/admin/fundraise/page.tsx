'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Fundraiser = {
  id: string
  title: string
  description: string
  goal_amount: number
  raised_amount: number
  creator_id: string
  creator_name: string
  email: string
  status: string
  created_at: string
  category: string
  image_url: string | null
}

export default function AdminFundraisePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

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

    await fetchFundraisers()
    setLoading(false)
  }

  async function fetchFundraisers() {
    try {
      let query = supabase.from('fundraisers').select('*').order('created_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('status', 'active')
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed')
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled')
      }

      const { data: fundraisersData, error } = await query

      if (error) throw error

      // Enrich with creator info
      const enriched = await Promise.all(
        (fundraisersData || []).map(async (fundraiser) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', fundraiser.creator_id)
            .single()

          return {
            ...fundraiser,
            creator_name: profile?.full_name || 'Unknown',
            email: profile?.email || 'unknown@email.com'
          }
        })
      )

      setFundraisers(enriched)
    } catch (error) {
      console.error('Error fetching fundraisers:', error)
    }
  }

  async function deleteFundraiser(id: string) {
    if (!confirm('Are you sure you want to permanently delete this fundraiser? This cannot be undone and will remove it from the platform immediately.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchFundraisers()
      alert('Fundraiser deleted successfully')
    } catch (error) {
      console.error('Error deleting fundraiser:', error)
      alert('Failed to delete fundraiser')
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'cancelled' : 'active'
    
    if (!confirm(`Change status to "${newStatus}"?`)) return

    try {
      const { error } = await supabase
        .from('fundraisers')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      await fetchFundraisers()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
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
          <h2 className="text-4xl font-black text-white mb-2">Manage Fundraisers</h2>
          <p className="text-slate-400">View, manage, and delete fundraising campaigns</p>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All ({fundraisers.length})
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
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Cancelled
          </button>
        </div>

        <div className="space-y-4">
          {fundraisers.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-2xl font-bold text-white mb-2">No fundraisers found</h3>
              <p className="text-slate-400">No fundraising campaigns match this filter</p>
            </div>
          ) : (
            fundraisers.map((fundraiser) => (
              <div
                key={fundraiser.id}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white">{fundraiser.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          fundraiser.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : fundraiser.status === 'completed'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}
                      >
                        {fundraiser.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-400 mb-4 line-clamp-2">{fundraiser.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Goal</div>
                        <div className="text-green-400 font-bold">${fundraiser.goal_amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Raised</div>
                        <div className="text-blue-400 font-bold">${fundraiser.raised_amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Creator</div>
                        <div className="text-white text-sm">{fundraiser.creator_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Category</div>
                        <div className="text-white text-sm">{fundraiser.category || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      Created: {new Date(fundraiser.created_at).toLocaleDateString()} • ID: {fundraiser.id.slice(0, 8)}...
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/fundraise/${fundraiser.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-center text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => toggleStatus(fundraiser.id, fundraiser.status)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-all text-sm"
                    >
                      {fundraiser.status === 'active' ? 'Cancel' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteFundraiser(fundraiser.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
