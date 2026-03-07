'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

/* ── SVG Icons ── */
const TicketIcon = ({ size = 16, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v0a3 3 0 01-3 3v0a3 3 0 013 3v0a3 3 0 01-3 3H5a3 3 0 01-3-3v0a3 3 0 013-3v0a3 3 0 01-3-3z"/>
  </svg>
)
const ClockIcon = ({ size = 14, color = '#22d3ee' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const UsersIcon = ({ size = 14, color = '#fd8312' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)
const HeartIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
)
const ShareIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const ChevL = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
)
const ChevR = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
)

/* ── Styles ── */
const s = {
  page: { background: '#0a1929', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties,
  gallery: { position: 'relative' as const, height: 280, background: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', overflow: 'hidden' },
  galleryOverlay: { position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top,#0a1929,transparent)' },
  arrow: { position: 'absolute' as const, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, backdropFilter: 'blur(4px)' },
  dots: { position: 'absolute' as const, bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 3 },
  dot: (active: boolean) => ({ width: active ? 16 : 7, height: 7, borderRadius: 4, background: active ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }),
  counter: { position: 'absolute' as const, bottom: 14, right: 14, fontSize: 10, color: 'rgba(255,255,255,0.7)', zIndex: 3 },
  body: { padding: '16px 16px 32px', maxWidth: 600, margin: '0 auto' } as React.CSSProperties,
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(6,122,13,0.15)', padding: '4px 10px', borderRadius: 99, marginBottom: 8 },
  badgeText: { fontSize: 10, fontWeight: 700, color: '#067a0d' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 },
  host: { fontSize: 11, color: '#64748b', marginTop: 4 },
  hostName: { color: '#fd8312', fontWeight: 600 },
  icons: { display: 'flex', gap: 10, color: '#64748b', flexShrink: 0, marginLeft: 12 },
  card: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 12 },
  prizeLabel: { fontSize: 10, color: '#64748b', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  prizeValue: { fontFamily: "'Rajdhani', sans-serif", fontSize: 38, fontWeight: 800, color: '#067a0d', lineHeight: 1 },
  prizeSub: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 },
  statBox: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' as const },
  statIcon: { marginBottom: 4 },
  statVal: { fontSize: 16, fontWeight: 800, color: '#f8fafc' },
  statLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase' as const, marginTop: 2 },
  progressLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 },
  progressBar: { height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: (pct: number) => ({ height: '100%', width: `${pct}%`, background: pct >= 80 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#067a0d,#059669)', borderRadius: 4, transition: 'width 0.5s' }),
  progressSub: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 },
  miniCard: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, textAlign: 'center' as const },
  miniLabel: { fontSize: 9, color: '#64748b', marginBottom: 3, textTransform: 'uppercase' as const },
  oddsVal: { fontSize: 16, fontWeight: 800, color: '#22d3ee' },
  treasuryVal: { fontSize: 11, fontWeight: 600, color: '#067a0d', wordBreak: 'break-all' as const },
  treasuryLink: { fontSize: 8, color: '#64748b', marginTop: 2 },
  buyBtn: { width: '100%', padding: '14px 0', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#2be937,#067a0d)', color: '#fff', fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 20px rgba(6,122,13,0.3)', marginBottom: 6 },
  buyNote: { fontSize: 9, color: '#64748b', textAlign: 'center' as const },
  stepNum: (active: boolean) => ({ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: active ? '#067a0d' : 'transparent', color: active ? '#fff' : '#067a0d', border: active ? 'none' : '1px solid #067a0d', flexShrink: 0 }),
  stepRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  stepText: { fontSize: 11, color: '#94a3b8' },
  descText: { fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.7 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#f8fafc', margin: '0 0 10px' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8', fontSize: 14 },
}

/* ── Helper: time remaining ── */
function getTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return `${days}d ${hours}h`
}

/* ── Types ── */
interface Raffle {
  id: string
  title: string
  description: string
  images: string[]
  category: string
  prize_value: number
  prize_currency: string
  proof_url: string
  total_tickets: number
  tickets_sold: number
  ticket_price: number
  max_per_user: number
  start_date: string
  end_date: string
  status: string
  treasury_wallet: string
  creator_id: string
  referral_enabled: boolean
  referral_rate: number
  created_at: string
  profiles?: {
    full_name?: string
    avatar_url?: string
  }
}

/* ── Component ── */
export default function RaffleDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [userTickets, setUserTickets] = useState(0)

  useEffect(() => {
    fetchRaffle()
  }, [id])

  async function fetchRaffle() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('raffles')
      .select('*, profiles:creator_id(full_name, avatar_url)')
      .eq('id', id)
      .single()

    if (data) {
      setRaffle(data as any)
      // Fetch user's existing tickets
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: tickets } = await supabase
          .from('raffle_tickets')
          .select('quantity')
          .eq('raffle_id', id)
          .eq('user_id', user.id)
        const total = tickets?.reduce((sum, t) => sum + t.quantity, 0) || 0
        setUserTickets(total)
      }
    }
    setLoading(false)
  }

  async function handleBuy() {
    setBuying(true)
    setMessage('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMessage('Please sign in to buy tickets'); setBuying(false); return }

      const { error } = await supabase
        .from('raffle_tickets')
        .insert({ raffle_id: id, user_id: user.id, quantity })

      if (error) throw error
      setMessage(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`)
      setUserTickets(prev => prev + quantity)
      fetchRaffle()
    } catch (err: any) {
      setMessage(err.message || 'Failed to buy ticket')
    } finally {
      setBuying(false)
    }
  }

  if (loading) return <div style={s.loading}>Loading raffle...</div>
  if (!raffle) return <div style={s.loading}>Raffle not found</div>

  const pct = raffle.total_tickets > 0 ? Math.round((raffle.tickets_sold / raffle.total_tickets) * 100) : 0
  const remaining = raffle.total_tickets - raffle.tickets_sold
  const odds = remaining > 0 ? remaining.toLocaleString() : '—'
  const timeLeft = getTimeRemaining(raffle.end_date)
  const images = raffle.images && raffle.images.length > 0 ? raffle.images : []
  const totalPhotos = images.length || 1
  const creatorName = raffle.profiles?.full_name || 'ONAGUI'
  const isEnded = raffle.status !== 'active' || new Date(raffle.end_date) < new Date()
  const canBuy = !isEnded && remaining > 0 && userTickets < raffle.max_per_user

  const HOW_IT_WORKS = [
    'Buy a ticket for 1 USDC',
    'Wait for the draw date or sellout',
    'Winner is drawn via Chainlink VRF',
    'Winner completes KYC verification',
    `Choose: receive the prize or cash alternative`,
  ]

  return (
    <div style={s.page}>
      {/* ── Photo Gallery ── */}
      <div style={s.gallery as any}>
        {images.length > 0 ? (
          <Image
            src={images[photoIdx]}
            alt={raffle.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' }} />
        )}
        <div style={s.galleryOverlay as any} />

        {/* Arrows */}
        {totalPhotos > 1 && (
          <>
            <div style={{ ...s.arrow as any, left: 10 }} onClick={() => setPhotoIdx(Math.max(0, photoIdx - 1))}><ChevL /></div>
            <div style={{ ...s.arrow as any, right: 10 }} onClick={() => setPhotoIdx(Math.min(totalPhotos - 1, photoIdx + 1))}><ChevR /></div>
          </>
        )}

        {/* Dots */}
        {totalPhotos > 1 && (
          <div style={s.dots as any}>
            {images.map((_, i) => (
              <div key={i} style={s.dot(i === photoIdx)} onClick={() => setPhotoIdx(i)} />
            ))}
          </div>
        )}

        {/* Counter */}
        {totalPhotos > 1 && <div style={s.counter as any}>{photoIdx + 1}/{totalPhotos}</div>}
      </div>

      {/* ── Body ── */}
      <div style={s.body}>
        {/* Badge */}
        <div style={s.badge}>
          <TicketIcon size={10} color="#067a0d" />
          <span style={s.badgeText}>RAFFLE</span>
        </div>

        {/* Title + actions */}
        <div style={s.titleRow}>
          <div>
            <h1 style={s.title}>{raffle.title}</h1>
            <div style={s.host}>by <span style={s.hostName}>{creatorName}</span></div>
          </div>
          <div style={s.icons}>
            <span style={{ cursor: 'pointer' }}><HeartIcon /></span>
            <span style={{ cursor: 'pointer' }}><ShareIcon /></span>
          </div>
        </div>

        {/* Prize value */}
        <div style={s.card}>
          <div style={s.prizeLabel}>Prize Value</div>
          <div style={s.prizeValue}>${raffle.prize_value.toLocaleString()}</div>
          <div style={s.prizeSub}>Brand new from authorized dealer</div>
          {raffle.proof_url && (
            <a href={raffle.proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#22d3ee', marginTop: 4, display: 'inline-block' }}>
              View price proof →
            </a>
          )}
        </div>

        {/* Stats grid */}
        <div style={s.statsGrid}>
          <div style={s.statBox}>
            <div style={s.statIcon}><TicketIcon size={14} color="#067a0d" /></div>
            <div style={s.statVal}>{raffle.tickets_sold.toLocaleString()}</div>
            <div style={s.statLabel}>Tickets Sold</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statIcon}><ClockIcon /></div>
            <div style={s.statVal}>{timeLeft}</div>
            <div style={s.statLabel}>Time Left</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statIcon}><UsersIcon /></div>
            <div style={s.statVal}>{raffle.tickets_sold.toLocaleString()}</div>
            <div style={s.statLabel}>Participants</div>
          </div>
        </div>

        {/* Progress */}
        <div style={s.card}>
          <div style={s.progressLabel}>
            <span style={{ color: '#94a3b8' }}>Tickets sold</span>
            <span style={{ fontWeight: 700, color: pct >= 80 ? '#ef4444' : '#f8fafc' }}>{pct}%</span>
          </div>
          <div style={s.progressBar}>
            <div style={s.progressFill(pct)} />
          </div>
          <div style={s.progressSub}>
            <span>{raffle.tickets_sold.toLocaleString()} sold</span>
            <span>{remaining.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Odds + Treasury */}
        <div style={s.twoCol}>
          <div style={s.miniCard}>
            <div style={s.miniLabel}>Your Odds</div>
            <div style={s.oddsVal}>1 in {odds}</div>
            {userTickets > 0 && <div style={{ fontSize: 8, color: '#067a0d', marginTop: 2 }}>You own {userTickets} ticket{userTickets > 1 ? 's' : ''}</div>}
          </div>
          <div style={s.miniCard}>
            <div style={s.miniLabel}>Treasury</div>
            <div style={s.treasuryVal}>{raffle.treasury_wallet ? `${raffle.treasury_wallet.slice(0, 6)}...${raffle.treasury_wallet.slice(-4)}` : 'Pending'}</div>
            <div style={s.treasuryLink}>Verify on-chain</div>
          </div>
        </div>

        {/* Quantity selector + Buy */}
        {canBuy && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#1e293b', color: '#f8fafc', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', minWidth: 40, textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(raffle.max_per_user - userTickets, quantity + 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#1e293b', color: '#f8fafc', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+</button>
            </div>
          </div>
        )}

        <button
          style={{ ...s.buyBtn, opacity: canBuy && !buying ? 1 : 0.5, cursor: canBuy ? 'pointer' : 'not-allowed' } as any}
          onClick={canBuy ? handleBuy : undefined}
          disabled={!canBuy || buying}
        >
          <TicketIcon size={16} color="#fff" />
          {isEnded ? 'RAFFLE ENDED' : buying ? 'BUYING...' : `BUY ${quantity} TICKET${quantity > 1 ? 'S' : ''} — ${quantity} USDC`}
        </button>
        <div style={s.buyNote}>
          {canBuy ? `Max ${raffle.max_per_user.toLocaleString()} tickets per user. Provably fair draw via Chainlink VRF.` : isEnded ? 'This raffle has ended.' : `You own ${userTickets}/${raffle.max_per_user} max tickets.`}
        </div>

        {/* Message */}
        {message && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: message.includes('Success') ? 'rgba(6,122,13,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.includes('Success') ? 'rgba(6,122,13,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: 12, color: message.includes('Success') ? '#067a0d' : '#ef4444', textAlign: 'center' }}>
            {message}
          </div>
        )}

        {/* Description */}
        {raffle.description && (
          <div style={{ ...s.card, marginTop: 16 }}>
            <h3 style={s.sectionTitle}>Description</h3>
            <p style={s.descText}>{raffle.description}</p>
          </div>
        )}

        {/* How It Works */}
        <div style={s.card}>
          <h3 style={s.sectionTitle}>How It Works</h3>
          {HOW_IT_WORKS.map((text, i) => (
            <div key={i} style={s.stepRow}>
              <div style={s.stepNum(true) as any}>{i + 1}</div>
              <span style={s.stepText}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
