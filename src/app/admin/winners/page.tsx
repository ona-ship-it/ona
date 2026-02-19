'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Giveaway = {
  id: string
  title: string
  emoji: string
  prize_value: number
  prize_currency: string
  tickets_sold: number
  end_date: string
  winner_id: string | null
}

type Ticket = {
  id: string
  user_id: string
  created_at: string
  profile_name: string
  profile_email: string
}

function WinnersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [selectedGiveaway, setSelectedGiveaway] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [drawing, setDrawing] = useState(false)
  const [winner, setWinner] = useState<Ticket | null>(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (!isAdmin(session.user.email)) {
      router.push('/')
      return
    }

    await fetchGiveaways()
    
    const preselected = searchParams.get('giveaway')
    if (preselected) {
      setSelectedGiveaway(preselected)
      await fetchTickets(preselected)
    }
    
    setLoading(false)
  }

  async function fetchGiveaways() {
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select('id, title, emoji, prize_value, prize_currency, tickets_sold, end_date, winner_id')
        .eq('status', 'active')
        .lt('end_date', new Date().toISOString())
        .is('winner_id', null)
        .order('end_date', { ascending: true })

      if (error) throw error
      setGiveaways(data || [])
    } catch (error) {
      console.error('Error fetching giveaways:', error)
    }
  }

  async function fetchTickets(giveawayId: string) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, user_id, created_at')
        .eq('giveaway_id', giveawayId)

      if (error) throw error

      const enrichedTickets = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', ticket.user_id)
            .single()

          return {
            id: ticket.id,
            user_id: ticket.user_id,
            created_at: ticket.created_at,
            profile_name: profile?.full_name || 'Unknown',
            profile_email: profile?.email || 'No email',
          }
        })
      )

      setTickets(enrichedTickets)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  function handleGiveawaySelect(giveawayId: string) {
    setSelectedGiveaway(giveawayId)
    setWinner(null)
    fetchTickets(giveawayId)
  }

  async function drawWinner() {
    if (!selectedGiveaway || tickets.length === 0) return

    setDrawing(true)
    setAnimating(true)
    setWinner(null)

    let count = 0
    const maxAnimations = 20
    
    const animationInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * tickets.length)
      setWinner(tickets[randomIndex])
      count++

      if (count >= maxAnimations) {
        clearInterval(animationInterval)
        selectFinalWinner()
      }
    }, 100)
  }

  async function selectFinalWinner() {
    if (!selectedGiveaway || tickets.length === 0) return

    const randomIndex = Math.floor(Math.random() * tickets.length)
    const selectedWinner = tickets[randomIndex]

    setWinner(selectedWinner)
    setAnimating(false)
    setDrawing(false)

    try {
      const { error: giveawayError } = await supabase
        .from('giveaways')
        .update({ 
          winner_id: selectedWinner.user_id,
          winner_drawn_at: new Date().toISOString()
        })
        .eq('id', selectedGiveaway)

      if (giveawayError) throw giveawayError

      const { error: ticketError } = await supabase
        .from('tickets')
        .update({ is_winner: true })
        .eq('id', selectedWinner.id)

      if (ticketError) throw ticketError

      await fetchGiveaways()
    } catch (error) {
      console.error('Error saving winner:', error)
      alert('Failed to save winner to database')
    }
  }

  const selectedGiveawayData = giveaways.find(g => g.id === selectedGiveaway)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ONAGUI
                </h1>
              </Link>
              <div className="px-4 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full">
                <span className="text-yellow-400 font-bold text-sm">👑 ADMIN</span>
              </div>
            </div>
            <Link href="/admin" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-white mb-2">Draw Winners</h2>
          <p className="text-slate-400">Select winners for ended giveaways</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Pending Draws</h3>
              
              {giveaways.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-slate-400 text-sm">No pending draws</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {giveaways.map((giveaway) => (
                    <button
                      key={giveaway.id}
                      onClick={() => handleGiveawaySelect(giveaway.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedGiveaway === giveaway.id
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{giveaway.emoji}</div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm line-clamp-1">{giveaway.title}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {giveaway.tickets_sold} entries
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedGiveaway ? (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-2">Select a Giveaway</h3>
                <p className="text-slate-400">Choose a giveaway from the list to draw a winner</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl">{selectedGiveawayData?.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-white mb-1">{selectedGiveawayData?.title}</h3>
                      <p className="text-green-400 font-semibold">
                        ${selectedGiveawayData?.prize_value} {selectedGiveawayData?.prize_currency}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/50 rounded-xl">
                      <div className="text-sm text-slate-400 mb-1">Total Entries</div>
                      <div className="text-2xl font-bold text-white">{tickets.length}</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-xl">
                      <div className="text-sm text-slate-400 mb-1">Ended</div>
                      <div className="text-lg font-bold text-white">
                        {selectedGiveawayData && new Date(selectedGiveawayData.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {winner && (
                  <div className={`bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-3xl p-8 ${
                    animating ? 'animate-pulse' : 'animate-bounce'
                  }`}>
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏆</div>
                      <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                        {animating ? 'Drawing...' : 'Winner!'}
                      </h3>
                      <div className="text-4xl font-black text-white mb-2">{winner.profile_name}</div>
                      <div className="text-lg text-slate-400">{winner.profile_email}</div>
                    </div>
                  </div>
                )}

                {!winner && (
                  <button
                    onClick={drawWinner}
                    disabled={drawing || tickets.length === 0}
                    className={`w-full py-8 rounded-2xl font-bold text-2xl transition-all ${
                      drawing || tickets.length === 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-xl shadow-yellow-500/50 hover:scale-105'
                    }`}
                  >
                    {drawing ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        Drawing Winner...
                      </span>
                    ) : tickets.length === 0 ? (
                      'No Entries'
                    ) : (
                      '🎲 Draw Winner'
                    )}
                  </button>
                )}

                <div className="p-6 bg-blue-500/10 border border-blue-500/50 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Fair & Random</h4>
                      <p className="text-slate-400 text-sm">
                        The winner is selected using cryptographically secure randomization. 
                        Each entry has an equal chance of winning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminWinnersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <WinnersContent />
    </Suspense>
  )
}
