'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

type WinnerDisplayProps = {
  giveawayId?: string
  raffleId?: string
  winnerId: string
  winnerDrawnAt: string
}

export default function WinnerDisplay({ giveawayId, raffleId, winnerId, winnerDrawnAt }: WinnerDisplayProps) {
  const supabase = createClient()
  const [winner, setWinner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWinner()
  }, [winnerId])

  async function fetchWinner() {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', winnerId)
        .single()

      setWinner(profile)
    } catch (error) {
      console.error('Error fetching winner:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-8 animate-pulse">
        <div className="h-32 bg-slate-800 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-3xl p-8 relative overflow-hidden">
      {/* Confetti Background Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-9xl animate-bounce-slow">🎉</div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h3 className="text-3xl font-black text-white mb-2">Winner Announced!</h3>
          <p className="text-yellow-400 text-sm">
            Drawn on {new Date(winnerDrawnAt).toLocaleDateString()} at {new Date(winnerDrawnAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 p-6 bg-slate-900/50 rounded-2xl backdrop-blur-xl">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-4xl overflow-hidden border-4 border-yellow-400">
              {winner?.avatar_url ? (
                <Image src={winner.avatar_url} alt="Winner" fill className="object-cover" />
              ) : (
                winner?.full_name?.charAt(0).toUpperCase() || '🎊'
              )}
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xl">
              👑
            </div>
          </div>

          {/* Winner Info */}
          <div className="flex-1">
            <div className="text-2xl font-black text-white mb-1">
              {winner?.full_name || 'Anonymous Winner'}
            </div>
            <div className="text-yellow-400 font-semibold">
              Congratulations! 🎊
            </div>
          </div>
        </div>

        {/* Celebration Message */}
        <div className="mt-6 text-center">
          <p className="text-slate-300 text-sm">
            The winner has been notified via email. Thank you to everyone who participated!
          </p>
        </div>
      </div>
    </div>
  )
}
