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
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
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
      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
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