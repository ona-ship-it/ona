import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env from .env.local (falls back to process env)
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[magic-link] Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Email is first CLI arg: node scripts/generate_magic_link_for_email.mjs <email> [redirectTo]
const [, , EMAIL_ARG, REDIRECT_ARG] = process.argv
if (!EMAIL_ARG) {
  console.error('[magic-link] Usage: node scripts/generate_magic_link_for_email.mjs <email> [redirectTo]')
  process.exit(1)
}

// Default redirect to verify page
const defaultRedirect = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/verify`
  : 'http://localhost:3000/verify'
const redirectTo = REDIRECT_ARG || defaultRedirect

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

console.log('[magic-link] Generating magic link', { email: EMAIL_ARG, redirectTo })
try {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: EMAIL_ARG,
    options: { redirectTo },
  })

  if (error) {
    console.error('[magic-link] Error', {
      name: error.name,
      code: error.code,
      status: error.status,
      message: error.message,
      timeUTC: new Date().toISOString(),
    })
    process.exit(1)
  }

  const actionLink = data?.properties?.action_link
  const emailOtpLink = data?.properties?.email_otp_link
  if (!actionLink && !emailOtpLink) {
    console.error('[magic-link] No links returned', { data })
    process.exit(1)
  }
  console.log('[magic-link] Success')
  if (actionLink) console.log('Action link:', actionLink)
  if (emailOtpLink) console.log('Email OTP link (hash):', emailOtpLink)
} catch (e) {
  console.error('[magic-link] Unexpected error', {
    name: e?.name,
    message: e?.message,
    timeUTC: new Date().toISOString(),
  })
  process.exit(1)
}