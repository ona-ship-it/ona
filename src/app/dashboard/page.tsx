'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import VerificationBadge from '@/components/VerificationBadge'
import Header from '@/components/Header'
import ProfilePicture from '@/components/ProfilePicture'

type Entry = {
  id: string
  giveaway_id: string
  giveaway_title: string
  giveaway_emoji: string
  giveaway_image: string | null
  giveaway_end_date: string
  is_winner: boolean
  created_at: string
}

type RaffleTicket = {
  id: string
  raffle_id: string
  raffle_title: string
  raffle_emoji: string
  ticket_numbers: number[]
  quantity: number
  final_price: number
  is_winner: boolean
  winner_place: number | null
  created_at: string
}

type UserStats = {
  totalEntries: number
  totalRaffleTickets: number
  totalSpent: number
  totalWins: number
}

export default function UserDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'entries' | 'raffles' | 'wins' | 'created'>('entries')
  
  const [giveawayEntries, setGiveawayEntries] = useState<Entry[]>([])
  const [raffleTickets, setRaffleTickets] = useState<RaffleTicket[]>([])
  const [wins, setWins] = useState<(Entry | RaffleTicket)[]>([])
  const [createdRaffles, setCreatedRaffles] = useState<any[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalEntries: 0,
    totalRaffleTickets: 0,
    totalSpent: 0,
    totalWins: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    setUser(session.user)
    await fetchProfile(session.user.id)
    await fetchAllData(session.user.id)
    setLoading(false)
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    setProfile(data)
  }

  async function fetchAllData(userId: string) {
    await Promise.all([
      fetchGiveawayEntries(userId),
      fetchRaffleTickets(userId),
      fetchStats(userId),
      fetchCreatedRaffles(userId),
    ])
  }

  async function fetchGiveawayEntries(userId: string) {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, giveaway_id, is_winner, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!tickets) return

    const enriched = await Promise.all(
      tickets.map(async (ticket) => {
        const { data: giveaway } = await supabase
          .from('giveaways')
          .select('title, emoji, image_url, end_date')
          .eq('id', ticket.giveaway_id)
          .single()

        return {
          id: ticket.id,
          giveaway_id: ticket.giveaway_id,
          giveaway_title: giveaway?.title || 'Unknown',
          giveaway_emoji: giveaway?.emoji || '🎁',
          giveaway_image: giveaway?.image_url || null,
          giveaway_end_date: giveaway?.end_date || '',
          is_winner: ticket.is_winner,
          created_at: ticket.created_at,
        }
      })
    )

    setGiveawayEntries(enriched)
  }

  async function fetchRaffleTickets(userId: string) {
    const { data: tickets } = await supabase
      .from('raffle_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!tickets) return

    const enriched = await Promise.all(
      tickets.map(async (ticket) => {
        const { data: raffle } = await supabase
          .from('raffles')
          .select('title, emoji')
          .eq('id', ticket.raffle_id)
          .single()

        return {
          id: ticket.id,
          raffle_id: ticket.raffle_id,
          raffle_title: raffle?.title || 'Unknown',
          raffle_emoji: raffle?.emoji || '🎟️',
          ticket_numbers: ticket.ticket_numbers,
          quantity: ticket.quantity,
          final_price: ticket.final_price,
          is_winner: ticket.is_winner,
          winner_place: ticket.winner_place,
          created_at: ticket.created_at,
        }
      })
    )

    setRaffleTickets(enriched)
  }

  async function fetchStats(userId: string) {
    // Total giveaway entries
    const { count: entriesCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Total raffle tickets
    const { data: raffleData } = await supabase
      .from('raffle_tickets')
      .select('quantity, final_price')
      .eq('user_id', userId)

    const totalRaffleTickets = raffleData?.reduce((sum, t) => sum + t.quantity, 0) || 0
    const totalSpent = raffleData?.reduce((sum, t) => sum + t.final_price, 0) || 0

    // Total wins (giveaways)
    const { count: giveawayWins } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_winner', true)

    // Total wins (raffles)
    const { count: raffleWins } = await supabase
      .from('raffle_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_winner', true)

    setStats({
      totalEntries: entriesCount || 0,
      totalRaffleTickets,
      totalSpent,
      totalWins: (giveawayWins || 0) + (raffleWins || 0),
    })
  }

  async function fetchCreatedRaffles(userId: string) {
    const { data } = await supabase
      .from('raffles')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    setCreatedRaffles(data || [])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--primary-bg)' }}>
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-2 border-t-transparent" style={{ borderColor: 'var(--accent-blue)' }}></div>
      </div>
    )
  }

  // Combine wins
  const allWins = [
    ...giveawayEntries.filter(e => e.is_winner),
    ...raffleTickets.filter(t => t.is_winner),
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <ProfilePicture size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black text-white">
                  {profile?.full_name || 'User Dashboard'}
                </h2>
                <VerificationBadge />
              </div>
              <p className="text-slate-400">{user?.email}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/settings">
                <button className="px-4 py-2 rounded-md text-sm font-semibold" style={{
                  background: 'var(--tertiary-bg)',
                  color: 'var(--text-primary)'
                }}>
                  Edit Profile
                </button>
              </Link>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/')
                }}
                className="px-4 py-2 rounded-md text-sm font-semibold"
                style={{
                  background: 'var(--accent-red)',
                  color: 'var(--text-primary)'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="text-4xl mb-3">🎫</div>
            <div className="text-3xl font-black text-white mb-1">{stats.totalEntries}</div>
            <div className="text-sm text-slate-400">Giveaway Entries</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="text-4xl mb-3">🎟️</div>
            <div className="text-3xl font-black text-blue-400 mb-1">{stats.totalRaffleTickets}</div>
            <div className="text-sm text-slate-400">Raffle Tickets</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="text-4xl mb-3">💰</div>
            <div className="text-3xl font-black text-yellow-400 mb-1">${stats.totalSpent.toFixed(2)}</div>
            <div className="text-sm text-slate-400">Total Spent</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-6">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-3xl font-black text-green-400 mb-1">{stats.totalWins}</div>
            <div className="text-sm text-green-400 font-semibold">Total Wins</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'entries' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            My Entries ({giveawayEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('raffles')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'raffles' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            My Raffle Tickets ({raffleTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('wins')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'wins' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            My Wins ({allWins.length})
          </button>
          <button
            onClick={() => setActiveTab('created')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'created' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            My Raffles ({createdRaffles.length})
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* Giveaway Entries */}
          {activeTab === 'entries' && (
            <div className="space-y-4">
              {giveawayEntries.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-4">🎁</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Entries Yet</h3>
                  <p className="text-slate-400 mb-6">Start entering giveaways to see them here!</p>
                </div>
              ) : (
                giveawayEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/giveaways/${entry.giveaway_id}`}
                    className="block"
                  >
                    <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 hover:border-blue-500 rounded-3xl p-6 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{entry.giveaway_emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{entry.giveaway_title}</h3>
                          <p className="text-sm text-slate-400">
                            Entered: {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {entry.is_winner && (
                          <div className="px-4 py-2 bg-green-500 rounded-xl">
                            <span className="text-white font-bold">🏆 Winner!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Raffle Tickets */}
          {activeTab === 'raffles' && (
            <div className="space-y-4">
              {raffleTickets.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-4">🎟️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Raffle Tickets</h3>
                  <p className="text-slate-400 mb-6">Buy raffle tickets to see them here!</p>
                </div>
              ) : (
                raffleTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/raffles/${ticket.raffle_id}`}
                    className="block"
                  >
                    <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 hover:border-blue-500 rounded-3xl p-6 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{ticket.raffle_emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{ticket.raffle_title}</h3>
                          <p className="text-sm text-slate-400 mb-2">
                            {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''} • ${ticket.final_price.toFixed(2)} USDC
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {ticket.ticket_numbers.slice(0, 10).map((num) => (
                              <span key={num} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                                #{num}
                              </span>
                            ))}
                            {ticket.ticket_numbers.length > 10 && (
                              <span className="px-2 py-1 text-xs text-slate-500">
                                +{ticket.ticket_numbers.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                        {ticket.is_winner && (
                          <div className="px-4 py-2 bg-green-500 rounded-xl">
                            <span className="text-white font-bold">
                              🏆 {ticket.winner_place === 1 ? 'Winner!' : `${ticket.winner_place}${ticket.winner_place === 2 ? 'nd' : ticket.winner_place === 3 ? 'rd' : 'th'} Place`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Wins */}
          {activeTab === 'wins' && (
            <div className="space-y-4">
              {allWins.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Wins Yet</h3>
                  <p className="text-slate-400">Keep entering - your luck will turn!</p>
                </div>
              ) : (
                allWins.map((win: any) => (
                  <div
                    key={win.id}
                    className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">
                        {'giveaway_id' in win ? win.giveaway_emoji : win.raffle_emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {'giveaway_id' in win ? win.giveaway_title : win.raffle_title}
                        </h3>
                        <p className="text-sm text-green-400 font-semibold">
                          🏆 You won this {'giveaway_id' in win ? 'giveaway' : 'raffle'}!
                        </p>
                      </div>
                      <div className="text-6xl">🎉</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Created Raffles */}
          {activeTab === 'created' && (
            <div className="space-y-4">
              {createdRaffles.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-4">🎟️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Raffles Created</h3>
                  <p className="text-slate-400 mb-6">Create your first raffle!</p>
                  <Link href="/raffles/create" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                    Create Raffle
                  </Link>
                </div>
              ) : (
                createdRaffles.map((raffle) => (
                  <Link
                    key={raffle.id}
                    href={`/raffles/${raffle.id}`}
                    className="block"
                  >
                    <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 hover:border-purple-500 rounded-3xl p-6 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{raffle.emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{raffle.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>${raffle.prize_value} prize</span>
                            <span>{raffle.tickets_sold} / {raffle.total_tickets} sold</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              raffle.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              raffle.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-slate-700 text-slate-400'
                            }`}>
                              {raffle.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
