import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  try {
    // Get the current user from the client
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin (extract email from JWT or session)
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail || !isAdmin(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    // Get filter
    const filter = searchParams.get('filter') || 'pending'

    // Fetch verifications
    let query = supabase
      .from('social_verifications')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (filter === 'pending') {
      query = query.eq('submitted_for_review', true).eq('verified', false)
    }

    const { data: verifications, error } = await query

    if (error) throw error

    // Enrich with user and profile data
    const enrichedData = await Promise.all(
      (verifications || []).map(async (v) => {
        // Get user
        const { data: { user } } = await supabase.auth.admin.getUserById(v.user_id)
        
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, twitter_url, instagram_url, tiktok_url, youtube_url, twitter_verified, instagram_verified, tiktok_verified, youtube_verified')
          .eq('id', v.user_id)
          .single()

        return {
          ...v,
          user_email: user?.email,
          user_name: profile?.full_name,
          profile_twitter_url: profile?.twitter_url,
          profile_instagram_url: profile?.instagram_url,
          profile_tiktok_url: profile?.tiktok_url,
          profile_youtube_url: profile?.youtube_url,
          profile_twitter_verified: profile?.twitter_verified,
          profile_instagram_verified: profile?.instagram_verified,
          profile_tiktok_verified: profile?.tiktok_verified,
          profile_youtube_verified: profile?.youtube_verified,
        }
      })
    )

    return NextResponse.json({ data: enrichedData })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verifications' },
      { status: 500 }
    )
  }
}
