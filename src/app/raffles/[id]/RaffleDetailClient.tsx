'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'
import WinnerDisplay from '@/components/WinnerDisplay'
import ShareButtons from '@/components/ShareButtons'

type Raffle = {
  id: string
  title: string
  description: string
  image_urls: string[]
  prize_description?: string
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  base_ticket_price: number
  tier_2_threshold?: number
  tier_2_discount?: number
  tier_3_threshold?: number
  tier_3_discount?: number
  tier_4_threshold?: number
  tier_4_discount?: number
  early_bird_percentage?: number
  early_bird_discount?: number
  early_bird_expired?: boolean
  is_powered_by_onagui?: boolean
  country_restriction: string | null
  location_name: string | null
  tags?: string[]
  status: string
  creator_id: string
  winner_id: string | null
  winner_drawn_at: string | null
  created_at: string
}

type CreatorProfile = {
  id: string
  username: string
  avatar_url: string | null
}

type Activity = {
  id: string
  message: string
  created_at: string
}

export default function RaffleDetailClient() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isFollowing, setIsFollowing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [buySuccess, setBuySuccess] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    initPage()
  }, [params.id])

  async function initPage() {
    const { data: { session } } = await supabase.auth.getSession()
    const currentUser = session?.user ?? null
    setUser(currentUser)

    await fetchRaffle(currentUser)
    incrementView(currentUser?.id ?? null)
  }

  async function fetchRaffle(currentUser: any) {
    try {
      const { data: raffleData, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', params.id)
        .neq('status', 'deleted')
        .single()

      if (error || !raffleData) {
        router.push('/raffles')
        return
      }

      setRaffle(raffleData)

      // Fetch creator from onagui_profiles (correct table)
      const { data: creatorData } = await supabase
        .from('onagui_profiles')
        .select('id, username, avatar_url')
        .eq('id', raffleData.creator_id)
        .single()

      if (creatorData) setCreator(creatorData)

      // Check follow status now that we have the raffle
      if (currentUser) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', raffleData.creator_id)
          .maybeSingle()
        setIsFollowing(!!followData)
      }
    } catch (err) {
      console.error('Error fetching raffle:', err)
      router.push('/raffles')
    } finally {
      setLoading(false)
    }
  }

  async function incrementView(userId: string | null) {
    try {
      await supabase.rpc('increment_raffle_view', { raffle_id: params.id as string })
    } catch {
      // Non-critical — ignore if function doesn't exist
    }
  }

  async function handleFollow() {
    if (!user) { router.push('/login'); return }
    if (!raffle) return

    try {
      if (isFollowing) {
        await supabase.from('follows').delete()
          .eq('follower_id', user.id).eq('following_id', raffle.creator_id)
        setIsFollowing(false)
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: raffle.creator_id })
        setIsFollowing(true)
      }
    } catch (err) {
      console.error('Follow error:', err)
    }
  }

  function getTicketPrice(): number {
    if (!raffle) return 1
    return raffle.base_ticket_price ?? 1
  }

  function calculatePrice(qty: number): number {
    return getTicketPrice() * qty
  }

  function getOdds(): string {
    if (!raffle) return '0'
    const remaining = raffle.total_tickets - raffle.tickets_sold
    if (remaining <= 0) return '0'
    return ((quantity / remaining) * 100).toFixed(4)
  }

  async function handleBuyTickets() {
    if (!user) { router.push('/login'); return }
    if (!raffle || quantity < 1) return
    if (!walletAddress) { setBuyError('Please connect your wallet first'); return }

    setBuying(true)
    setBuyError('')
    setBuySuccess('')

    try {
      const response = await fetch(`/api/raffles/${raffle.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, walletAddress }),
      })

      const result = await response.json()

      if (!response.ok) {
        setBuyError(result.error || 'Failed to purchase tickets')
        return
      }

      setBuySuccess(`Success! You got ticket${quantity > 1 ? 's' : ''} #${result.ticketNumbers.join(', ')}`)
      await fetchRaffle(user)
    } catch (err: any) {
      setBuyError(err.message || 'Unexpected error')
    } finally {
      setBuying(false)
    }
  }

  const getProgressPercentage = () => {
    if (!raffle) return 0
    return Math.min((raffle.tickets_sold / raffle.total_tickets) * 100, 100)
  }

  // ── Loading state (matches Onagui dark theme)
  if (loading) {
    return (
      <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Raffle Not Found</h3>
          <Link href="/raffles" style={{ color: '#00ff88', textDecoration: 'none' }}>Back to Raffles</Link>
        </div>
      </div>
    )
  }

  const card: React.CSSProperties = {
    background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 24, marginBottom: 16,
  }

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {/* Two-column on large screens via inline media is approximated; actual responsive needs Tailwind or CSS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>

            {/* ── Left column ── */}
            <div>
              {/* Powered by badge */}
              {raffle.is_powered_by_onagui && (
                <div style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#f59e0b,#ea580c)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>⚡</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>Powered by Onagui</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Verified & secured by the platform</div>
                  </div>
                </div>
              )}

              {/* Image gallery */}
              <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ position: 'relative', height: 380, background: '#0f1419' }}>
                  {raffle.image_urls && raffle.image_urls.length > 0 ? (
                    <Image src={raffle.image_urls[selectedImage]} alt={raffle.title} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span style={{ fontSize: 80, opacity: 0.3 }}>🏆</span>
                    </div>
                  )}
                  {/* Country/location badge */}
                  {(raffle.country_restriction || raffle.location_name) && (
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#94a3b8' }}>
                      {raffle.country_restriction && <span>🌍 {raffle.country_restriction}</span>}
                      {raffle.location_name && <span> · 📍 {raffle.location_name}</span>}
                    </div>
                  )}
                </div>
                {raffle.image_urls && raffle.image_urls.length > 1 && (
                  <div style={{ padding: 12, display: 'flex', gap: 8, overflowX: 'auto' }}>
                    {raffle.image_urls.map((url, idx) => (
                      <button key={idx} onClick={() => setSelectedImage(idx)} style={{
                        position: 'relative', width: 72, height: 72, flexShrink: 0, borderRadius: 8,
                        overflow: 'hidden', border: `2px solid ${selectedImage === idx ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer', background: 'none', padding: 0,
                      }}>
                        <Image src={url} alt={`${raffle.title} ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & description */}
              <div style={card}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', margin: '0 0 12px', fontFamily: "'Rajdhani', sans-serif" }}>{raffle.title}</h1>
                <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, margin: '0 0 16px' }}>{raffle.description}</p>
                {raffle.prize_description && (
                  <>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginBottom: 16 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Prize Details</h3>
                      <p style={{ color: '#64748b', fontSize: 14 }}>{raffle.prize_description}</p>
                    </div>
                  </>
                )}
                {raffle.tags && raffle.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {raffle.tags.map(tag => (
                      <span key={tag} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 20, fontSize: 12, color: '#94a3b8' }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Winner */}
              {raffle.winner_id && raffle.winner_drawn_at && (
                <WinnerDisplay raffleId={raffle.id} winnerId={raffle.winner_id} winnerDrawnAt={raffle.winner_drawn_at} />
              )}

              {/* Activity feed */}
              {activities.length > 0 && (
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>📊 Live Activity</h3>
                  <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activities.map(a => (
                      <div key={a.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                        <span>🎟️</span>
                        <div>
                          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{a.message}</p>
                          <p style={{ color: '#4a5568', fontSize: 11, margin: '4px 0 0' }}>{new Date(a.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column ── */}
            <div>
              {/* Creator */}
              {creator && (
                <div style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#00ff88,#00cc6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a1929', fontSize: 18, overflow: 'hidden', flexShrink: 0 }}>
                      {creator.avatar_url
                        ? <Image src={creator.avatar_url} alt={creator.username} width={48} height={48} style={{ borderRadius: '50%' }} />
                        : creator.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{creator.username}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Raffle Creator</div>
                    </div>
                  </div>
                  <button
                    onClick={handleFollow}
                    style={{
                      width: '100%', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      background: isFollowing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#00ff88,#00cc6a)',
                      border: isFollowing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      color: isFollowing ? '#94a3b8' : '#0a1929',
                    }}
                  >
                    {isFollowing ? 'Following ✓' : 'Follow'}
                  </button>
                </div>
              )}

              {/* Prize value */}
              <div style={{ ...card, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}>
                <div style={{ fontSize: 11, color: '#00ff88', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>PRIZE VALUE</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>${raffle.prize_value.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: '#00ff88', fontWeight: 600 }}>{raffle.prize_currency}</div>
              </div>

              {/* Progress */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Tickets Sold</span>
                  <span style={{ color: '#00ff88', fontWeight: 700 }}>{getProgressPercentage().toFixed(0)}%</span>
                </div>
                <div style={{ height: 8, background: '#0f1419', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#00ff88,#00cc6a)', borderRadius: 4, width: `${getProgressPercentage()}%`, transition: 'width 0.5s' }} />
                </div>
                <div style={{ textAlign: 'center', fontWeight: 700, color: '#fff', fontSize: 14 }}>
                  {raffle.tickets_sold.toLocaleString()} / {raffle.total_tickets.toLocaleString()}
                </div>
              </div>

              {/* Buy tickets */}
              <div style={card}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Buy Tickets</h3>

                {/* Country restriction notice */}
                {raffle.country_restriction && (
                  <div style={{ padding: '8px 12px', background: 'rgba(253,131,18,0.1)', border: '1px solid rgba(253,131,18,0.3)', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#fd8312' }}>
                    🌍 Only open to participants from <strong>{raffle.country_restriction}</strong>
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Quantity</label>
                  <input
                    type="number" min={1} max={raffle.total_tickets - raffle.tickets_sold}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '100%', padding: '10px 14px', background: '#0f1419', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Quick select */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
                  {[1, 10, 50, 100].map(n => (
                    <button key={n} onClick={() => setQuantity(n)} style={{ padding: '8px 0', background: quantity === n ? '#00ff88' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: quantity === n ? '#0a1929' : '#94a3b8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      {n}
                    </button>
                  ))}
                </div>

                {/* Pricing summary */}
                <div style={{ padding: 14, background: 'rgba(0,0,0,0.3)', borderRadius: 10, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#64748b', fontSize: 13 }}>Price per ticket</span>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>{getTicketPrice()} USDC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#fff', fontWeight: 700 }}>Total</span>
                    <span style={{ color: '#00ff88', fontWeight: 700, fontSize: 18 }}>{calculatePrice(quantity).toFixed(2)} USDC</span>
                  </div>
                </div>

                {/* Odds */}
                <div style={{ padding: 12, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 10, marginBottom: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Your Winning Odds</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{getOdds()}%</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {quantity} ticket{quantity !== 1 ? 's' : ''} of {(raffle.total_tickets - raffle.tickets_sold).toLocaleString()} remaining
                  </div>
                </div>

                {/* Wallet connect */}
                <div style={{ marginBottom: 12 }}>
                  <WalletConnect onConnect={setWalletAddress} />
                </div>

                {/* Error / success */}
                {buyError && (
                  <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 10 }}>
                    {buyError}
                  </div>
                )}
                {buySuccess && (
                  <div style={{ padding: '10px 12px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8, fontSize: 12, color: '#00ff88', marginBottom: 10 }}>
                    {buySuccess}
                  </div>
                )}

                <button
                  onClick={handleBuyTickets}
                  disabled={buying || raffle.status !== 'active' || !walletAddress}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: buying || raffle.status !== 'active' || !walletAddress ? 'not-allowed' : 'pointer',
                    background: buying || raffle.status !== 'active' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#00ff88,#00cc6a)',
                    border: 'none', color: buying || raffle.status !== 'active' ? '#64748b' : '#0a1929',
                  }}
                >
                  {buying ? 'Processing...' : raffle.status !== 'active' ? 'Raffle Ended' : '🎟️ Buy Tickets'}
                </button>

                {!user && (
                  <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 10 }}>
                    <Link href="/login" style={{ color: '#00ff88' }}>Sign in</Link> to buy tickets
                  </p>
                )}
              </div>

              {/* Early bird */}
              {raffle.early_bird_expired === false && raffle.early_bird_discount && (
                <div style={{ ...card, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}>
                  <div style={{ fontWeight: 700, color: '#00ff88', marginBottom: 4 }}>🐦 Early Bird Active!</div>
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                    First {raffle.early_bird_percentage}% of tickets get {raffle.early_bird_discount}% off!
                  </p>
                </div>
              )}

              {/* Share */}
              <div style={card}>
                <ShareButtons
                  url={`https://www.onagui.com/raffles/${raffle.id}`}
                  title={`Win ${raffle.title} worth $${raffle.prize_value.toLocaleString()} on Onagui!`}
                  description={raffle.description}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
