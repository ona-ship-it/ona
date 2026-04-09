'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

/**
 * Redirects to /login if the user is not authenticated.
 * Returns { user, loading } — render nothing while loading is true.
 *
 * Usage:
 *   const { user, loading } = useRequireAuth()
 *   if (loading) return <Spinner />
 */
export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(redirectTo)
      } else {
        setUser(user)
        setLoading(false)
      }
    })
  }, [])

  return { user, loading }
}
