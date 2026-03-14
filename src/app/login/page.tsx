'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getGravatarUrl } from '@/utils/gravatar'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.push('/profile')
        router.refresh()
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone_number: phoneNumber,
            },
          },
        })

        if (signUpError) throw signUpError

        if (authData.user) {
          const gravatarUrl = getGravatarUrl(email);
          
          // Create in app_users
          await supabase.from('app_users').upsert({
            id: authData.user.id,
            email: authData.user.email,
            username,
            created_at: authData.user.created_at,
          }, { onConflict: 'id' });

          // Create in onagui_profiles
          await supabase.from('onagui_profiles').upsert({
            id: authData.user.id,
            username,
            full_name: fullName,
            onagui_type: 'signed_in',
            created_at: authData.user.created_at,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          // Also create in profiles (for backward compatibility) with Gravatar
          await supabase.from('profiles').upsert([
            {
              id: authData.user.id,
              email: authData.user.email,
              full_name: fullName,
              phone_number: phoneNumber,
              avatar_url: gravatarUrl,
            },
          ], { onConflict: 'id' });

          setMessage('Account created! Please check your email to verify.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const S = {
    page: { minHeight: '100vh', background: '#0f1419', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 } as React.CSSProperties,
    wrap: { position: 'relative' as const, width: '100%', maxWidth: 420 },
    logo: { display: 'flex', justifyContent: 'center', marginBottom: 32, textDecoration: 'none' },
    logoText: { fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: 2, fontFamily: "'Rajdhani', 'Space Grotesk', sans-serif" },
    card: { background: 'rgba(20,26,32,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(6,122,13,0.25)', borderRadius: 20, padding: 32, boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(6,122,13,0.08)' },
    tabs: { display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(15,20,25,0.6)', padding: 4, borderRadius: 14 },
    tab: (active: boolean) => ({ flex: 1, padding: '12px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px', background: active ? 'linear-gradient(135deg, #2be937 0%, #067a0d 100%)' : 'transparent', color: active ? '#fff' : '#718096', boxShadow: active ? '0 4px 16px rgba(6,122,13,0.4)' : 'none', transition: 'all 0.2s' } as React.CSSProperties),
    google: { width: '100%', marginBottom: 20, padding: '14px 20px', background: '#fff', color: '#111', fontWeight: 600, fontSize: 14, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'all 0.2s' } as React.CSSProperties,
    divider: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, color: '#4a5568', fontSize: 13 },
    line: { flex: 1, height: 1, background: 'rgba(6,122,13,0.15)' },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#a0aec0', marginBottom: 8, letterSpacing: '0.3px' },
    input: { width: '100%', padding: '12px 16px', background: 'rgba(15,20,25,0.8)', border: '1px solid rgba(6,122,13,0.2)', borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
    submit: { width: '100%', padding: '14px 20px', background: '#fd8312', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer', marginTop: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px', transition: 'all 0.2s' },
    footer: { marginTop: 20, textAlign: 'center' as const, fontSize: 13, color: '#718096' },
    link: { color: '#2be937', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 },
    alert: (type: 'error' | 'success') => ({ marginBottom: 16, padding: 14, borderRadius: 12, fontSize: 13, background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(6,122,13,0.1)', border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(6,122,13,0.3)'}`, color: type === 'error' ? '#f87171' : '#2be937' } as React.CSSProperties),
    back: { marginTop: 20, textAlign: 'center' as const },
    backLink: { color: '#718096', textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 },
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.logo}>
          <h1 style={S.logoText}>ONAGUI</h1>
        </Link>

        <div style={S.card}>
          <div style={S.tabs}>
            <button onClick={() => setIsLogin(true)} style={S.tab(isLogin)}>Sign In</button>
            <button onClick={() => setIsLogin(false)} style={S.tab(!isLogin)}>Sign Up</button>
          </div>

          {error && <div style={S.alert('error')}>{error}</div>}
          {message && <div style={S.alert('success')}>{message}</div>}

          <button onClick={handleGoogleSignIn} disabled={loading} style={S.google}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={S.divider}><span style={S.line} /><span>Or continue with email</span><span style={S.line} /></div>

          <form onSubmit={handleEmailAuth}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe" style={S.input} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Phone Number</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required placeholder="+1 (555) 123-4567" style={S.input} />
                </div>
              </>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={S.input} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" style={S.input} />
            </div>
            <button type="submit" disabled={loading} style={{ ...S.submit, opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={S.footer}>
            {isLogin ? (
              <p>Don&apos;t have an account?{' '}<button onClick={() => setIsLogin(false)} style={S.link}>Sign up</button></p>
            ) : (
              <p>Already have an account?{' '}<button onClick={() => setIsLogin(true)} style={S.link}>Sign in</button></p>
            )}
          </div>
        </div>

        <div style={S.back}>
          <Link href="/" style={S.backLink}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
