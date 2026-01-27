'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already-verified'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleEmailVerification()
  }, [])

  async function handleEmailVerification() {
    try {
      // Get the token from URL
      const token = searchParams.get('token')
      const type = searchParams.get('type')

      if (type === 'email') {
        // Supabase handles this automatically
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.user) {
          // Check if already verified
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_verified')
            .eq('id', session.user.id)
            .single()

          if (profile?.is_verified) {
            setStatus('already-verified')
            setMessage('Your email is already verified!')
            setTimeout(() => router.push('/dashboard'), 2000)
            return
          }

          // Mark as verified
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              is_verified: true,
              verification_method: 'email',
              verified_at: new Date().toISOString(),
            })
            .eq('id', session.user.id)

          if (updateError) throw updateError

          setStatus('success')
          setMessage('Email verified successfully! Redirecting to dashboard...')
          
          setTimeout(() => {
            const returnUrl = searchParams.get('return')
            router.push(returnUrl || '/dashboard')
          }, 2000)
        } else {
          throw new Error('No session found')
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage(error.message || 'Failed to verify email')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === 'verifying' && (
          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
            <p className="text-slate-400">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-black text-white mb-4">Email Verified!</h2>
            <p className="text-green-400 mb-6">{message}</p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>✅ You can now claim free tickets</p>
              <p>✅ Enter giveaways and raffles</p>
              <p>✅ Create your own raffles</p>
            </div>
          </div>
        )}

        {status === 'already-verified' && (
          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-blue-500/50 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">✓</div>
            <h2 className="text-3xl font-black text-white mb-4">Already Verified</h2>
            <p className="text-blue-400 mb-6">{message}</p>
            <Link href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-3xl font-black text-white mb-4">Verification Failed</h2>
            <p className="text-red-400 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/login" className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                Back to Login
              </Link>
              <button 
                onClick={() => router.push('/resend-verification')}
                className="block w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
