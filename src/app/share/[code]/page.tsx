'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
  end_date: string
  status: string
}

type SharePageProps = {
  params: {
    code: string
  }
}

export default function SharePage({ params }: SharePageProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [shareLink, setShareLink] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadShareLink()
  }, [params.code])

  async function loadShareLink() {
    try {
      // Get share link by code
      const { data: shareLinkData, error: linkError } = await supabase
        .from('share_links')
        .select('*')
        .eq('share_code', params.code)
        .single()

      if (linkError || !shareLinkData) {
        setError('Invalid share link')
        setLoading(false)
        return
      }

      setShareLink(shareLinkData)

      // Increment clicks
      await supabase
        .from('share_links')
        .update({ clicks: (shareLinkData.clicks || 0) + 1 })
        .eq('id', shareLinkData.id)

      // Get giveaway details
      const { data: giveawayData, error: giveawayError } = await supabase
        .from('giveaways')
        .select('*')
        .eq('id', shareLinkData.giveaway_id)
        .single()

      if (giveawayError || !giveawayData) {
        setError('Giveaway not found')
        setLoading(false)
        return
      }

      setGiveaway(giveawayData)

      // Check if user is logged in
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // If user is logged in, try to grant free ticket
      if (currentUser) {
        await grantFreeTicket(currentUser.id, shareLinkData, giveawayData)
      }

      setLoading(false)
    } catch (err: any) {
      console.error('Error loading share link:', err)
      setError('Failed to load share link')
      setLoading(false)
    }
  }

  async function grantFreeTicket(userId: string, shareLink: any, giveaway: any) {
    try {
      // Check if user is the creator (can't use own link)
      if (userId === shareLink.creator_id) {
        return
      }

      // Check if user already got free ticket for this giveaway
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('*')
        .eq('giveaway_id', giveaway.id)
        .eq('referred_user_id', userId)
        .single()

      if (existingReferral) {
        setSuccess('You already received your free ticket!')
        return
      }

      // Check if giveaway is still active
      if (giveaway.status !== 'active') {
        setError('This giveaway is no longer active')
        return
      }

      // Check if there are tickets available
      if (giveaway.tickets_sold >= giveaway.total_tickets) {
        setError('All tickets have been claimed')
        return
      }

      setProcessing(true)

      // Create free ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          giveaway_id: giveaway.id,
          user_id: userId,
          is_winner: false,
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          share_link_id: shareLink.id,
          giveaway_id: giveaway.id,
          referrer_id: shareLink.creator_id,
          referred_user_id: userId,
          ticket_granted: true,
          ticket_id: ticket.id,
        })

      if (referralError) throw referralError

      // Update share link stats
      await supabase
        .from('share_links')
        .update({
          signups: (shareLink.signups || 0) + 1,
          tickets_granted: (shareLink.tickets_granted || 0) + 1,
        })
        .eq('id', shareLink.id)

      // Update giveaway tickets_sold
      await supabase
        .from('giveaways')
        .update({
          tickets_sold: giveaway.tickets_sold + 1,
        })
        .eq('id', giveaway.id)

      setSuccess('🎉 Free ticket granted! Check your dashboard.')
      setProcessing(false)
    } catch (err: any) {
      console.error('Error granting free ticket:', err)
      setError('Failed to grant free ticket')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !giveaway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-red-500 rounded-3xl p-12 text-center max-w-lg">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Link</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
            Browse Giveaways
          </Link>
        </div>
      </div>
    )
  }

  if (!giveaway) return null

  const timeRemaining = () => {
    const now = new Date().getTime()
    const end = new Date(giveaway.end_date).getTime()
    const diff = end - now

    if (diff < 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-6 bg-green-500/20 border-2 border-green-500 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{success}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && giveaway && (
          <div className="mb-6 p-6 bg-red-500/20 border-2 border-red-500 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Giveaway Preview */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden mb-6">
          {/* Image */}
          {giveaway.image_url && (
            <div className="relative w-full h-64">
              <Image
                src={giveaway.image_url}
                alt={giveaway.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-6xl">{giveaway.emoji}</div>
              <div className="flex-1">
                <h2 className="text-3xl font-black text-white mb-3">{giveaway.title}</h2>
                <p className="text-slate-400 leading-relaxed">{giveaway.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-blue-400">
                  {giveaway.prize_currency === 'USD' ? '$' : ''}{giveaway.prize_value}
                </div>
                <div className="text-xs text-slate-400 mt-1">Prize Value</div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {giveaway.tickets_sold}/{giveaway.total_tickets}
                </div>
                <div className="text-xs text-slate-400 mt-1">Entries</div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-green-400">{timeRemaining()}</div>
                <div className="text-xs text-slate-400 mt-1">Time Left</div>
              </div>
            </div>

            {/* CTA */}
            {!user ? (
              <div className="space-y-3">
                <Link
                  href={`/signup?ref=${params.code}&giveaway=${giveaway.id}`}
                  className="block w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-center font-bold rounded-xl transition-all text-lg"
                >
                  🎁 Sign Up & Get FREE Ticket
                </Link>
                <p className="text-center text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link href={`/login?ref=${params.code}&giveaway=${giveaway.id}`} className="text-blue-400 hover:text-blue-300">
                    Log in
                  </Link>
                </p>
              </div>
            ) : processing ? (
              <div className="px-6 py-4 bg-slate-800 text-white text-center font-bold rounded-xl">
                Processing...
              </div>
            ) : (
              <Link
                href={`/giveaways/${giveaway.id}`}
                className="block w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold rounded-xl transition-all"
              >
                View Giveaway
              </Link>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">🎯 How It Works</h3>
          <div className="space-y-3 text-slate-300">
            <div className="flex items-start gap-3">
              <div className="text-2xl">1️⃣</div>
              <p>Sign up for a free ONAGUI account</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">2️⃣</div>
              <p>Receive 1 FREE ticket automatically</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">3️⃣</div>
              <p>Wait for the giveaway to end</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">4️⃣</div>
              <p>Winner announced automatically!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
