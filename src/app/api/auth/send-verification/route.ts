import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { sendVerificationEmail } from '@/lib/resend'
import crypto from 'crypto'

// Simple in-memory rate limiter: max 3 requests per email per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 })
    return false
  }
  if (entry.count >= 3) return true
  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId are required' }, { status: 400 })
    }

    // Rate limiting per email
    if (isRateLimited(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait 10 minutes before requesting another email.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Generate a secure verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Store token — upsert so re-sending replaces the old token
    const { error: insertError } = await supabase
      .from('email_verifications')
      .upsert(
        { user_id: userId, email, token, expires_at: expiresAt, verified: false },
        { onConflict: 'user_id' }
      )

    if (insertError) {
      console.error('Token insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create verification token' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onagui.com'
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

    const result = await sendVerificationEmail(email, verificationUrl)
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Verification email sent' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Send verification error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
