'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { getGravatarUrl } from '@/utils/gravatar';

export default function SignUpClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Create records in both tables
        const username = email.split('@')[0];
        const gravatarUrl = getGravatarUrl(email);
        
        await supabase.from('app_users').upsert({
          id: data.user.id,
          email: data.user.email,
          username,
          created_at: data.user.created_at,
        }, { onConflict: 'id' });

        await supabase.from('onagui_profiles').upsert({
          id: data.user.id,
          username,
          onagui_type: 'signed_in',
          created_at: data.user.created_at,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        // Create profile with Gravatar
        await supabase.from('profiles').upsert({
          id: data.user.id,
          avatar_url: gravatarUrl,
          created_at: data.user.created_at,
        }, { onConflict: 'id' });

        setShowVerificationMessage(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-800 text-white">
      <Navigation />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-pink-500">Create an Account</h2>
          
          {showVerificationMessage && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📧</div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Verify Your Email</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    We've sent a verification link to your email. Click it to activate your account and claim free tickets!
                  </p>
                  <p className="text-slate-400 text-xs">
                    Didn't receive it? Check your spam folder or{' '}
                    <Link href="/resend-verification" className="text-blue-400 hover:underline">
                      resend verification email
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 text-red-400 bg-red-900/20 border border-red-400 rounded-md">
              {error}
            </div>
          )}
          
          {message && (
            <div className="p-3 text-green-400 bg-green-900/20 border border-green-400 rounded-md">
              {message}
            </div>
          )}
          
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Confirm your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-medium transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="text-center text-white">
            <p>
              Already have an account?{' '}
              <button
                onClick={() => router.push('/signin')}
                className="text-pink-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}