'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { generateVerificationCode } from '@/utils/socialVerification'

type SocialVerificationProps = {
  platform: string
  platformName: string
  profileUrl: string
  userId: string
  onVerified: () => void
}

export default function SocialVerification({
  platform,
  platformName,
  profileUrl,
  userId,
  onVerified,
}: SocialVerificationProps) {
  const supabase = createClient()
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    checkExistingVerification()
  }, [userId, platform])

  async function checkExistingVerification() {
    try {
      const { data } = await supabase
        .from('social_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setVerificationCode(data.verification_code)
        setStatus(data.status)
        setRejectionReason(data.rejection_reason || '')
        if (data.status === 'pending') {
          setShowInstructions(true)
        }
      }
    } catch (error) {
      // No existing verification
    }
  }

  async function generateCode() {
    try {
      setLoading(true)
      setError('')

      const code = generateVerificationCode()

      // Create verification record
      const { error: insertError } = await supabase
        .from('social_verifications')
        .insert({
          user_id: userId,
          platform,
          verification_code: code,
          profile_url: profileUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      setVerificationCode(code)
      setStatus('pending')
      setShowInstructions(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitForReview() {
    try {
      setLoading(true)
      setError('')

      // Update to submitted status
      const { error: updateError } = await supabase
        .from('social_verifications')
        .update({ 
          submitted_at: new Date().toISOString(),
          status: 'pending'
        })
        .eq('verification_code', verificationCode)
        .eq('user_id', userId)

      if (updateError) throw updateError

      alert('✅ Submitted for admin review! You will be notified within 24 hours.')
      setShowInstructions(false)
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  // Check if profile is verified
  const [isVerified, setIsVerified] = useState(false)
  
  useEffect(() => {
    checkProfileVerification()
  }, [])

  async function checkProfileVerification() {
    const { data } = await supabase
      .from('profiles')
      .select(`${platform}_verified`)
      .eq('id', userId)
      .single()
    
    setIsVerified(data?.[`${platform}_verified`] || false)
  }

  // Show verified badge
  if (isVerified || status === 'approved') {
    return (
      <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: 'rgba(0, 192, 135, 0.1)' }}>
        <span style={{ color: 'var(--accent-green)' }}>✓</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>
          Verified
        </span>
      </div>
    )
  }

  // Show rejected status
  if (status === 'rejected') {
    return (
      <div className="mt-2">
        <div className="p-3 rounded-md mb-2" style={{ background: 'rgba(246, 70, 93, 0.1)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: 'var(--accent-red)' }}>✗</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-red)' }}>
              Verification Rejected
            </span>
          </div>
          {rejectionReason && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Reason: {rejectionReason}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setStatus('idle')
            setVerificationCode('')
            setShowInstructions(false)
            generateCode()
          }}
          className="text-sm font-semibold hover:underline"
          style={{ color: 'var(--accent-blue)' }}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show pending status
  if (status === 'pending' && verificationCode) {
    return (
      <div className="mt-2 p-3 rounded-md" style={{ background: 'rgba(240, 185, 11, 0.1)' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent-orange)' }}>⏳</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--accent-orange)' }}>
            Pending Admin Review
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          We're reviewing your {platformName} account. You'll be notified within 24 hours.
        </p>
      </div>
    )
  }

  if (!profileUrl) {
    return (
      <div className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
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
      ) : showInstructions ? (
        <div className="card p-4">
          {/* Step 1: Copy Code */}
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

          {/* Step 2: Add to Bio */}
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Step 2: Add to your {platformName} bio
            </div>
            <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Paste the code anywhere in your {platformName} bio. Keep it there until approved.
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

          {/* Step 3: Submit */}
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Step 3: Submit for Review
            </div>
            <button
              onClick={submitForReview}
              disabled={loading}
              className="w-full py-2.5 rounded-md font-semibold transition-all"
              style={{ 
                background: 'var(--accent-green)',
                color: 'var(--text-primary)',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Submitting...' : '✓ Submit for Admin Review'}
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
      ) : null}
    </div>
  )
}
