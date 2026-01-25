'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/hooks/useWallet'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import WalletModal from '@/components/WalletModal'

type Giveaway = {
  id: string
  creator_id: string
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
  blockchain: string
  status: string
  end_date: string
  created_at: string
}

type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
}

export default function GiveawayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const { isConnected, address, disconnect } = useWallet()
  const router = useRouter()
  const supabase = createClient()

  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [creator, setCreator] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [entrySuccess, setEntrySuccess] = useState(false)
  const [error, setError] = useState('')
  const [userTicketCount, setUserTicketCount] = useState(0)

  useEffect(() => {
    if (resolvedParams.id) {
      fetchGiveaway()
    }
  }, [resolvedParams.id])

  const fetchGiveaway = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data: giveawayData, error: giveawayError } = await supabase
        .from('giveaways')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (giveawayError) throw giveawayError
      if (!giveawayData) throw new Error('Giveaway not found')

      setGiveaway(giveawayData)

      const { data: creatorData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', giveawayData.creator_id)
        .single()

      if (creatorData) setCreator(creatorData)

      if (user) {
        const { count } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('giveaway_id', resolvedParams.id)
          .eq('user_id', user.id)

        setUserTicketCount(count || 0)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load giveaway')
    } finally {
      setLoading(false)
    }
  }

  const handleEnter = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!giveaway) return

    if (giveaway.is_free) {
      await processFreeEntry()
    } else {
      setShowWalletModal(true)
    }
  }

  const processFreeEntry = async () => {
    if (!giveaway) return
    setEntering(true)
    setError('')

    try {
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          giveaway_id: giveaway.id,
          user_id: user!.id,
          purchase_price: 0,
          payment_currency: 'FREE',
          payment_method: 'free',
        }])

      if (ticketError) throw ticketError

      await supabase.from('transactions').insert([{
        user_id: user!.id,
        giveaway_id: giveaway.id,
        transaction_type: 'ticket_purchase',
        amount: 0,
        currency: 'FREE',
        payment_method: 'free',
        status: 'completed',
      }])

      setEntrySuccess(true)
      await fetchGiveaway()
    } catch (err: any) {
      setError(err.message || 'Failed to enter giveaway')
    } finally {
      setEntering(false)
    }
  }

  const handleWalletConnect = async (walletType: 'metamask' | 'phantom', selectedNetwork: string) => {
    if (!giveaway) return
    setEntering(true)
    setError('')

    try {
      await processPayment()
    } catch (err: any) {
      setError(err.message || 'Payment failed')
    } finally {
      setEntering(false)
    }
  }

  const processPayment = async () => {
    if (!giveaway || !address) return
    setError('Crypto payments will be enabled soon! Wallet connected successfully.')
    setShowWalletModal(false)
  }

  const getTimeRemaining = () => {
    if (!giveaway) return ''
    const end = new Date(giveaway.end_date).getTime()
    const now = new Date().getTime()
    const diff = end - now

    if (diff <= 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading giveaway...</p>
        </div>
      </div>
    )
  }

  if (error || !giveaway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤷</div>
          <h2 className="text-2xl font-bold text-white mb-2">Giveaway Not Found</h2>
          <p className="text-slate-400 mb-2">This giveaway doesn't exist or has been removed.</p>
          {error && <p className="text-red-400 text-sm mb-6">Error: {error}</p>}
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
            Browse Giveaways
          </Link>
        </div>
      </div>
    )
  }

  const progress = (giveaway.tickets_sold / giveaway.total_tickets) * 100
  const isSoldOut = giveaway.tickets_sold >= giveaway.total_tickets
  const isEnded = new Date(giveaway.end_date) < new Date()
  const canEnter = !isSoldOut && !isEnded && giveaway.status === 'active'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>
            <div className="flex items-center gap-3">
              {isConnected && address && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/50 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-semibold">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <button onClick={disconnect} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>
              )}
              {user ? (
                <Link href="/profile" className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </Link>
              ) : (
                <Link href="/login" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {entrySuccess && (
          <div className="mb-8 p-6 bg-green-500/10 border-2 border-green-500 rounded-2xl animate-bounce">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎉</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">You're In!</h3>
                <p className="text-green-400">Your entry has been confirmed. Good luck!</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-3xl overflow-hidden">
              {giveaway.image_url ? (
                <Image src={giveaway.image_url} alt={giveaway.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-9xl">{giveaway.emoji}</div>
              )}
              <div className="absolute top-6 left-6 flex gap-3">
                <div className="px-4 py-2 bg-slate-900/90 backdrop-blur rounded-xl text-white font-semibold">
                  ⏰ {getTimeRemaining()}
                </div>
                {!giveaway.is_free && (
                  <div className="px-4 py-2 bg-yellow-600/90 backdrop-blur rounded-xl text-white font-semibold">💰 Paid Entry</div>
                )}
              </div>
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎫</div>
                    <h3 className="text-3xl font-bold text-white">Sold Out!</h3>
                  </div>
                </div>
              )}
              {isEnded && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⏱️</div>
                    <h3 className="text-3xl font-bold text-white">Giveaway Ended</h3>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
              <h1 className="text-4xl font-black text-white mb-4">{giveaway.title}</h1>
              <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">{giveaway.description}</p>
            </div>

            {creator && (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {creator.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-500 mb-1">Hosted by</div>
                    <div className="text-xl font-bold text-white">{creator.full_name || 'Anonymous'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <div className="text-sm text-green-400 mb-2">Prize Value</div>
              <div className="text-5xl font-black text-white mb-2">${giveaway.prize_value.toLocaleString()}</div>
              <div className="text-slate-400">{giveaway.prize_currency}</div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Entries</span>
                  <span className="text-white font-bold">
                    {giveaway.tickets_sold.toLocaleString()} / {giveaway.total_tickets.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{progress.toFixed(1)}% filled</div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400">Entry Price</span>
                  <span className="text-white font-bold text-lg">
                    {giveaway.is_free ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      `${giveaway.ticket_price} ${giveaway.ticket_currency}`
                    )}
                  </span>
                </div>
                {!giveaway.is_free && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Blockchain</span>
                    <span className="text-white font-semibold capitalize">{giveaway.blockchain}</span>
                  </div>
                )}
              </div>

              {userTicketCount > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-xl">
                    <div className="text-sm text-blue-400 mb-1">Your Entries</div>
                    <div className="text-2xl font-bold text-white">{userTicketCount}</div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleEnter}
              disabled={entering || !canEnter}
              className={`w-full py-6 px-8 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                !canEnter ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : entering ? 'bg-blue-600 text-white opacity-50' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 shadow-blue-500/50'
              }`}
            >
              {entering ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : !user ? (
                'Sign In to Enter'
              ) : isSoldOut ? (
                'Sold Out'
              ) : isEnded ? (
                'Giveaway Ended'
              ) : giveaway.is_free ? (
                '🎁 Enter for FREE'
              ) : (
                `💰 Enter for ${giveaway.ticket_price} ${giveaway.ticket_currency}`
              )}
            </button>

            {!user && (
              <p className="text-center text-sm text-slate-400">Create an account or sign in to participate</p>
            )}
          </div>
        </div>
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
        requiredNetwork={giveaway?.blockchain as any}
      />
    </div>
  )
}
