'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'
import { payWithUSDC, isOnPolygon, getCurrentWallet } from '@/lib/wallet'

type Raffle = {
  id: string
  title: string
  description: string
  emoji: string
  image_urls: string[]
  prize_description: string
  prize_value: number
  prize_currency: string
  total_tickets: number
  tickets_sold: number
  base_ticket_price: number
  tier_2_threshold: number
  tier_2_discount: number
  tier_3_threshold: number
  tier_3_discount: number
  tier_4_threshold: number
  tier_4_discount: number
  early_bird_percentage: number
  early_bird_discount: number
  early_bird_expired: boolean
  is_powered_by_onagui: boolean
  country: string | null
  tags: string[]
  status: string
  creator_id: string
  view_count: number
  created_at: string
}

type Creator = {
  display_name: string
  avatar_url: string | null
  verification_level: string
  follower_count: number
  total_raffles_completed: number
  average_rating: number
}

type Activity = {
  id: string
  message: string
  created_at: string
}

export default function RaffleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isFollowing, setIsFollowing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [buying, setBuying] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    fetchRaffle()
    incrementView()
  }, [params.id])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      checkIfFollowing(session.user.id)
    }
  }

  async function checkIfFollowing(userId: string) {
    if (!raffle) return
    
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', raffle.creator_id)
      .single()
    
    setIsFollowing(!!data)
  }

  async function incrementView() {
    try {
      await supabase.from('raffle_views').insert({
        raffle_id: params.id as string,
        user_id: user?.id || null,
        viewed_at: new Date().toISOString()
      })
    } catch (error) {
      // Ignore errors for views
    }
  }

  async function fetchRaffle() {
    try {
      const { data: raffleData, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      if (!raffleData) {
        router.push('/raffles')
        return
      }

      setRaffle(raffleData)

      // Fetch creator
      const { data: creatorProfile } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', raffleData.creator_id)
        .single()

      if (creatorProfile) {
        setCreator(creatorProfile)
      }

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('activity_feed')
        .select('id, message, created_at')
        .eq('raffle_id', params.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10)

      setActivities(activityData || [])

      if (user) {
        checkIfFollowing(user.id)
      }
    } catch (error) {
      console.error('Error fetching raffle:', error)
      router.push('/raffles')
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow() {
    if (!user) {
      router.push('/login')
      return
    }

    if (!raffle) return

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', raffle.creator_id)
        setIsFollowing(false)
      } else {
        await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: raffle.creator_id
        })
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error following:', error)
    }
  }

  function calculatePrice(qty: number): number {
    if (!raffle) return 0

    let basePrice = raffle.base_ticket_price
    let discount = 0

    // Tiered discount
    if (qty >= raffle.tier_4_threshold) {
      discount = raffle.tier_4_discount
    } else if (qty >= raffle.tier_3_threshold) {
      discount = raffle.tier_3_discount
    } else if (qty >= raffle.tier_2_threshold) {
      discount = raffle.tier_2_discount
    }

    // Early bird bonus
    if (!raffle.early_bird_expired) {
      discount += raffle.early_bird_discount
    }

    const pricePerTicket = basePrice * (1 - discount / 100)
    return pricePerTicket * qty
  }

  function getSavings(qty: number): number {
    if (!raffle) return 0
    const originalPrice = raffle.base_ticket_price * qty
    const finalPrice = calculatePrice(qty)
    return originalPrice - finalPrice
  }

  async function handleBuyTickets() {
    if (!user) {
      router.push('/login')
      return
    }

    if (!raffle || quantity < 1) return

    // Check wallet connection
    const wallet = await getCurrentWallet()
    if (!wallet) {
      alert('Please connect your wallet first')
      return
    }

    const onPolygon = await isOnPolygon()
    if (!onPolygon) {
      alert('Please switch to Polygon network')
      return
    }

    setBuying(true)

    try {
      const totalPrice = calculatePrice(quantity)
      
      // Process USDC payment
      const paymentResult = await payWithUSDC(totalPrice)
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed')
      }

      // Generate ticket numbers
      const ticketNumbers: number[] = []
      for (let i = 0; i < quantity; i++) {
        ticketNumbers.push(raffle.tickets_sold + i + 1)
      }

      // Save tickets to database
      const { error: ticketError } = await supabase
        .from('raffle_tickets')
        .insert({
          raffle_id: raffle.id,
          user_id: user.id,
          ticket_numbers: ticketNumbers,
          quantity: quantity,
          original_price: raffle.base_ticket_price * quantity,
          discount_applied: getSavings(quantity) / (raffle.base_ticket_price * quantity) * 100,
          final_price: totalPrice,
          transaction_hash: paymentResult.txHash,
          payment_currency: 'USDC',
          blockchain: 'Polygon',
        })

      if (ticketError) throw ticketError

      alert(`Success! You purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!\n\nYour ticket numbers: ${ticketNumbers.join(', ')}`)
      
      // Refresh raffle
      await fetchRaffle()
    } catch (error: any) {
      console.error('Error buying tickets:', error)
      alert(`Failed to purchase tickets: ${error.message || 'Unknown error'}`)
    } finally {
      setBuying(false)
    }
  }

  const getProgressPercentage = () => {
    if (!raffle) return 0
    return Math.min((raffle.tickets_sold / raffle.total_tickets) * 100, 100)
  }

  const getOdds = () => {
    if (!raffle) return '0'
    return ((quantity / (raffle.total_tickets - raffle.tickets_sold)) * 100).toFixed(4)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-white mb-2">Raffle Not Found</h3>
          <Link href="/raffles" className="text-blue-400 hover:underline">
            Back to Raffles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/raffles" className="text-blue-400 hover:text-blue-300 font-semibold">
              ← Back to Raffles
            </Link>
            <Link href="/">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Powered by Onagui Badge */}
            {raffle.is_powered_by_onagui && (
              <div className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div>
                  <div className="text-white font-bold">Powered by Onagui</div>
                  <div className="text-yellow-100 text-sm">Verified & secured by the platform</div>
                </div>
              </div>
            )}

            {/* Image Gallery */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-slate-800 to-slate-900">
                {raffle.image_urls && raffle.image_urls.length > 0 ? (
                  <Image
                    src={raffle.image_urls[selectedImage]}
                    alt={raffle.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-9xl">
                    {raffle.emoji}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {raffle.image_urls && raffle.image_urls.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {raffle.image_urls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-blue-500' : 'border-slate-700'
                      }`}
                    >
                      <Image src={url} alt={`${raffle.title} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
              <h1 className="text-4xl font-black text-white mb-4">{raffle.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{raffle.description}</p>
              
              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-xl font-bold text-white mb-3">Prize Details</h3>
                <p className="text-slate-400">{raffle.prize_description}</p>
              </div>

              {/* Tags */}
              {raffle.tags && raffle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {raffle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                📊 Live Activity
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-slate-500 text-sm">No activity yet</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                      <div className="text-2xl">🎟️</div>
                      <div className="flex-1">
                        <p className="text-slate-300 text-sm">{activity.message}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase & Stats */}
          <div className="space-y-6">
            {/* Creator Card */}
            {creator && (
              <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {creator.avatar_url ? (
                      <Image src={creator.avatar_url} alt={creator.display_name} width={64} height={64} className="rounded-full" />
                    ) : (
                      creator.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{creator.display_name}</span>
                      {creator.verification_level !== 'none' && (
                        <span className="text-blue-400">✓</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">
                      {creator.follower_count} followers
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">Raffles</div>
                    <div className="text-xl font-bold text-white">{creator.total_raffles_completed}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">Rating</div>
                    <div className="text-xl font-bold text-yellow-400">⭐ {creator.average_rating.toFixed(1)}</div>
                  </div>
                </div>

                <button
                  onClick={handleFollow}
                  disabled={!user}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    isFollowing
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            )}

            {/* Prize Value */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-3xl p-6">
              <div className="text-sm text-yellow-400 mb-2">Prize Value</div>
              <div className="text-4xl font-black text-white mb-1">
                ${raffle.prize_value.toLocaleString()}
              </div>
              <div className="text-yellow-400 font-semibold">{raffle.prize_currency}</div>
            </div>

            {/* Progress */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Tickets Sold</span>
                <span className="text-blue-400 font-bold">
                  {getProgressPercentage().toFixed(0)}%
                </span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="text-center text-white font-bold text-lg">
                {raffle.tickets_sold.toLocaleString()} / {raffle.total_tickets.toLocaleString()}
              </div>
            </div>

            {/* Buy Tickets */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Buy Tickets</h3>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={raffle.total_tickets - raffle.tickets_sold}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Select */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[1, 10, 50, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Pricing */}
              <div className="mb-4 p-4 bg-slate-800/50 rounded-xl space-y-2">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Base Price</span>
                  <span>${(raffle.base_ticket_price * quantity).toFixed(2)}</span>
                </div>
                {getSavings(quantity) > 0 && (
                  <div className="flex justify-between text-green-400 text-sm font-semibold">
                    <span>💰 You Save</span>
                    <span>-${getSavings(quantity).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-slate-700">
                  <span>Total</span>
                  <span>${calculatePrice(quantity).toFixed(2)} USDC</span>
                </div>
              </div>

              {/* Your Odds */}
              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-xl">
                <div className="text-sm text-blue-400 mb-1">Your Winning Odds</div>
                <div className="text-2xl font-black text-white">{getOdds()}%</div>
                <div className="text-xs text-slate-400 mt-1">
                  {quantity} ticket{quantity !== 1 ? 's' : ''} out of {(raffle.total_tickets - raffle.tickets_sold).toLocaleString()} remaining
                </div>
              </div>

              {/* Wallet Connect */}
              <div className="mb-4">
                <WalletConnect onConnect={setWalletAddress} />
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuyTickets}
                disabled={buying || raffle.status !== 'active' || !walletAddress}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl text-lg transition-all disabled:cursor-not-allowed"
              >
                {buying ? 'Processing...' : raffle.status !== 'active' ? 'Raffle Ended' : 'Buy Tickets 🎟️'}
              </button>

              {!user && (
                <p className="text-center text-sm text-slate-400 mt-3">
                  <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link> to buy tickets
                </p>
              )}
            </div>

            {/* Discount Info */}
            {!raffle.early_bird_expired && (
              <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
                <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                  🐦 Early Bird Active!
                </div>
                <p className="text-sm text-slate-300">
                  First {raffle.early_bird_percentage}% of tickets get extra {raffle.early_bird_discount}% off!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
