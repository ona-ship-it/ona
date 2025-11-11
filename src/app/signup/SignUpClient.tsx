'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { signInWithGoogle } from '@/lib/oauth-utils';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

export default function SignUpClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
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
      // Request a verification email via server-side generateLink
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send verification email');
      }

      setMessage('Verification email sent! Please check your inbox to complete signup.');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      
      const result = await signInWithGoogle('/account');
      
      if (!result.success) {
        throw new Error(result.error || 'Google sign up failed');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during Google sign up');
    }
  };

  return (
    <main className="min-h-screen bg-gray-800 text-white">
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-pink-500">Create an Account</h2>
          
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center p-3 text-sm font-medium border border-gray-600 rounded-lg hover:bg-gray-800 transition duration-150 text-gray-300"
          >
            <FcGoogle className="w-5 h-5 mr-3" />
            Sign up with Google
          </button>
          
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

      {/* Loading overlay with countdown */}
      {isLoading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          zIndex: 1000 
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>🔄 Finalizing your session...</h2>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>Redirecting in {countdown} seconds</p>
          <p style={{ fontSize: '14px', marginTop: '10px', textAlign: 'center', maxWidth: '300px' }}>
            This ensures your account page loads correctly
          </p>
        </div>
      )}
    </main>
  );
}