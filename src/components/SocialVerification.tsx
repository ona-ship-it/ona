'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { generateVerificationCode, extractUsername } from '@/utils/socialVerification'

type SocialVerificationProps = {
  platform: string
  platformName: string
  profileUrl: string
  verified: boolean
  pendingReview?: boolean
  onVerified: () => void
  onSaveProfile?: () => Promise<void>
}

export default function SocialVerification({
  platform,
  platformName,
  profileUrl,
  verified,
  pendingReview = false,
  onVerified,
  onSaveProfile,
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
// Save profile first if callback provided
      if (onSaveProfile) {
        await onSaveProfile()
      }

      
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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Submit for review (NOT verified yet)
      await supabase
        .from('social_verifications')
        .update({ 
          submitted_for_review: true,
          submitted_at: new Date().toISOString()
        })
        .eq('verification_code', verificationCode)
        .eq('user_id', user.id)

      // Mark profile as pending review
      await supabase
        .from('profiles')
        .update({ [`${platform}_pending_review`]: true })
        .eq('id', user.id)

      alert('✅ Submitted for admin review! We will verify your account within 24 hours.')
      setShowInstructions(false)
      setVerificationCode('')
      onVerified()
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit')
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

  if (pendingReview) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
        <span style={{ color: 'var(--accent-gold)' }}>⏳</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-gold)' }}>
          Pending Admin Review
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
              Step 3: Submit for Review
            </div>
            <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              After adding the code to your bio, submit for admin review. An admin will verify it manually.
            </div>
            <button
              onClick={verifyAccount}
              disabled={loading}
              className="w-full py-2.5 rounded-md font-semibold transition-all"
              style={{ 
                background: 'var(--accent-blue)',
                color: 'var(--text-primary)',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Submitting...' : '📝 Submit for Review'}
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
