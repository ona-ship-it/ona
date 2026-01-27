'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'
import ShareGiveaway from '@/components/ShareGiveaway'
import { payWithUSDC, isOnPolygon } from '@/lib/wallet'

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

export default function GiveawayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [user, setUser] = useState<any>(null)
  const [entering, setEntering] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [shareCode, setShareCode] = useState('')

  useEffect(() => {
    checkAuth()
    fetchGiveaway()
  }, [params.id])

  useEffect(() => {
    if (user && giveaway) {
      generateShareCode()
    }
  }, [user, giveaway])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    }
  }

  async function fetchGiveaway() {
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/')
        return
      }

      setGiveaway(data)
    } catch (error) {
      console.error('Error fetching giveaway:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function generateShareCode() {
    if (!user || !giveaway) return

    // Generate unique share code
    const code = `${giveaway.id.slice(0, 8)}-${user.id.slice(0, 8)}`
    setShareCode(code)
  }

  async function handleEnter() {
    if (!user) {
      router.push('/login')
      return
    }

    if (!giveaway) return

    // If paid giveaway, require wallet
    if (!giveaway.is_free) {
      if (!walletAddress) {
        alert('Please connect your wallet first')
        return
      }

      const onPolygon = await isOnPolygon()
      if (!onPolygon) {
        alert('Please switch to Polygon network')
        return
      }
    }

    setEntering(true)

    try {
      let transactionHash = null

      // Handle payment for paid giveaways
      if (!giveaway.is_free && giveaway.ticket_price > 0) {
        const totalAmount = giveaway.ticket_price * quantity
        
        const paymentResult = await payWithUSDC(totalAmount)
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed')
        }

        transactionHash = paymentResult.txHash
      }

      // Create tickets
      for (let i = 0; i < quantity; i++) {
        const { error: ticketError } = await supabase
          .from('tickets')
          .insert({
            giveaway_id: giveaway.id,
            user_id: user.id,
            is_free: giveaway.is_free,
          })

        if (ticketError) throw ticketError
      }

      // Record transaction if paid
      if (!giveaway.is_free && transactionHash) {
        await supabase.from('transactions').insert({
          user_id: user.id,
          giveaway_id: giveaway.id,
          amount: giveaway.ticket_price * quantity,
          currency: 'USDC',
          status: 'completed',
          transaction_hash: transactionHash,
          blockchain: 'Polygon',
        })
      }

      alert(`Success! You've entered the giveaway with ${quantity} ticket${quantity > 1 ? 's' : ''}!`)
      
      // Refresh giveaway data
      await fetchGiveaway()
    } catch (error: any) {
      console.error('Entry error:', error)
      alert(`Failed to enter: ${error.message || 'Unknown error'}`)
    } finally {
      setEntering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!giveaway) return null

  const timeRemaining = new Date(giveaway.end_date).getTime() - new Date().getTime()
  const daysLeft = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold">
              ← Back to Giveaways
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
          {/* Left - Image & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-slate-800 to-slate-900">
                {giveaway.image_url ? (
                  <Image src={giveaway.image_url} alt={giveaway.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-9xl">{giveaway.emoji}</div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
              <h1 className="text-4xl font-black text-white mb-4">{giveaway.title}</h1>
              <p className="text-slate-300 text-lg">{giveaway.description}</p>
            </div>

            {/* Share Component */}
            {user && shareCode && (
              <ShareGiveaway
                giveawayId={giveaway.id}
                shareCode={shareCode}
                shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareCode}`}
                title={giveaway.title}
              />
            )}
          </div>

          {/* Right - Entry Panel */}
          <div className="space-y-6">
            {/* Prize Value */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-3xl p-6">
              <div className="text-sm text-yellow-400 mb-2">Prize Value</div>
              <div className="text-4xl font-black text-white mb-1">
                ${giveaway.prize_value.toLocaleString()}
              </div>
              <div className="text-yellow-400 font-semibold">{giveaway.prize_currency}</div>
            </div>

            {/* Timer */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
              <div className="text-sm text-slate-400 mb-2">Time Remaining</div>
              <div className="text-3xl font-black text-white">
                {daysLeft}d {hoursLeft}h
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Entries</span>
                <span className="text-white font-bold">{giveaway.tickets_sold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Tickets</span>
                <span className="text-white font-bold">{giveaway.total_tickets.toLocaleString()}</span>
              </div>
            </div>

            {/* Entry Form */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {giveaway.is_free ? 'Enter Free' : 'Buy Tickets'}
              </h3>

              {!giveaway.is_free && (
                <>
                  {/* Quantity Selector */}
                  <div className="mb-4">
                    <label className="text-sm text-slate-400 mb-2 block">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Price */}
                  <div className="mb-4 p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex justify-between text-slate-400 text-sm mb-2">
                      <span>Price per ticket</span>
                      <span>${giveaway.ticket_price} USDC</span>
                    </div>
                    <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-slate-700">
                      <span>Total</span>
                      <span>${(giveaway.ticket_price * quantity).toFixed(2)} USDC</span>
                    </div>
                  </div>

                  {/* Wallet Connect */}
                  <div className="mb-4">
                    <WalletConnect onConnect={setWalletAddress} />
                  </div>
                </>
              )}

              {/* Enter Button */}
              <button
                onClick={handleEnter}
                disabled={entering || giveaway.status !== 'active' || (!giveaway.is_free && !walletAddress)}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl text-lg transition-all disabled:cursor-not-allowed"
              >
                {entering ? 'Processing...' : giveaway.is_free ? 'Enter Free' : `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </button>

              {!user && (
                <p className="text-center text-sm text-slate-400 mt-3">
                  <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link> to enter
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
