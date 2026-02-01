'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

type PendingVerification = {
  id: string
  user_id: string
  platform: string
  verification_code: string
  profile_url: string
  verified: boolean
  created_at: string
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'admin@onagui.com') {
      router.push('/')
      return
    }

    await fetchVerifications()
    setLoading(false)
  }

  async function fetchVerifications() {
    try {
      // Get verifications with user details
      let query = supabase
        .from('social_verifications')
        .select(`
          *,
          profiles!inner(
            id,
            full_name,
            twitter_url,
            instagram_url,
            tiktok_url,
            youtube_url,
            twitter_verified,
            instagram_verified,
            tiktok_verified,
            youtube_verified
          )
        `)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('verified', false)
      }

      const { data, error } = await query

      if (error) throw error

      // Get user emails from auth.users
      const { data: { users } } = await supabase.auth.admin.listUsers()

      const enrichedData = data?.map(v => {
        const user = users?.find(u => u.id === v.user_id)
        const profile = (v as any).profiles
        
        return {
          ...v,
          user_email: user?.email,
          user_name: profile?.full_name,
          profile_twitter_url: profile?.twitter_url,
          profile_instagram_url: profile?.instagram_url,
          profile_twitter_verified: profile?.twitter_verified,
          profile_instagram_verified: profile?.instagram_verified,
        }
      })

      setVerifications(enrichedData || [])
    } catch (error) {
      console.error('Error fetching verifications:', error)
    }
  }

  async function handleVerify(verification: PendingVerification, approve: boolean) {
    try {
      if (!confirm(`${approve ? 'Approve' : 'Reject'} verification for ${verification.user_email}?`)) {
        return
      }

      // Update verification status
      const { error: updateError } = await supabase
        .from('social_verifications')
        .update({ 
          verified: approve,
          verified_at: approve ? new Date().toISOString() : null 
        })
        .eq('id', verification.id)

      if (updateError) throw updateError

      // Update profile verification
      const updateField = `${verification.platform}_verified`
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ [updateField]: approve })
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
              Pending ({verifications.filter(v => !v.verified).length})
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
              {verifications.filter(v => !v.verified).length}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Approved
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent-green)' }}>
              {verifications.filter(v => v.verified).length}
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
                      {verification.verified && (
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ 
                          background: 'rgba(0, 192, 135, 0.1)', 
                          color: 'var(--accent-green)' 
                        }}>
                          ✓ Verified
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
