import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ForceAccessPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin?redirectTo=%2Fadmin%2Fforce-access')
  }

  // Force redirect to admin dashboard, bypassing middleware checks
  if (user.email === 'richtheocrypto@gmail.com') {
    console.log('🎯 FORCE ACCESS: Redirecting admin user to dashboard');
    redirect('/admin');
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>❌ Cannot Force Access</h1>
      <p>Only admin users can use force access.</p>
    </div>
  )
}