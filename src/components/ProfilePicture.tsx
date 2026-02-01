'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

type ProfilePictureProps = {
  size?: 'sm' | 'md' | 'lg'
  showUpload?: boolean
}

export default function ProfilePicture({ size = 'sm', showUpload = false }: ProfilePictureProps) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl'
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

      setProfile(profileData)

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

  function getGravatarUrl(email: string): string {
    // MD5 hash function (simple implementation)
    const md5 = (str: string) => {
      // Use a library or crypto for production
      // For now, using a simple hash
      return Array.from(str)
        .reduce((hash, char) => {
          const charCode = char.charCodeAt(0)
          return ((hash << 5) - hash) + charCode | 0
        }, 0)
        .toString(16)
    }

    const hash = md5(email.toLowerCase().trim())
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`
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
    <div className="relative group">
      {avatarUrl ? (
        <div 
          className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer transition-opacity hover:opacity-80 relative`}
          style={{ border: '2px solid var(--accent-blue)' }}
        >
          <Image 
            src={avatarUrl} 
            alt="Profile" 
            fill
            className="object-cover"
            unoptimized // For external URLs like Gravatar
          />
        </div>
      ) : (
        <div 
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold cursor-pointer transition-opacity hover:opacity-80`}
          style={{ background: 'var(--accent-blue)', color: 'var(--text-primary)' }}
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
