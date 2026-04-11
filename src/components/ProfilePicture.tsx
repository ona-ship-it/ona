'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { getGravatarUrl } from '@/utils/gravatar'


type ProfilePictureProps = {
  size?: 'sm' | 'md' | 'lg'
  showUpload?: boolean
}

type Profile = {
  avatar_url: string | null
  full_name: string | null
}

export default function ProfilePicture({ size = 'sm', showUpload = false }: ProfilePictureProps) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const sizeConfig = {
    sm: { dimension: 36, fontSize: 14 },
    md: { dimension: 64, fontSize: 20 },
    lg: { dimension: 96, fontSize: 30 },
  }

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Fetch profile with avatar
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .single()

      setProfile((profileData as Profile | null) || null)

      // Get avatar URL
      if (profileData?.avatar_url) {
        setAvatarUrl(profileData.avatar_url)
      } else {
        // Generate Gravatar URL from email
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

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(data.publicUrl)
      alert('Avatar updated successfully!')
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert('Error uploading avatar: ' + message)
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

  const { dimension, fontSize } = sizeConfig[size]
  const isHeaderAvatar = size === 'sm' && !showUpload
  const shouldShowImage = !!avatarUrl && !isHeaderAvatar

  return (
    <div className="relative group">
      {shouldShowImage ? (
        <div 
          style={{
            width: dimension,
            height: dimension,
            minWidth: dimension,
            minHeight: dimension,
            borderRadius: '9999px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            border: '2px solid var(--accent-blue)',
          }}
        >
          <img
            src={avatarUrl}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      ) : (
        <div 
          style={{
            width: dimension,
            height: dimension,
            minWidth: dimension,
            minHeight: dimension,
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize,
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            background: 'var(--accent-blue)',
            color: 'var(--text-primary)',
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
            className="hidden"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          >
            <span className="text-white text-xs font-semibold">
              {uploading ? '...' : 'Change'}
            </span>
          </label>
        </>
      )}
    </div>
  )
}
