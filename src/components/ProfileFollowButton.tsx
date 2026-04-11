'use client'

import { MouseEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type ProfileFollowButtonProps = {
  targetProfileId: string
  size?: 'sm' | 'md'
  viewerIdOverride?: string | null
  className?: string
}

export default function ProfileFollowButton({
  targetProfileId,
  size = 'sm',
  viewerIdOverride,
  className,
}: ProfileFollowButtonProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [viewerId, setViewerId] = useState<string | null>(viewerIdOverride ?? null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadFollowState() {
      setLoading(true)

      let activeViewerId = viewerIdOverride ?? null
      if (typeof viewerIdOverride === 'undefined') {
        const { data: { session } } = await supabase.auth.getSession()
        activeViewerId = session?.user?.id || null
      }

      if (!mounted) return
      setViewerId(activeViewerId)

      if (!activeViewerId || !targetProfileId || activeViewerId === targetProfileId) {
        if (!mounted) return
        setIsFollowing(false)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profile_followers')
        .select('profile_id')
        .eq('profile_id', targetProfileId)
        .eq('follower_id', activeViewerId)
        .maybeSingle()

      if (!mounted) return
      setIsFollowing(!!data)
      setLoading(false)
    }

    loadFollowState()

    return () => {
      mounted = false
    }
  }, [supabase, targetProfileId, viewerIdOverride])

  async function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (working || loading) return

    if (!viewerId) {
      router.push('/login')
      return
    }

    if (viewerId === targetProfileId) return

    setWorking(true)
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('profile_followers')
          .delete()
          .eq('profile_id', targetProfileId)
          .eq('follower_id', viewerId)

        if (error) throw error
        setIsFollowing(false)
      } else {
        const { error } = await supabase
          .from('profile_followers')
          .insert({ profile_id: targetProfileId, follower_id: viewerId })

        if (error) throw error
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Profile follow toggle failed:', error)
    } finally {
      setWorking(false)
    }
  }

  if (!targetProfileId || (viewerId && viewerId === targetProfileId)) {
    return null
  }

  const small = size === 'sm'

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || working}
      className={className}
      style={{
        border: isFollowing ? '1px solid rgba(59,130,246,0.38)' : '1px solid rgba(59,130,246,0.55)',
        background: isFollowing ? 'rgba(59,130,246,0.10)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: isFollowing ? '#dbeafe' : '#ffffff',
        borderRadius: 10,
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        letterSpacing: 0.6,
        fontSize: small ? 12 : 14,
        height: small ? 34 : 40,
        minWidth: small ? 92 : 112,
        padding: small ? '0 12px' : '0 16px',
        cursor: loading || working ? 'not-allowed' : 'pointer',
        opacity: loading || working ? 0.7 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      {working ? 'Working...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
