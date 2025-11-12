import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    console.error('Missing env NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, anon)

  const tz = new Date().toISOString().replace(/[:.]/g, '-')
  const email = process.env.TEST_SIGNUP_EMAIL || `test+${tz}@example.com`
  const password = process.env.TEST_SIGNUP_PASSWORD || 'SuperStrongPass123!'

  console.log('[test-signup] Starting signup', { email })
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    console.error('[test-signup] signUp error', {
      name: error.name,
      code: error.code,
      status: error.status,
      message: error.message,
      timeUTC: new Date().toISOString(),
    })
    process.exit(2)
  }

  console.log('[test-signup] signUp data', {
    userId: data.user?.id,
    email: data.user?.email,
    confirmationSentAt: data.user?.created_at,
  })
}

main().catch((e) => {
  console.error('[test-signup] unexpected error', e)
  process.exit(3)
})