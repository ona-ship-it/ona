import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { sendWelcomeEmail } from '@/lib/resend'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onagui.com'

  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/verify-email?error=missing_token', baseUrl))
    }

    const supabase = await createClient()

    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !verification) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid_token', baseUrl))
    }

    if (verification.verified) {
      return NextResponse.redirect(new URL('/verify-email?status=already_verified', baseUrl))
    }

    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/verify-email?error=expired', baseUrl))
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', verification.id)

    if (updateError) {
      console.error('Verification update error:', updateError)
      return NextResponse.redirect(new URL('/verify-email?error=failed', baseUrl))
    }

    // Update profiles — ignore errors if columns don't exist yet
    await supabase.from('profiles').update({ email_verified: true }).eq('id', verification.user_id)
    await supabase.from('onagui_profiles').update({ email_verified: true }).eq('id', verification.user_id)

    // Send welcome email
    const { data: profile } = await supabase
      .from('onagui_profiles')
      .select('username')
      .eq('id', verification.user_id)
      .single()

    await sendWelcomeEmail(verification.email, profile?.username || 'Creator')

    return NextResponse.redirect(new URL('/verify-email?status=success', baseUrl))
  } catch (error: any) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(new URL('/verify-email?error=server_error', baseUrl))
  }
}
