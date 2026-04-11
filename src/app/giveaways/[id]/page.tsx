'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'
import ShareGiveaway from '@/components/ShareGiveaway'
import WinnerDisplay from '@/components/WinnerDisplay'
import { payWithUSDC, isOnPolygon } from '@/lib/wallet'

type FailedEntryAttempt = {
  entryType: 'free' | 'paid'
  idempotencyKey: string
  paymentConfirmed: boolean
  paymentTxHash: string | null
}

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

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
  creator_id?: string | null
  creator_name?: string | null
  creator_avatar_url?: string | null
  paid_ticket_count?: number
  paid_ticket_revenue?: number
  prize_boost?: number
  onagui_subs?: number
}

const CARD_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop'
const PROFILE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop'

export default function GiveawayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [entering, setEntering] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [freeTicketsClaimed, setFreeTicketsClaimed] = useState(0)
  const [preferredEntryType, setPreferredEntryType] = useState<'free' | 'paid'>('free')
  const [quantity] = useState(1)
  const [entryError, setEntryError] = useState<string | null>(null)
  const [entrySuccess, setEntrySuccess] = useState<string | null>(null)
  const [failedEntryAttempt, setFailedEntryAttempt] = useState<FailedEntryAttempt | null>(null)

  useEffect(() => {
    checkAuth()
    fetchGiveaway()
  }, [params.id])

  useEffect(() => {
    const entryIntent = searchParams.get('entry')
    if (entryIntent === 'paid') {
      setPreferredEntryType('paid')
      setTimeout(() => {
        const paidSection = document.getElementById('paid-entry-section')
        paidSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 80)
    } else {
      setPreferredEntryType('free')
    }
  }, [searchParams])

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

      const { data: paidTickets } = await supabase
        .from('tickets')
        .select('quantity')
        .eq('giveaway_id', data.id)
        .eq('is_free', false)

      let creator: { id: string; username: string | null; full_name: string | null; avatar_url: string | null } | null = null
      if (data.creator_id) {
        const { data: creatorData } = await supabase
          .from('onagui_profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', data.creator_id)
          .maybeSingle()
        creator = creatorData || null
      }

      const paidCount = (paidTickets || []).reduce((sum, row) => sum + (row.quantity || 1), 0)
      const paidRevenue = paidCount * (data.ticket_price || 0)

      const enrichedGiveaway: Giveaway = {
        ...data,
        creator_name: creator?.full_name || creator?.username || null,
        creator_avatar_url: creator?.avatar_url || null,
        paid_ticket_count: paidCount,
        paid_ticket_revenue: paidRevenue,
        prize_boost: paidRevenue * 0.4,
        onagui_subs: paidRevenue * 0.1,
      }

      setFreeTicketsClaimed(claimedFreeTickets)
      setGiveaway(enrichedGiveaway)
    } catch (error) {
      console.error('Error fetching giveaway:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnter(entryType: 'free' | 'paid', retryAttempt?: FailedEntryAttempt) {
    if (!user) {
      router.push('/login')
      return
    }

    if (!giveaway) return

    setEntryError(null)
    setEntrySuccess(null)

    if (entryType === 'paid') {
      if (!walletAddress) {
        setEntryError('Please connect your wallet first')
        return
      }

      const onPolygon = await isOnPolygon()
      if (!onPolygon) {
        setEntryError('Please switch to Polygon network')
        return
      }
    }

    setEntering(true)
    const idempotencyKey = retryAttempt?.idempotencyKey || createIdempotencyKey()
    let paymentConfirmed = retryAttempt?.paymentConfirmed || false
    let paymentTxHash = retryAttempt?.paymentTxHash || null

    setFailedEntryAttempt({
      entryType,
      idempotencyKey,
      paymentConfirmed,
      paymentTxHash,
    })

    try {
      if (entryType === 'paid' && !paymentConfirmed) {
        const paymentResult = await payWithUSDC(1)
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed')
        }
        paymentConfirmed = true
        paymentTxHash = paymentResult.txHash || null
      }

      const response = await fetch(`/giveaways/${giveaway.id}/api/entries/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ giveawayId: giveaway.id, entryType, paymentTxHash }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Entry failed')
      }

      setEntrySuccess(result.message || 'Entry successful!')
      setFailedEntryAttempt(null)
      
      // Refresh giveaway data
      await fetchGiveaway()
    } catch (error: unknown) {
      console.error('Entry error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      setEntryError(`Failed to enter: ${message}`)
      setFailedEntryAttempt({
        entryType,
        idempotencyKey,
        paymentConfirmed,
        paymentTxHash,
      })
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #020617, #172554, #0f172a)' }}>
      {/* Back nav */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 16px' }}>
        <Link href="/giveaways" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
          ← Back to Giveaways
        </Link>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 48px' }}>
        <div className="giveaway-detail-grid" style={{ display: 'grid', gap: 32 }}>
          {/* Left - Image & Description */}
          <div className="giveaway-detail-left" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-slate-800 to-slate-900">
                {giveaway.image_url ? (
                  <Image src={giveaway.image_url} alt={giveaway.title} fill className="object-cover" />
                ) : (
                  <Image src={CARD_FALLBACK_IMAGE} alt={giveaway.title} fill className="object-cover" />
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={giveaway.creator_avatar_url || PROFILE_FALLBACK_IMAGE}
                  alt={giveaway.creator_name || 'Creator'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="text-slate-400 text-sm">by</div>
                  <div className="text-white font-semibold">{giveaway.creator_name || 'ONAGUI'}</div>
                </div>
                <div className="ml-auto text-cyan-400 text-sm font-semibold">
                  {Math.round(giveaway.onagui_subs || 0)} subs
                </div>
              </div>
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
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-6">
              <div className="text-sm text-green-400 mb-2">Prize Value</div>
              <div className="text-4xl font-black text-white mb-1">
                ${giveaway.prize_value.toLocaleString()}
              </div>
              <div className="text-green-400 font-semibold">{giveaway.prize_currency}</div>
              <div className="text-xs text-slate-400 mt-2">
                Prize boost: ${giveaway.prize_value.toLocaleString()} → ${(giveaway.prize_value + (giveaway.prize_boost || 0)).toLocaleString()}
              </div>
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
                  onClick={() => {
                    setPreferredEntryType('free')
                    handleEnter('free')
                  }}
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

              <div
                id="paid-entry-section"
                className={`mb-4 ${preferredEntryType === 'paid' ? 'ring-2 ring-blue-500/60 rounded-xl p-2' : ''}`}
              >
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
                  onClick={() => {
                    setPreferredEntryType('paid')
                    handleEnter('paid')
                  }}
                  disabled={entering || giveaway.status !== 'active' || !walletAddress}
                  className="w-full py-4 hover:brightness-110 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl text-lg transition-all disabled:cursor-not-allowed"
                  style={{ background: entering || giveaway.status !== 'active' ? '#334155' : '#0ea5e9', color: '#fff' }}
                >
                  {entering ? 'Processing...' : preferredEntryType === 'paid' ? 'Buy Ticket 1 USDC (Selected)' : 'Buy Ticket 1 USDC'}
                </button>

                {entryError && (
                  <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                    <div>{entryError}</div>
                    {failedEntryAttempt && !entering && (
                      <button
                        onClick={() => handleEnter(failedEntryAttempt.entryType, failedEntryAttempt)}
                        className="mt-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-500/30"
                      >
                        Retry Last Attempt
                      </button>
                    )}
                  </div>
                )}

                {entrySuccess && (
                  <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    {entrySuccess}
                  </div>
                )}
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
