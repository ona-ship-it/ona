import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabaseServer'

/**
 * Social Media Verification API
 * 
 * SECURED FLOW:
 * 1. User must be authenticated
 * 2. Submission is saved for admin review (not auto-verified)
 * 3. Admin approves/rejects from verification dashboard
 */

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { verified: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { platform, verificationCode, profileUrl } = body

    if (!platform || !verificationCode) {
      return NextResponse.json(
        { verified: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!profileUrl) {
      return NextResponse.json(
        { verified: false, error: 'Profile URL is required' },
        { status: 400 }
      )
    }

    const normalizedPlatform = String(platform).toLowerCase().trim()
    const allowedPlatforms = ['twitter', 'instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'discord', 'telegram']

    if (!allowedPlatforms.includes(normalizedPlatform)) {
      return NextResponse.json(
        { verified: false, error: 'Invalid platform' },
        { status: 400 }
      )
    }

    const normalizedCode = String(verificationCode).trim()
    if (normalizedCode.length < 4 || normalizedCode.length > 120) {
      return NextResponse.json(
        { verified: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    let normalizedProfileUrl = ''
    try {
      const parsed = new URL(String(profileUrl).trim())
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol')
      }
      normalizedProfileUrl = parsed.toString()
    } catch {
      return NextResponse.json(
        { verified: false, error: 'Invalid profile URL' },
        { status: 400 }
      )
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentAttempts, error: rateLimitError } = await (supabase as any)
      .from('social_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      return NextResponse.json(
        { verified: false, error: 'Unable to validate request' },
        { status: 500 }
      )
    }

    if ((recentAttempts || 0) >= 5) {
      return NextResponse.json(
        { verified: false, error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { data: existingPending, error: pendingError } = await (supabase as any)
      .from('social_verifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', normalizedPlatform)
      .eq('verified', false)
      .eq('submitted_for_review', true)
      .limit(1)

    if (pendingError) {
      console.error('Pending check error:', pendingError)
      return NextResponse.json(
        { verified: false, error: 'Unable to validate pending requests' },
        { status: 500 }
      )
    }

    if (existingPending && existingPending.length > 0) {
      return NextResponse.json(
        { verified: false, error: 'A verification request is already pending for this platform.' },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { data: inserted, error: insertError } = await (supabase as any)
      .from('social_verifications')
      .insert({
        user_id: user.id,
        platform: normalizedPlatform,
        verification_code: normalizedCode,
        profile_url: normalizedProfileUrl,
        verified: false,
        submitted_for_review: true,
        submitted_at: now,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Social verification insert error:', insertError)
      return NextResponse.json(
        { verified: false, error: 'Failed to submit verification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      verified: false,
      pending: true,
      verificationId: (inserted as any)?.id,
      message: 'Verification submitted! An admin will review and approve it shortly. Please keep the code in your bio until approval.'
    })

  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'
