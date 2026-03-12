'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import EditPostModal from '@/components/EditPostModal'
import Link from 'next/link'
import Header from '@/components/Header'
import Image from 'next/image'

type MyRaffle = {
  id: string
  title: string
  image_urls: string[]
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  base_ticket_price: number
  status: string
  end_date: string
  winner_id: string | null
  created_at: string
  country_restriction: string | null
  location_name: string | null
}

const statusColor: Record<string, string> = {
  active: '#00ff88',
  completed: '#3b82f6',
  cancelled: '#f59e0b',
  deleted: '#ef4444',
}

export default function MyRafflesPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [raffles, setRaffles] = useState<MyRaffle[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    loadRaffles()
  }, [user])

  async function loadRaffles() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('raffles')
      .select('id, title, image_urls, prize_value, prize_currency, total_tickets, tickets_sold, base_ticket_price, status, end_date, winner_id, created_at, country_restriction, location_name')
      .eq('creator_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (!error && data) setRaffles(data)
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const progress = (r: MyRaffle) => r.total_tickets > 0 ? Math.min((r.tickets_sold / r.total_tickets) * 100, 100) : 0
  const revenue = (r: MyRaffle) => (r.tickets_sold * (r.base_ticket_price ?? 1)).toFixed(2)
  const daysLeft = (r: MyRaffle) => {
    const diff = new Date(r.end_date).getTime() - Date.now()
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
  }

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f8fafc', margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif" }}>My Raffles</h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{raffles.length} raffle{raffles.length !== 1 ? 's' : ''} created</p>
          </div>
          <Link href="/raffles/create" style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#00ff88,#00cc6a)', color: '#0a1929', fontWeight: 700, borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>
            + New Raffle
          </Link>
        </div>

        {/* Summary stats */}
        {raffles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Revenue', value: `${raffles.reduce((sum, r) => sum + parseFloat(revenue(r)), 0).toFixed(2)} USDC` },
              { label: 'Tickets Sold', value: raffles.reduce((sum, r) => sum + r.tickets_sold, 0).toLocaleString() },
              { label: 'Active Raffles', value: raffles.filter(r => r.status === 'active').length },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#00ff88' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {raffles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No raffles yet</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Create your first raffle and start earning!</p>
            <Link href="/raffles/create" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(135deg,#00ff88,#00cc6a)', color: '#0a1929', fontWeight: 700, borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>
              Create Raffle
            </Link>
          </div>
        ) : (
          raffles.map(raffle => (
            <div key={raffle.id} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ display: 'flex' }}>
                {/* Thumbnail */}
                <div style={{ width: 100, flexShrink: 0, position: 'relative', background: '#0f1419', minHeight: 100 }}>
                  {raffle.image_urls?.[0] ? (
                    <Image src={raffle.image_urls[0]} alt={raffle.title} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 32 }}>🏆</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{raffle.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Prize: <span style={{ color: '#00ff88', fontWeight: 600 }}>${raffle.prize_value.toLocaleString()}</span>
                        {raffle.country_restriction && <span style={{ marginLeft: 8 }}>🌍 {raffle.country_restriction}</span>}
                        {raffle.location_name && <span style={{ marginLeft: 6 }}>📍 {raffle.location_name}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[raffle.status] || '#64748b', background: `${statusColor[raffle.status] || '#64748b'}18`, padding: '3px 8px', borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>
                      {raffle.status.charAt(0).toUpperCase() + raffle.status.slice(1)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 4 }}>
                      <span>{raffle.tickets_sold.toLocaleString()} / {raffle.total_tickets.toLocaleString()} tickets</span>
                      <span>{progress(raffle).toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 6, background: '#0f1419', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#00ff88,#00cc6a)', width: `${progress(raffle)}%`, borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Revenue: <span style={{ color: '#00ff88', fontWeight: 700 }}>{revenue(raffle)} USDC</span></div>
                    {raffle.status === 'active' && <div style={{ fontSize: 11, color: '#94a3b8' }}>Ends in: <span style={{ color: '#fff', fontWeight: 700 }}>{daysLeft(raffle)}d</span></div>}
                    {raffle.winner_id && <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>🏆 Winner drawn</div>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/raffles/${raffle.id}`} style={{ fontSize: 12, color: '#00ff88', textDecoration: 'none', fontWeight: 600, padding: '5px 12px', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 7 }}>
                      View
                    </Link>
                    {raffle.status === 'active' && (
                      <button
                        onClick={() => setEditId(raffle.id)}
                        style={{ fontSize: 12, color: '#94a3b8', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EditPostModal
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        postId={editId || ''}
        postType="raffle"
        onSaved={loadRaffles}
      />
    </div>
  )
}
