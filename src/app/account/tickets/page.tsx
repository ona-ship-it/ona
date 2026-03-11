'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import Link from 'next/link'
import Header from '@/components/Header'
import Image from 'next/image'

type TicketEntry = {
  id: string
  raffle_id: string
  ticket_numbers: number[]
  quantity: number
  final_price: number
  purchased_at: string
  raffle: {
    id: string
    title: string
    image_urls: string[]
    prize_value: number
    prize_currency: string
    status: string
    end_date: string
    winner_id: string | null
    total_tickets: number
    tickets_sold: number
  } | null
}

const statusColor: Record<string, string> = {
  active: '#00ff88',
  completed: '#3b82f6',
  cancelled: '#ef4444',
  deleted: '#4a5568',
}
const statusLabel: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  deleted: 'Removed',
}

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [tickets, setTickets] = useState<TicketEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadTickets()
  }, [user])

  async function loadTickets() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('raffle_tickets')
      .select(`
        id, raffle_id, ticket_numbers, quantity, final_price, purchased_at,
        raffle:raffles ( id, title, image_urls, prize_value, prize_currency, status, end_date, winner_id, total_tickets, tickets_sold )
      `)
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })

    if (!error && data) setTickets(data as any)
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

  const card: React.CSSProperties = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 12 }

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f8fafc', margin: '0 0 4px', fontFamily: "'Rajdhani', sans-serif" }}>My Tickets</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{tickets.length} purchase{tickets.length !== 1 ? 's' : ''} across all raffles</p>
        </div>

        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎟️</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No tickets yet</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Browse raffles and buy your first ticket!</p>
            <Link href="/raffles" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(135deg,#00ff88,#00cc6a)', color: '#0a1929', fontWeight: 700, borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>
              Browse Raffles
            </Link>
          </div>
        ) : (
          tickets.map(ticket => {
            const raffle = ticket.raffle
            const isWinner = raffle?.winner_id === user?.id
            const odds = raffle
              ? ((ticket.quantity / raffle.total_tickets) * 100).toFixed(3)
              : '0'

            return (
              <div key={ticket.id} style={card}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Image */}
                  <div style={{ width: 100, flexShrink: 0, position: 'relative', background: '#0f1419' }}>
                    {raffle?.image_urls?.[0] ? (
                      <Image src={raffle.image_urls[0]} alt={raffle.title || ''} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
                        <span style={{ fontSize: 32 }}>🏆</span>
                      </div>
                    )}
                    {isWinner && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,255,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 32 }}>🎉</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>
                          {raffle?.title || 'Deleted Raffle'}
                        </div>
                        {raffle && (
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            Prize: <span style={{ color: '#00ff88', fontWeight: 600 }}>${raffle.prize_value.toLocaleString()} {raffle.prize_currency}</span>
                          </div>
                        )}
                      </div>
                      {raffle && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[raffle.status] || '#64748b', background: `${statusColor[raffle.status] || '#64748b'}18`, padding: '3px 8px', borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>
                          {statusLabel[raffle.status] || raffle.status}
                        </span>
                      )}
                    </div>

                    {isWinner && (
                      <div style={{ padding: '6px 10px', background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8, fontSize: 12, color: '#00ff88', fontWeight: 700, marginBottom: 8 }}>
                        🎉 You won this raffle!
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>TICKETS</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{ticket.quantity}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>PAID</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{ticket.final_price} USDC</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>ODDS</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{odds}%</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 6 }}>
                      Ticket #{ticket.ticket_numbers?.join(', #') || '—'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#4a5568' }}>
                        {new Date(ticket.purchased_at).toLocaleDateString()}
                      </span>
                      {raffle && (
                        <Link href={`/raffles/${raffle.id}`} style={{ fontSize: 11, color: '#00ff88', textDecoration: 'none', fontWeight: 600 }}>
                          View Raffle →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
