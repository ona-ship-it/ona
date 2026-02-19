'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'
import ShareGiveaway from '@/components/ShareGiveaway'
import WinnerDisplay from '@/components/WinnerDisplay'
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
  free_ticket_limit: number | null
  status: string
  end_date: string
  winner_id: string | null
  winner_drawn_at: string | null
  share_code: string | null
  share_url: string | null
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
  const [freeTicketsClaimed, setFreeTicketsClaimed] = useState(0)
  const [quantity] = useState(1)

  useEffect(() => {
    checkAuth()
    fetchGiveaway()
  }, [params.id])

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

      let claimedFreeTickets = 0
      if ((data.free_ticket_limit || 0) > 0) {
        const { count } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('giveaway_id', data.id)
          .eq('is_free', true)

        claimedFreeTickets = count || 0
      }

      setFreeTicketsClaimed(claimedFreeTickets)
      setGiveaway(data)
    } catch (error) {
      console.error('Error fetching giveaway:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnter(entryType: 'free' | 'paid') {
    if (!user) {
      router.push('/login')
      return
    }

    if (!giveaway) return

    if (entryType === 'paid') {
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
      if (entryType === 'paid') {
        const paymentResult = await payWithUSDC(1)
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed')
        }
      }

      const response = await fetch('/api/entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId: giveaway.id, entryType }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Entry failed')
      }

      alert(result.message || 'Entry successful!')
      
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
  const totalTicketsLabel = giveaway.total_tickets > 0 ? giveaway.total_tickets.toLocaleString() : 'Unlimited'
  const hasFreeTicketCap = (giveaway.free_ticket_limit || 0) > 0
  const freeTicketsRemaining = hasFreeTicketCap
    ? Math.max((giveaway.free_ticket_limit || 0) - freeTicketsClaimed, 0)
    : null

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
            {giveaway.share_code && giveaway.share_url && (
              <ShareGiveaway
                giveawayId={giveaway.id}
                shareCode={giveaway.share_code}
                shareUrl={giveaway.share_url}
                title={giveaway.title}
              />
            )}

            {/* Winner Display */}
            {giveaway.winner_id && giveaway.winner_drawn_at && (
              <WinnerDisplay
                giveawayId={giveaway.id}
                winnerId={giveaway.winner_id}
                winnerDrawnAt={giveaway.winner_drawn_at}
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
                <span className="text-white font-bold">{totalTicketsLabel}</span>
              </div>
            </div>

            {/* Entry Form */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Get Your Tickets</h3>

              <div className="mb-6">
                <div className="text-sm text-slate-400 mb-2">Free entry</div>
                <button
                  onClick={() => handleEnter('free')}
                  disabled={entering || giveaway.status !== 'active' || (hasFreeTicketCap && freeTicketsRemaining === 0)}
                  className="w-full py-4 hover:brightness-110 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl text-lg transition-all disabled:cursor-not-allowed"
                  style={{ background: entering || giveaway.status !== 'active' || (hasFreeTicketCap && freeTicketsRemaining === 0) ? '#334155' : '#00d4d4', color: entering || giveaway.status !== 'active' || (hasFreeTicketCap && freeTicketsRemaining === 0) ? '#fff' : '#0A0E13' }}
                >
                  {entering ? 'Processing...' : 'Claim Free Ticket'}
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  {hasFreeTicketCap
                    ? `${freeTicketsRemaining} free tickets remaining. One free ticket per user.`
                    : 'Unlimited free tickets available. One free ticket per user.'}
                </p>
              </div>

              <div className="mb-4">
                <div className="text-sm text-slate-400 mb-2">Paid entry</div>
                <div className="mb-4 p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex justify-between text-slate-400 text-sm mb-2">
                    <span>Price per ticket</span>
                    <span>$1 USDC</span>
                  </div>
                  <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-slate-700">
                    <span>Total</span>
                    <span>$1.00 USDC</span>
                  </div>
                </div>

                <div className="mb-4">
                  <WalletConnect onConnect={setWalletAddress} />
                </div>

                <button
                  onClick={() => handleEnter('paid')}
                  disabled={entering || giveaway.status !== 'active' || !walletAddress}
                  className="w-full py-4 hover:brightness-110 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl text-lg transition-all disabled:cursor-not-allowed"
                  style={{ background: entering || giveaway.status !== 'active' ? '#334155' : '#0ea5e9', color: '#fff' }}
                >
                  {entering ? 'Processing...' : 'Buy Ticket 1 USDC'}
                </button>
              </div>

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
