'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGravatarUrl } from '@/utils/gravatar';

export default function SignUpClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleOAuthSignIn = async (provider: 'google') => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      });

      if (error) throw error;
    } catch (oauthError: any) {
      setError(oauthError.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        const username = email.split('@')[0];
        const gravatarUrl = getGravatarUrl(email);

        await supabase.from('app_users').upsert(
          {
            id: data.user.id,
            email: data.user.email,
            username,
            created_at: data.user.created_at,
          },
          { onConflict: 'id' }
        );

        await supabase.from('onagui_profiles').upsert(
          {
            id: data.user.id,
            username,
            onagui_type: 'signed_in',
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            avatar_url: gravatarUrl,
            created_at: data.user.created_at,
          },
          { onConflict: 'id' }
        );

        setShowVerificationMessage(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <div className="w-full rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <h2 className="mb-4 text-center text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Create Account
          </h2>

          {showVerificationMessage && (
            <div className="mb-4 rounded-xl border p-4" style={{ borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }}>
              <h3 className="mb-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>Verify Your Email</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We sent a verification link to your email. Check your inbox to activate your account.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ borderColor: 'var(--border)', background: '#111317', color: '#fff' }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mb-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Or continue with email
          </div>

          <form onSubmit={handleSignUp} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full rounded-xl border px-3 py-3"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full rounded-xl border px-3 py-3"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm password"
              className="w-full rounded-xl border px-3 py-3"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--accent-green)' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <button onClick={() => router.push('/signin')} style={{ color: 'var(--accent-blue)' }}>
              Sign In
            </button>
          </p>
          <p className="mt-1 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Or <Link href="/login" style={{ color: 'var(--accent-blue)' }}>use combined auth page</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
