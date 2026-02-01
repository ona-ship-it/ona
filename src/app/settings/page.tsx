'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ProfilePicture from '@/components/ProfilePicture'
import SocialVerification from '@/components/SocialVerification'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    twitter_url: '',
    instagram_url: '',
    facebook_url: '',
    linkedin_url: '',
    tiktok_url: '',
    youtube_url: '',
    website_url: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    setUser(session.user)
    await fetchProfile(session.user.id)
    setLoading(false)
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
        twitter_url: data.twitter_url || '',
        instagram_url: data.instagram_url || '',
        facebook_url: data.facebook_url || '',
        linkedin_url: data.linkedin_url || '',
        tiktok_url: data.tiktok_url || '',
        youtube_url: data.youtube_url || '',
        website_url: data.website_url || '',
      })
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          twitter_url: formData.twitter_url,
          instagram_url: formData.instagram_url,
          facebook_url: formData.facebook_url,
          linkedin_url: formData.linkedin_url,
          tiktok_url: formData.tiktok_url,
          youtube_url: formData.youtube_url,
          website_url: formData.website_url,
        })
        .eq('id', user.id)

      if (error) throw error
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function removeSocialAccount(platform: string, platformName: string) {
    if (!confirm(`Remove your ${platformName} account?`)) return

    try {
      const urlField = `${platform}_url`
      const verifiedField = `${platform}_verified`

      // Remove from profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          [urlField]: null,
          [verifiedField]: false 
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Remove verification records
      await supabase
        .from('social_verifications')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform)

      // Update local state
      setFormData({ ...formData, [urlField]: '' })
      await fetchProfile(user.id)
      
      alert(`✅ ${platformName} account removed!`)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          Profile Settings
        </h1>

        <div className="card p-8">
          {/* Profile Picture */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <ProfilePicture size="lg" showUpload={true} />
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Click to upload a new profile picture
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full opacity-50 cursor-not-allowed"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Email cannot be changed
            </p>
          </div>

          {/* Social Media Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Social Media Accounts
            </h3>
            
            {/* Twitter/X */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter / X
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/yourusername"
                  className="flex-1"
                />
                {formData.twitter_url && (
                  <button
                    onClick={() => removeSocialAccount('twitter', 'Twitter / X')}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent-red)', color: 'var(--text-primary)' }}
                    title="Remove Twitter account"
                  >
                    ✕
                  </button>
                )}
              </div>
              <SocialVerification
                platform="twitter"
                platformName="Twitter / X"
                profileUrl={formData.twitter_url}
                verified={profile?.twitter_verified || false}
                onVerified={() => fetchProfile(user.id)}
              />
            </div>

            {/* Instagram */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/yourusername"
                  className="flex-1"
                />
                {formData.instagram_url && (
                  <button
                    onClick={() => removeSocialAccount('instagram', 'Instagram')}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent-red)', color: 'var(--text-primary)' }}
                    title="Remove Instagram account"
                  >
                    ✕
                  </button>
                )}
              </div>
              <SocialVerification
                platform="instagram"
                platformName="Instagram"
                profileUrl={formData.instagram_url}
                verified={profile?.instagram_verified || false}
                onVerified={() => fetchProfile(user.id)}
              />
            </div>

            {/* Facebook */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/yourusername"
                  className="flex-1"
                />
                {formData.facebook_url && (
                  <button
                    onClick={() => removeSocialAccount('facebook', 'Facebook')}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent-red)', color: 'var(--text-primary)' }}
                    title="Remove Facebook account"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* LinkedIn */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourusername"
                  className="flex-1"
                />
                {formData.linkedin_url && (
                  <button
                    onClick={() => removeSocialAccount('linkedin', 'LinkedIn')}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent-red)', color: 'var(--text-primary)' }}
                    title="Remove LinkedIn account"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* TikTok */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  TikTok
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.tiktok_url}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  placeholder="https://tiktok.com/@yourusername"
                  className="flex-1"
                />
                {formData.tiktok_url && (
                  <button
                    onClick={() => removeSocialAccount('tiktok', 'TikTok')}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent-red)', color: 'var(--text-primary)' }}
                    title="Remove TikTok account"
                  >
                    ✕
                  </button>
                )}
              </div>
              <SocialVerification
                platform="tiktok"
                platformName="TikTok"
                profileUrl={formData.tiktok_url}
                verified={profile?.tiktok_verified || false}
                onVerified={() => fetchProfile(user.id)}
              />
            </div>

            {/* YouTube */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/@yourusername"
                  className="flex-1"
                />
                {formData.youtube_url && (
                  <button
                    onClick={() => removeSocialAccount('youtube', 'YouTube')}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent-red)', color: 'var(--text-primary)' }}
                    title="Remove YouTube account"
                  >
                    ✕
                  </button>
                )}
              </div>
              <SocialVerification
                platform="youtube"
                platformName="YouTube"
                profileUrl={formData.youtube_url}
                verified={profile?.youtube_verified || false}
                onVerified={() => fetchProfile(user.id)}
              />
            </div>

            {/* Website */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </span>
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-md font-semibold transition-all"
            style={{ 
              background: 'var(--accent-blue)',
              color: 'var(--text-primary)',
              opacity: saving ? 0.5 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}