'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

type Verification = {
  id: string
  user_id: string
  platform: string
  verification_code: string
  profile_url: string
  status: string
  created_at: string
  submitted_at: string | null
  rejection_reason?: string
  user_email?: string
  user_name?: string
}

export default function AdminVerifySocialPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

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
      setVerifications(data || [])
    } catch (error) {
      console.error('Error fetching verifications:', error)
    }
  }

  async function handleApprove(verification: Verification) {
    if (!confirm(`Approve verification for ${verification.user_email}?`)) {
      return
    }

    setProcessingId(verification.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/social-verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'approve',
          verificationId: verification.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve')
      }

      alert('✅ Verification approved!')
      await fetchVerifications()

    } catch (error: any) {
      console.error('Error approving:', error)
      alert('Error: ' + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(verification: Verification) {
    const reason = prompt('Rejection reason (will be shown to user):')
    
    if (!reason) return

    setProcessingId(verification.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/social-verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'reject',
          verificationId: verification.id,
          rejectionReason: reason
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject')
      }

      alert('✅ Verification rejected!')
      await fetchVerifications()

    } catch (error: any) {
      console.error('Error rejecting:', error)
      alert('Error: ' + error.message)
    } finally {
      setProcessingId(null)
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

  function getStatusBadge(status: string) {
    const styles: Record<string, any> = {
      pending: { bg: 'rgba(240, 185, 11, 0.1)', color: 'var(--accent-orange)' },
      approved: { bg: 'rgba(0, 192, 135, 0.1)', color: 'var(--accent-green)' },
      rejected: { bg: 'rgba(246, 70, 93, 0.1)', color: 'var(--accent-red)' },
    }
    
    const style = styles[status] || styles.pending
    
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
        {status === 'pending' && '⏳ Pending'}
        {status === 'approved' && '✓ Approved'}
        {status === 'rejected' && '✗ Rejected'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--primary-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent" style={{ borderColor: 'var(--accent-blue)' }}></div>
      </div>
    )
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length
  const approvedCount = verifications.filter(v => v.status === 'approved').length
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Social Media Verification Queue
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Review and approve social media verifications
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
              Pending ({pendingCount})
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Pending
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent-orange)' }}>
              {pendingCount}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Approved
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent-green)' }}>
              {approvedCount}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Rejected
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent-red)' }}>
              {rejectedCount}
            </div>
          </div>
        </div>

        {/* Verification List */}
        {verifications.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No {filter === 'pending' ? 'Pending' : ''} Verifications
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'pending' ? 'All caught up!' : 'No verifications yet.'}
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
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {verification.user_name || 'Anonymous User'}
                      </h3>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {verification.user_email}
                      </span>
                      {getStatusBadge(verification.status)}
                    </div>

                    {/* Platform Details */}
                    <div className="mb-4">
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
                          {verification.submitted_at 
                            ? new Date(verification.submitted_at).toLocaleString()
                            : new Date(verification.created_at).toLocaleString()
                          }
                        </span>
                      </div>
                    </div>

                    {/* Verification Code */}
                    <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--tertiary-bg)' }}>
                      <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Verification Code to Check in Bio:
                      </div>
                      <code className="text-lg font-bold font-mono" style={{ color: 'var(--accent-gold)' }}>
                        {verification.verification_code}
                      </code>
                      <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        Visit their profile and check if this code appears in their bio
                      </div>
                    </div>

                    {/* Actions */}
                    {verification.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(verification)}
                          disabled={processingId === verification.id}
                          className="px-6 py-2.5 rounded-md font-semibold transition-all"
                          style={{ 
                            background: 'var(--accent-green)',
                            color: 'var(--text-primary)',
                            opacity: processingId === verification.id ? 0.5 : 1
                          }}
                        >
                          {processingId === verification.id ? 'Processing...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(verification)}
                          disabled={processingId === verification.id}
                          className="px-6 py-2.5 rounded-md font-semibold transition-all"
                          style={{ 
                            background: 'var(--accent-red)',
                            color: 'var(--text-primary)',
                            opacity: processingId === verification.id ? 0.5 : 1
                          }}
                        >
                          {processingId === verification.id ? 'Processing...' : '✗ Reject'}
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
