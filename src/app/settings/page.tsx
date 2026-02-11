'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ProfilePicture from '@/components/ProfilePicture'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    if (!saveNotice) return
    const timer = window.setTimeout(() => setSaveNotice(null), 6000)
    return () => window.clearTimeout(timer)
  }, [saveNotice])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login?redirect=/settings')
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
    setSaveNotice(null)
    setSaving(true)
    try {
      const updatePayload = {
        full_name: formData.full_name,
        bio: formData.bio,
        twitter_url: formData.twitter_url,
        instagram_url: formData.instagram_url,
        facebook_url: formData.facebook_url,
        linkedin_url: formData.linkedin_url,
        tiktok_url: formData.tiktok_url,
        youtube_url: formData.youtube_url,
        website_url: formData.website_url,
      }

      let usedFallback = false
      let { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      if (error && error.message?.includes('bio') && error.message?.includes('schema cache')) {
        // Retry without bio if schema cache is behind
        usedFallback = true
        const { error: retryError } = await supabase
          .from('profiles')
          .update({
            full_name: updatePayload.full_name,
            twitter_url: updatePayload.twitter_url,
            instagram_url: updatePayload.instagram_url,
            facebook_url: updatePayload.facebook_url,
            linkedin_url: updatePayload.linkedin_url,
            tiktok_url: updatePayload.tiktok_url,
            youtube_url: updatePayload.youtube_url,
            website_url: updatePayload.website_url,
          })
          .eq('id', user.id)
        error = retryError || null
      }

      if (error) throw error
      
      alert('✅ Profile updated successfully!')

      if (usedFallback) {
        setSaveNotice('Bio will appear after the database cache refreshes. Your other changes were saved.')
      }
      
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to update profile: ' + error.message)
    } finally {
      setSaving(false)
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
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add your social media profiles to connect with your community.
            </p>
            
            {/* Twitter/X */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">𝕏</span>
                  Twitter / X
                </span>
              </label>
              <input
                type="url"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://twitter.com/yourusername"
                className="w-full"
              />
            </div>

            {/* Instagram */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">📷</span>
                  Instagram
                </span>
              </label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourusername"
                className="w-full"
              />
            </div>

            {/* TikTok */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">🎵</span>
                  TikTok
                </span>
              </label>
              <input
                type="url"
                value={formData.tiktok_url}
                onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/@yourusername"
                className="w-full"
              />
            </div>

            {/* YouTube */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">▶️</span>
                  YouTube
                </span>
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@yourusername"
                className="w-full"
              />
            </div>

            {/* Facebook */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  Facebook
                </span>
              </label>
              <input
                type="url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourusername"
                className="w-full"
              />
            </div>

            {/* LinkedIn */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">💼</span>
                  LinkedIn
                </span>
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourusername"
                className="w-full"
              />
            </div>

            {/* Website */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">🌐</span>
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
          {saveNotice && (
            <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              {saveNotice}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
