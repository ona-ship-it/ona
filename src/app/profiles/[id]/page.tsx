import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import ProfilePageClient from '../ProfilePageClient'

type ProfileLookup = {
  name: string
  username: string | null
  bio: string
  avatar: string | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getProfileMetadata = async (id: string): Promise<ProfileLookup> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      name: 'Onagui Creator',
      username: null,
      bio: 'View profile on ONAGUI.',
      avatar: null,
    }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const [{ data: profileRow }, { data: onaguiProfile }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url, bio')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('onagui_profiles')
      .select('username, full_name, avatar_url')
      .eq('id', id)
      .maybeSingle(),
  ])

  const name = profileRow?.full_name
    || onaguiProfile?.full_name
    || onaguiProfile?.username
    || 'Onagui Creator'

  const bio = profileRow?.bio || 'View profile on ONAGUI.'
  const avatar = profileRow?.avatar_url || onaguiProfile?.avatar_url || null

  return {
    name,
    username: onaguiProfile?.username || null,
    bio,
    avatar,
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const profile = await getProfileMetadata(params.id)
  const handle = profile.username ? `@${profile.username}` : 'Profile'
  const title = `${handle} | ${profile.name} | ONAGUI`

  return {
    title,
    description: profile.bio,
    openGraph: {
      title,
      description: profile.bio,
      images: profile.avatar ? [profile.avatar] : [],
    },
  }
}

export default function ProfileIdPage({ params }: { params: { id: string } }) {
  return <ProfilePageClient profileIdOverride={params.id} />
}
