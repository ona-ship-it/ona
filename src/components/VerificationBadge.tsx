'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function VerificationBadge() {
  const supabase = createClient()
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkVerification()
  }, [])

  async function checkVerification() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single()

      setIsVerified(profile?.is_verified || false)
    } catch (error) {
      console.error('Error checking verification:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || isVerified === null) return null

  if (isVerified) {
    return (
      <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full flex items-center gap-2">
        <span className="text-green-400 text-sm font-semibold">✓ Verified</span>
      </div>
    )
  }

  return (
    <Link href="/resend-verification">
      <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full flex items-center gap-2 hover:bg-orange-500/30 transition-all cursor-pointer">
        <span className="text-orange-400 text-sm font-semibold">⚠️ Verify Email</span>
      </div>
    </Link>
  )
}
