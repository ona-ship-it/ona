'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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
  share_code: string
  creator_id: string
  free_ticket_limit: number | null
}

export default function ShareLandingPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [user, setUser] = useState<any>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    checkUser()
    fetchGiveaway()
  }, [params.code])

  async function checkUser() {
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
        .eq('share_code', params.code)
        .single()

      if (error || !data) {
        router.push('/')
        return
      }

      setGiveaway(data)
      
      // Track click
      await trackClick(data.id)
    } catch (error) {
      console.error('Error:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function trackClick(giveawayId: string) {
    await supabase.from('giveaway_referrals').insert({
      giveaway_id: giveawayId,
      share_code: params.code as string,
      clicked_at: new Date().toISOString(),
    })
  }

  async function handleClaimTicket() {
    if (!user) {
      // Redirect to signup with return URL
      router.push(`/signup?ref=${params.code}&return=/share/${params.code}`)
      return
    }

    if (!giveaway) return

    setClaiming(true)

    try {
      // Check if user is verified
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single()

      if (!profile?.is_verified) {
        alert('Please verify your email first to claim free tickets!')
        setClaiming(false)
        return
      }

      // Check if already claimed
      const { data: existing, error: existingError } = await supabase
        .from('tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('giveaway_id', giveaway.id)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existing) {
        alert('You already have a ticket for this giveaway!')
        setClaiming(false)
        return
      }

      const freeTicketLimit = Number(giveaway.free_ticket_limit || 0)
      if (freeTicketLimit > 0) {
        const { count: claimedFreeTickets, error: freeCountError } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('giveaway_id', giveaway.id)
          .eq('is_free', true)

        if (freeCountError) {
          throw freeCountError
        }

        if ((claimedFreeTickets || 0) >= freeTicketLimit) {
          alert('Free tickets are fully claimed for this giveaway.')
          setClaiming(false)
          return
        }
      }

      // Create free ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          giveaway_id: giveaway.id,
          user_id: user.id,
          is_free: true,
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Update referral tracking
      await supabase
        .from('giveaway_referrals')
        .update({
          referred_user_id: user.id,
          signed_up_at: new Date().toISOString(),
          ticket_claimed_at: new Date().toISOString(),
          ticket_id: ticket.id,
        })
        .eq('share_code', params.code)
        .is('referred_user_id', null)
        .order('created_at', { ascending: true })
        .limit(1)

      setClaimed(true)
      
      setTimeout(() => {
        router.push(`/giveaways/${giveaway.id}`)
      }, 2000)
    } catch (error: any) {
      console.error('Error claiming ticket:', error)
      alert('Failed to claim ticket: ' + error.message)
    } finally {
      setClaiming(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">
              ONAGUI
            </h1>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {claimed ? (
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-12 text-center">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-4xl font-black text-white mb-4">Free Ticket Claimed!</h2>
            <p className="text-green-400 text-xl mb-6">
              You've successfully claimed your free ticket!
            </p>
            <p className="text-slate-400">Redirecting you to the giveaway...</p>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 mb-8 text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-3xl font-black text-white mb-2">You've Been Invited!</h2>
              <p className="text-blue-100 text-lg">
                Claim your FREE ticket to enter this giveaway
              </p>
            </div>

            {/* Giveaway Preview */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden mb-8">
              <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900">
                {giveaway.image_url ? (
                  <Image src={giveaway.image_url} alt={giveaway.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-9xl">{giveaway.emoji}</div>
                )}
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-black text-white mb-4">{giveaway.title}</h3>
                <p className="text-slate-300 text-lg mb-6">{giveaway.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-sm text-slate-400 mb-1">Prize Value</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      ${giveaway.prize_value.toLocaleString()} {giveaway.prize_currency}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="text-sm text-slate-400 mb-1">Total Entries</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {giveaway.tickets_sold.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <button
                  onClick={handleClaimTicket}
                  disabled={claiming}
                  className="w-full py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-2xl text-xl transition-all disabled:cursor-not-allowed shadow-xl shadow-green-500/50"
                >
                  {claiming ? 'Claiming...' : user ? 'Claim FREE Ticket' : 'Sign Up & Claim FREE Ticket'}
                </button>

                {!user && (
                  <p className="text-center text-slate-400 text-sm mt-4">
                    Already have an account? <Link href={`/login?ref=${params.code}&return=/share/${params.code}`} className="text-blue-400 hover:underline">Sign in</Link>
                  </p>
                )}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
              <h4 className="text-xl font-bold text-white mb-6 text-center">How It Works</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">1️⃣</div>
                  <h5 className="font-bold text-white mb-2">Sign Up</h5>
                  <p className="text-sm text-slate-400">Create your free Onagui account</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-3">2️⃣</div>
                  <h5 className="font-bold text-white mb-2">Verify Email</h5>
                  <p className="text-sm text-slate-400">Confirm your email address</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-3">3️⃣</div>
                  <h5 className="font-bold text-white mb-2">Get Ticket</h5>
                  <p className="text-sm text-slate-400">Claim your free entry automatically</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
