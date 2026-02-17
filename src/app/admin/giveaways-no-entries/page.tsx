'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, Star, AlertCircle, CheckCircle } from 'lucide-react'

type GiveawayWithNoEntries = {
  id: string
  title: string
  description: string
  image_url: string | null
  prize_value: number
  prize_currency: string
  tickets_sold: number
  total_tickets: number
  ticket_price: number
  is_free: boolean
  status: string
  end_date: string
  created_at: string
  promotions_count?: number
  promoted_at?: string
}

export default function AdminGiveawaysNoEntriesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [giveaways, setGiveaways] = useState<GiveawayWithNoEntries[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  async function checkAuthAndFetch() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: { user: fullUser } } = await supabase.auth.getUser()
      const adminStatus = fullUser?.user_metadata?.is_admin === true

      if (!adminStatus) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await fetchGiveaways()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  async function fetchGiveaways() {
    try {
      const response = await fetch('/api/admin/giveaways-no-entries')
      if (!response.ok) {
        throw new Error('Failed to fetch giveaways')
      }
      const data = await response.json()
      setGiveaways(data.giveaways || [])
    } catch (error) {
      console.error('Error fetching giveaways:', error)
    } finally {
      setLoading(false)
    }
  }

  async function promoteGiveaway(giveawayId: string) {
    try {
      setActionInProgress(giveawayId)
      const response = await fetch('/api/admin/giveaways-no-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId, action: 'promote' }),
      })

      if (!response.ok) {
        throw new Error('Failed to promote giveaway')
      }

      alert('Giveaway promoted successfully!')
      await fetchGiveaways()
    } catch (error) {
      console.error('Error promoting giveaway:', error)
      alert('Failed to promote giveaway')
    } finally {
      setActionInProgress(null)
    }
  }

  async function deleteGiveaway(giveawayId: string) {
    if (!confirm('Are you sure you want to delete this giveaway?')) {
      return
    }

    try {
      setActionInProgress(giveawayId)
      const response = await fetch('/api/admin/giveaways-no-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId, action: 'delete' }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete giveaway')
      }

      alert('Giveaway deleted successfully!')
      await fetchGiveaways()
    } catch (error) {
      console.error('Error deleting giveaway:', error)
      alert('Failed to delete giveaway')
    } finally {
      setActionInProgress(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking admin access...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading giveaways...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Giveaways Without Entries
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage giveaways that have no free or paid entries. You can promote or delete them.
          </p>
        </div>

        {giveaways.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              All Giveaways Have Entries!
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Great job! There are no giveaways without entries right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {giveaways.map((giveaway) => (
              <div
                key={giveaway.id}
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div className="p-6 flex gap-6">
                  {/* Image */}
                  {giveaway.image_url ? (
                    <img
                      src={giveaway.image_url}
                      alt={giveaway.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--bg-secondary)' }}
                    >
                      <AlertCircle size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {giveaway.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} className="line-clamp-2">
                      {giveaway.description}
                    </p>
                    <div className="flex gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span>Prize: {giveaway.prize_value} {giveaway.prize_currency}</span>
                      <span>Tickets: 0/{giveaway.total_tickets}</span>
                      <span>Price: {giveaway.is_free ? 'Free' : `${giveaway.ticket_price} USDC`}</span>
                      <span>Status: {giveaway.status}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => promoteGiveaway(giveaway.id)}
                      disabled={actionInProgress === giveaway.id}
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
                      style={{
                        background: 'var(--accent-primary)',
                        color: 'var(--bg-primary)',
                        opacity: actionInProgress === giveaway.id ? 0.5 : 1,
                        cursor: actionInProgress === giveaway.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Star size={16} />
                      Promote
                    </button>
                    <button
                      onClick={() => deleteGiveaway(giveaway.id)}
                      disabled={actionInProgress === giveaway.id}
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        opacity: actionInProgress === giveaway.id ? 0.5 : 1,
                        cursor: actionInProgress === giveaway.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
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
