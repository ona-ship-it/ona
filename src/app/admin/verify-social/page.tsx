'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

type PendingVerification = {
  id: string
  user_id: string
  platform: string
  verification_code: string
  profile_url: string
  status: string
  created_at: string
  submitted_at?: string
  reviewed_at?: string
  rejection_reason?: string
  user_email?: string
  user_name?: string
  profile_twitter_url?: string
  profile_instagram_url?: string
  profile_twitter_verified?: boolean
  profile_instagram_verified?: boolean
}

export default function AdminVerifySocialPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [verifications, setVerifications] = useState<PendingVerification[]>([])
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  useEffect(() => {
    checkAdmin()
  }, [filter])

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    const email = session.user.email
    if (!isAdmin(email)) {
      router.push('/')
      return
    }

    await fetchVerifications()
    setLoading(false)
  }

  async function fetchVerifications() {
    try {
      // Get current user email
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        throw new Error('Not authenticated')
      }

      // Fetch from API route (server-side with service role)
      const response = await fetch(
        `/api/admin/social-verifications?filter=${filter}&email=${encodeURIComponent(session.user.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch')
      }

      const { data } = await response.json()
      console.log('Fetched verifications:', data)
      setVerifications(data || [])
    } catch (error) {
      console.error('Error fetching verifications:', error)
    }
  }

  async function handleVerify(verification: PendingVerification, approve: boolean) {
    try {
      if (!confirm(`${approve ? 'Approve' : 'Reject'} verification for ${verification.user_email}?`)) {
        return
      }

      let rejectionReason = ''
      if (!approve) {
        rejectionReason = prompt('Reason for rejection (optional):') || ''
      }

      // Update verification status
      const { error: updateError } = await supabase
        .from('social_verifications')
        .update({ 
          status: approve ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: approve ? null : rejectionReason
        })
        .eq('id', verification.id)

      if (updateError) throw updateError

      // Update profile verification
      const verifiedField = `${verification.platform}_verified`
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          [verifiedField]: approve
        })
        .eq('id', verification.user_id)

      if (profileError) throw profileError

      alert(`✅ Verification ${approve ? 'approved' : 'rejected'}!`)
      fetchVerifications()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  function getPlatformIcon(platform: string) {
    const icons: Record<string, string> = {
      twitter: '𝕏',
      instagram: '📷',
      tiktok: '🎵',
      youtube: '▶️',
      facebook: '👥',
      linkedin: '💼',
    }
    return icons[platform] || '🔗'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--primary-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent" style={{ borderColor: 'var(--accent-blue)' }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Social Media Verification Queue
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manually approve or reject social media verifications
            </p>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className="px-4 py-2 rounded-md text-sm font-semibold transition-all"
              style={{
                background: filter === 'pending' ? 'var(--accent-blue)' : 'var(--tertiary-bg)',
                color: 'var(--text-primary)'
              }}
            >
              Pending ({verifications.filter(v => v.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 rounded-md text-sm font-semibold transition-all"
              style={{
                background: filter === 'all' ? 'var(--accent-blue)' : 'var(--tertiary-bg)',
                color: 'var(--text-primary)'
              }}
            >
              All
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Pending
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>
              {verifications.filter(v => v.status === 'pending').length}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Approved
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent-green)' }}>
              {verifications.filter(v => v.status === 'approved').length}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Twitter
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {verifications.filter(v => v.platform === 'twitter').length}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Instagram
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {verifications.filter(v => v.platform === 'instagram').length}
            </div>
          </div>
        </div>

        {/* Verification List */}
        {verifications.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Pending Verifications
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              All caught up! Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div key={verification.id} className="card p-6">
                <div className="flex items-start gap-6">
                  {/* Platform Icon */}
                  <div className="text-5xl">
                    {getPlatformIcon(verification.platform)}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {verification.user_name || 'Anonymous User'}
                      </h3>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {verification.user_email}
                      </span>
                      {verification.status === 'approved' && (
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ 
                          background: 'rgba(0, 192, 135, 0.1)', 
                          color: 'var(--accent-green)' 
                        }}>
                          ✓ Verified
                        </span>
                      )}
                      {verification.status === 'rejected' && (
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ 
                          background: 'rgba(246, 70, 93, 0.1)', 
                          color: 'var(--accent-red)' 
                        }}>
                          ✗ Rejected
                        </span>
                      )}
                    </div>

                    {/* Platform Details */}
                    <div className="mb-3">
                      <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Platform: <span style={{ color: 'var(--text-primary)' }} className="font-semibold capitalize">
                          {verification.platform}
                        </span>
                      </div>
                      <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Profile URL: <a 
                          href={verification.profile_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                          style={{ color: 'var(--accent-blue)' }}
                        >
                          {verification.profile_url}
                        </a>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Submitted: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {new Date(verification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Verification Code */}
                    <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--tertiary-bg)' }}>
                      <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Verification Code to Check:
                      </div>
                      <code className="text-lg font-bold font-mono" style={{ color: 'var(--accent-gold)' }}>
                        {verification.verification_code}
                      </code>
                      <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        Visit their profile and check if this code appears in their bio
                      </div>
                    </div>

                    {/* Actions */}
                    {!verification.verified && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVerify(verification, true)}
                          className="px-6 py-2.5 rounded-md font-semibold transition-all"
                          style={{ 
                            background: 'var(--accent-green)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleVerify(verification, false)}
                          className="px-6 py-2.5 rounded-md font-semibold transition-all"
                          style={{ 
                            background: 'var(--accent-red)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          ✗ Reject
                        </button>
                        <a
                          href={verification.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 rounded-md font-semibold transition-all"
                          style={{ 
                            background: 'var(--accent-blue)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          🔗 Open Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
