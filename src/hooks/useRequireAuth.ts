'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { PermissionReason } from '@/components/PermissionGate'

export type { PermissionReason }

interface UseRequireAuthOptions {
  /**
   * Where to redirect if not authenticated.
   * Pass `null` to skip the automatic redirect and return `reason` instead
   * (so the caller can render <PermissionGate> inline).
   */
  redirectTo?: string | null
}

interface UseRequireAuthResult {
  user: User | null
  loading: boolean
  /** Set when the user lacks access — use with <PermissionGate reason={reason} /> */
  reason: PermissionReason | null
}

/**
 * Ensures the current user is authenticated.
 *
 * Default behaviour: redirects to /login when not signed in (original behaviour).
 *
 * Pass `redirectTo: null` to suppress the redirect and get `reason` back instead,
 * so you can render <PermissionGate reason={reason} /> in place.
 *
 * Usage (redirect mode — default):
 *   const { user, loading } = useRequireAuth()
 *   if (loading) return <Spinner />
 *
 * Usage (gate mode):
 *   const { user, loading, reason } = useRequireAuth({ redirectTo: null })
 *   if (loading) return <Spinner />
 *   if (reason) return <PermissionGate reason={reason} />
 */
export function useRequireAuth(
  redirectToOrOptions: string | UseRequireAuthOptions = '/login',
): UseRequireAuthResult {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState<PermissionReason | null>(null)

  const redirectTo =
    typeof redirectToOrOptions === 'string'
      ? redirectToOrOptions
      : (redirectToOrOptions.redirectTo ?? '/login')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) {
        setReason('must_login')
        if (redirectTo !== null) {
          router.replace(redirectTo)
        } else {
          setLoading(false)
        }
      } else if (
        authUser.email_confirmed_at == null &&
        authUser.app_metadata?.provider !== 'google'
      ) {
        // Email not verified (non-OAuth accounts)
        setReason('must_verify_email')
        if (redirectTo !== null) {
          const href = authUser.email
            ? `/resend-verification?email=${encodeURIComponent(authUser.email)}`
            : '/resend-verification'
          router.replace(href)
        } else {
          setLoading(false)
        }
      } else {
        setUser(authUser)
        setLoading(false)
      }
    })
  }, [])

  return { user, loading, reason }
}
