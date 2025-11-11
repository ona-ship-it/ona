import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

/**
 * Delete Supabase users by email and clean up profile rows.
 * Usage:
 *   node scripts/delete_users.mjs email1@example.com email2@example.com
 */
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) {
    console.error('[delete-users] Missing env NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const emails = process.argv.slice(2).filter(Boolean)
  if (emails.length === 0) {
    console.error('[delete-users] Provide at least one email to delete')
    console.error('Example: node scripts/delete_users.mjs alice@example.com bob@example.com')
    process.exit(1)
  }

  const supabase = createClient(url, service)

  // Helper: fetch all users (paginate) and filter by email
  async function findUserByEmail(email) {
    let page = 1
    const perPage = 200
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) {
        throw error
      }
      const match = (data?.users || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase())
      if (match) return match
      if (!data || (data.users || []).length < perPage) return null
      page += 1
    }
  }

  for (const email of emails) {
    console.log(`[delete-users] Processing ${email}`)
    try {
      const user = await findUserByEmail(email)
      if (!user) {
        console.warn(`[delete-users] No user found with email: ${email}`)
        continue
      }

      // Remove profile rows first to avoid FK issues if cascade is not configured
      const { error: profileErr } = await supabase
        .from('onagui_profiles')
        .delete()
        .eq('id', user.id)

      if (profileErr) {
        console.warn('[delete-users] Profile delete warning', {
          email,
          message: profileErr.message,
          code: profileErr.code,
          hint: 'Continuing with auth user deletion',
        })
      } else {
        console.log(`[delete-users] Deleted profile for ${email}`)
      }

      const { error: delErr } = await supabase.auth.admin.deleteUser(user.id)
      if (delErr) {
        console.error('[delete-users] deleteUser error', {
          email,
          message: delErr.message,
          code: delErr.code,
          status: delErr.status,
        })
        continue
      }
      console.log(`[delete-users] Deleted auth user ${email} (${user.id})`)
    } catch (e) {
      console.error('[delete-users] Unexpected error', { email, e })
    }
  }

  console.log('[delete-users] Done')
}

main().catch((e) => {
  console.error('[delete-users] Fatal error', e)
  process.exit(2)
})