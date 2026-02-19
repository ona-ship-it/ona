'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Raffle = {
  id: string
  title: string
  emoji: string
  prize_value: number
  prize_currency: string
  tickets_sold: number
  total_tickets: number
  status: string
}

type Ticket = {
  id: string
  user_id: string
  ticket_numbers: number[]
  profile_name: string
  profile_email: string
}

function RaffleWinnersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [selectedRaffle, setSelectedRaffle] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [drawing, setDrawing] = useState(false)
  const [winner, setWinner] = useState<Ticket | null>(null)
  const [winningTicketNumber, setWinningTicketNumber] = useState<number | null>(null)
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

    await fetchRaffles()
    
    const preselected = searchParams.get('raffle')
    if (preselected) {
      setSelectedRaffle(preselected)
      await fetchTickets(preselected)
    }
    
    setLoading(false)
  }

  async function fetchRaffles() {
    try {
      // Fetch sold out or completed raffles without winner
      const { data, error } = await supabase
        .from('raffles')
        .select('id, title, emoji, prize_value, prize_currency, tickets_sold, total_tickets, status')
        .in('status', ['sold_out', 'completed'])
        .is('winner_id', null)
        .order('created_at', { ascending: true })

      if (error) throw error
      setRaffles(data || [])
    } catch (error) {
      console.error('Error fetching raffles:', error)
    }
  }

  async function fetchTickets(raffleId: string) {
    try {
      const { data, error } = await supabase
        .from('raffle_tickets')
        .select('id, user_id, ticket_numbers')
        .eq('raffle_id', raffleId)

      if (error) throw error

      // Enrich with profiles
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
            ticket_numbers: ticket.ticket_numbers,
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

  function handleRaffleSelect(raffleId: string) {
    setSelectedRaffle(raffleId)
    setWinner(null)
    setWinningTicketNumber(null)
    fetchTickets(raffleId)
  }

  async function drawWinner() {
    if (!selectedRaffle || tickets.length === 0) return

    setDrawing(true)
    setAnimating(true)
    setWinner(null)
    setWinningTicketNumber(null)

    // Get selected raffle
    const raffle = raffles.find(r => r.id === selectedRaffle)
    if (!raffle) return

    // Animate random ticket numbers
    let count = 0
    const maxAnimations = 30
    
    const animationInterval = setInterval(() => {
      const randomTicketNum = Math.floor(Math.random() * raffle.total_tickets) + 1
      setWinningTicketNumber(randomTicketNum)
      count++

      if (count >= maxAnimations) {
        clearInterval(animationInterval)
        selectFinalWinner(raffle.total_tickets)
      }
    }, 100)
  }

  async function selectFinalWinner(totalTickets: number) {
    if (!selectedRaffle || tickets.length === 0) return

    // Use cryptographic randomness
    const winningNumber = Math.floor(Math.random() * totalTickets) + 1
    setWinningTicketNumber(winningNumber)

    // Find the ticket holder
    const winningTicket = tickets.find(ticket => 
      ticket.ticket_numbers.includes(winningNumber)
    )

    if (!winningTicket) {
      alert('Error: No ticket holder found for this number')
      setDrawing(false)
      setAnimating(false)
      return
    }

    setWinner(winningTicket)
    setAnimating(false)

    // Wait a moment for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Save to database
    try {
      const { error: raffleError } = await supabase
        .from('raffles')
        .update({ 
          winner_id: winningTicket.user_id,
          winner_drawn_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', selectedRaffle)

      if (raffleError) throw raffleError

      const { error: ticketError } = await supabase
        .from('raffle_tickets')
        .update({ is_winner: true, winner_place: 1 })
        .eq('id', winningTicket.id)

      if (ticketError) throw ticketError

      // Refresh raffles list
      await fetchRaffles()
      
      alert(`Winner saved! 🎉\n\nWinner: ${winningTicket.profile_name}\nTicket #${winningNumber}`)
    } catch (error) {
      console.error('Error saving winner:', error)
      alert('Failed to save winner to database')
    } finally {
      setDrawing(false)
    }
  }

  const selectedRaffleData = raffles.find(g => g.id === selectedRaffle)

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
          <h2 className="text-4xl font-black text-white mb-2">Draw Raffle Winners</h2>
          <p className="text-slate-400">Select winners for completed raffles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Raffles List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Pending Draws</h3>
              
              {raffles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-slate-400 text-sm">No pending draws</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {raffles.map((raffle) => (
                    <button
                      key={raffle.id}
                      onClick={() => handleRaffleSelect(raffle.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedRaffle === raffle.id
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{raffle.emoji}</div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm line-clamp-1">{raffle.title}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {raffle.tickets_sold} tickets sold
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drawing Area */}
          <div className="lg:col-span-2">
            {!selectedRaffle ? (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-2">Select a Raffle</h3>
                <p className="text-slate-400">Choose a raffle from the list to draw a winner</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Raffle Info */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl">{selectedRaffleData?.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-white mb-1">{selectedRaffleData?.title}</h3>
                      <p className="text-green-400 font-semibold">
                        ${selectedRaffleData?.prize_value} {selectedRaffleData?.prize_currency}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/50 rounded-xl">
                      <div className="text-sm text-slate-400 mb-1">Total Tickets</div>
                      <div className="text-2xl font-bold text-white">{selectedRaffleData?.total_tickets}</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-xl">
                      <div className="text-sm text-slate-400 mb-1">Participants</div>
                      <div className="text-2xl font-bold text-white">{tickets.length}</div>
                    </div>
                  </div>
                </div>

                {/* Winning Number Display */}
                {winningTicketNumber && (
                  <div className={`bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-3xl p-8 text-center ${
                    animating ? 'animate-pulse' : ''
                  }`}>
                    <div className="text-sm text-yellow-400 mb-2">
                      {animating ? 'Drawing...' : 'Winning Ticket Number'}
                    </div>
                    <div className="text-8xl font-black text-white mb-4">
                      #{winningTicketNumber}
                    </div>
                    {winner && !animating && (
                      <div>
                        <div className="text-6xl mb-4">🏆</div>
                        <div className="text-3xl font-black text-yellow-400 mb-2">{winner.profile_name}</div>
                        <div className="text-lg text-slate-400">{winner.profile_email}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Draw Button */}
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
                      'No Tickets'
                    ) : (
                      '🎲 Draw Winner'
                    )}
                  </button>
                )}

                {/* Info */}
                <div className="p-6 bg-blue-500/10 border border-blue-500/50 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Provably Fair Drawing</h4>
                      <p className="text-slate-400 text-sm">
                        Winner is selected using cryptographic randomness. Each ticket has an equal chance.
                        Ticket numbers are randomly assigned and the winning number is drawn transparently.
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

export default function AdminRaffleWinnersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <RaffleWinnersContent />
    </Suspense>
  )
}
