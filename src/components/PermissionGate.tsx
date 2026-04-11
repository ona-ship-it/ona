'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export type PermissionReason =
  | 'must_login'
  | 'must_verify_email'
  | 'account_suspended'
  | 'insufficient_role'

interface PermissionGateProps {
  reason: PermissionReason
  /** Email used to pre-fill resend-verification link */
  email?: string
}

const CONFIG: Record<
  PermissionReason,
  { icon: string; title: string; body: string; cta?: React.ReactNode }
> = {
  must_login: {
    icon: '🔒',
    title: 'Sign in required',
    body: 'You need to be signed in to access this page.',
    cta: (
      <Link
        href="/login"
        className="inline-block px-6 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
      >
        Sign in
      </Link>
    ),
  },
  must_verify_email: {
    icon: '📧',
    title: 'Verify your email',
    body: "We've sent a verification link to your email address. Check your inbox (and spam folder) and click the link to continue.",
    cta: undefined, // rendered dynamically with email
  },
  account_suspended: {
    icon: '⛔',
    title: 'Account suspended',
    body: 'Your account has been suspended. Please contact support if you believe this is a mistake.',
    cta: (
      <Link
        href="/contact"
        className="inline-block px-6 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
      >
        Contact support
      </Link>
    ),
  },
  insufficient_role: {
    icon: '🚫',
    title: 'Access denied',
    body: 'You do not have permission to access this page.',
    cta: (
      <Link
        href="/"
        className="inline-block px-6 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
      >
        Go home
      </Link>
    ),
  },
}

export function PermissionGate({ reason, email }: PermissionGateProps) {
  const router = useRouter()
  const cfg = CONFIG[reason]

  let cta = cfg.cta
  if (reason === 'must_verify_email') {
    const href = email
      ? `/resend-verification?email=${encodeURIComponent(email)}`
      : '/resend-verification'
    cta = (
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={href}
          className="inline-block px-6 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
        >
          Resend verification email
        </Link>
        <button
          onClick={() => router.back()}
          className="inline-block px-6 py-2 rounded-full border border-gray-400 text-gray-300 font-semibold hover:border-gray-200 transition"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full text-center space-y-6 py-16">
        <div className="text-6xl">{cfg.icon}</div>
        <h1 className="text-2xl font-bold text-white">{cfg.title}</h1>
        <p className="text-gray-400 leading-relaxed">{cfg.body}</p>
        {cta && <div>{cta}</div>}
      </div>
    </div>
  )
}
