'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { generateVerificationCode, extractUsername } from '@/utils/socialVerification'

type SocialVerificationProps = {
  platform: string
  platformName: string
  profileUrl: string
  verified: boolean
  onVerified: () => void
}

export default function SocialVerification({
  platform,
  platformName,
  profileUrl,
  verified,
  onVerified,
}: SocialVerificationProps) {
  const supabase = createClient()
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [error, setError] = useState('')

  async function generateCode() {
    try {
      setLoading(true)
      setError('')

      const code = generateVerificationCode()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      // Save verification code
      const { error: insertError } = await supabase
        .from('social_verifications')
        .insert({
          user_id: user.id,
          platform,
          verification_code: code,
          profile_url: profileUrl,
        })

      if (insertError) throw insertError

      setVerificationCode(code)
      setShowInstructions(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyAccount() {
    try {
      setLoading(true)
      setError('')

      const username = extractUsername(profileUrl, platform)
      if (!username) {
        throw new Error('Invalid profile URL')
      }

      // Call verification API
      const response = await fetch('/api/verify-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          username,
          verificationCode,
        }),
      })

      const data = await response.json()

      if (!data.verified) {
        throw new Error(data.error || 'Verification failed. Make sure the code is in your bio.')
      }

      // Update profile
      const { data: { user } } = await supabase.auth.getUser()
      await supabase
        .from('profiles')
        .update({ [`${platform}_verified`]: true })
        .eq('id', user?.id)

      // Mark as verified
      await supabase
        .from('social_verifications')
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq('verification_code', verificationCode)

      alert('✅ Account verified successfully!')
      onVerified()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: 'rgba(0, 192, 135, 0.1)' }}>
        <span style={{ color: 'var(--accent-green)' }}>✓</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>
          Verified
        </span>
      </div>
    )
  }

  if (!profileUrl) {
    return (
      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Add your {platformName} URL to verify
      </div>
    )
  }

  return (
    <div className="mt-2">
      {!verificationCode ? (
        <button
          onClick={generateCode}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold rounded-md transition-all"
          style={{ 
            background: 'var(--accent-blue)',
            color: 'var(--text-primary)',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'Generating...' : 'Start Verification'}
        </button>
      ) : (
        <div className="card p-4">
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Step 1: Copy this code
            </div>
            <div 
              className="p-3 rounded-md flex items-center justify-between cursor-pointer"
              style={{ background: 'var(--tertiary-bg)' }}
              onClick={() => {
                navigator.clipboard.writeText(verificationCode)
                alert('Code copied!')
              }}
            >
              <code className="font-mono font-bold" style={{ color: 'var(--accent-gold)' }}>
                {verificationCode}
              </code>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Click to copy
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Step 2: Add to your {platformName} bio
            </div>
            <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Paste the code anywhere in your {platformName} bio. You can remove it after verification.
            </div>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--accent-blue)' }}
            >
              Open {platformName} →
            </a>
          </div>

          <div className="mb-4">
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Step 3: Verify
            </div>
            <button
              onClick={verifyAccount}
              disabled={loading}
              className="w-full py-2.5 rounded-md font-semibold transition-all"
              style={{ 
                background: 'var(--accent-green)',
                color: 'var(--text-primary)',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Checking...' : '✓ Verify Account'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-md" style={{ background: 'rgba(246, 70, 93, 0.1)' }}>
              <div className="text-xs font-semibold" style={{ color: 'var(--accent-red)' }}>
                {error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
