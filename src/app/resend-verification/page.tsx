'use client'
import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ResendVerificationContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const queryEmail = searchParams.get('email')
    if (queryEmail) {
      setEmail(queryEmail)
    }
  }, [searchParams])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setStatus('idle')

    try {
      const supabase = createClient()

      // Look up user id from onagui_profiles
      const { data: profile } = await supabase
        .from('onagui_profiles')
        .select('id')
        .eq('id', (await supabase.from('app_users').select('id').eq('email', email).single()).data?.id)
        .single()

      // Use auth to get the user by email — we call the API directly
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: profile?.id || 'lookup-failed' }),
      })

      const data = await response.json()

      if (response.status === 429) {
        setStatus('error')
        setMessage(data.error || 'Too many requests. Wait 10 minutes.')
        return
      }

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Failed to send verification email. Please try again.')
        return
      }

      setStatus('success')
      setMessage('Verification email sent! Check your inbox and spam folder.')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#00ff88', letterSpacing: 2, margin: '0 0 4px' }}>ONAGUI</h1>
          <p style={{ color: '#64748b', fontSize: 12 }}>Email Verification</p>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 20, padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Resend Verification</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px' }}>
            Enter your email address and we&apos;ll send a new verification link.
          </p>

          {status === 'success' && (
            <div style={{ padding: '12px 16px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#00ff88' }}>
              ✅ {message}
            </div>
          )}
          {status === 'error' && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#ef4444' }}>
              ❌ {message}
            </div>
          )}

          <form onSubmit={handleResend}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: '#0f1419', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: loading ? 'rgba(0,255,136,0.3)' : 'linear-gradient(135deg,#00ff88,#00cc6a)', color: '#0a1929', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
            <Link href="/login" style={{ color: '#00ff88', textDecoration: 'none' }}>Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0a1929', minHeight: '100vh' }} />}>
      <ResendVerificationContent />
    </Suspense>
  )
}
