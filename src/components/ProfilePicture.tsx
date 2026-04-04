'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getGravatarUrl } from '@/utils/gravatar'

type ProfilePictureProps = {
  size?: 'sm' | 'md' | 'lg'
  showUpload?: boolean
}

const SIZE_PX = { sm: 36, md: 64, lg: 96 } as const

export default function ProfilePicture({ size = 'sm', showUpload = false }: ProfilePictureProps) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const px = SIZE_PX[size]

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      if (profileData?.avatar_url) {
        setAvatarUrl(profileData.avatar_url)
      } else {
        const gravatarUrl = getGravatarUrl(user.email || '')
        setAvatarUrl(gravatarUrl)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(data.publicUrl)
      alert('Avatar updated successfully!')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  if (!user) return null

  return (
    <div style={{ position: 'relative', width: px, height: px, flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          style={{
            width: px,
            height: px,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--accent-blue)',
            cursor: 'pointer',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: px,
            height: px,
            borderRadius: '50%',
            background: 'var(--accent-blue)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: size === 'lg' ? 28 : size === 'md' ? 20 : 14,
            cursor: 'pointer',
          }}
        >
          {getInitials()}
        </div>
      )}

      {showUpload && (
        <>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="avatar-upload"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              cursor: 'pointer',
              opacity: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
          >
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
              {uploading ? '...' : 'Change'}
            </span>
          </label>
        </>
      )}
    </div>
  )
}
