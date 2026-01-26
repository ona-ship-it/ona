'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Profile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [user, authLoading])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq('id', user.id)

      if (error) throw error

      await fetchProfile()
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFullName(profile?.full_name || '')
    setPhone(profile?.phone || '')
    setEditing(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black text-white">Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white text-lg">{profile.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Email
              </label>
              <p className="text-white text-lg">{profile.email}</p>
              <p className="text-slate-500 text-sm mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white text-lg">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Member Since
              </label>
              <p className="text-white text-lg">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
