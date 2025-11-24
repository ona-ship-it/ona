"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { signInWithGoogle } from '@/lib/oauth-utils';
import Link from 'next/link';
import { useTheme } from '../../components/ThemeContext';
import { FcGoogle } from 'react-icons/fc';

export default function SignInClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { isWhite, isDarker } = useTheme();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('🔐 Attempting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign in failed:', error);
      const message = error.message || '';
      
      // If Supabase throws a database grant error, attempt a passwordless magic-link fallback
      if (message.toLowerCase().includes('database error')) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get('redirectTo') || '/account';
          
          const res = await fetch('/api/auth/magic-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, redirectTo })
          });
          const data = await res.json();
          
          if (res.ok && data?.url) {
            // Use Supabase-generated action link to complete sign-in
            window.location.href = data.url as string;
            return;
          }
          throw new Error(data?.error || 'Magic link fallback failed');
        } catch (fallbackErr: any) {
          setAuthError(`Database error granting user. Passwordless fallback also failed: ${fallbackErr?.message || 'unknown error'}`);
          setIsLoading(false);
          return;
        }
      }
      
      setAuthError(message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      console.log('✅ Sign in successful:', data.user.email);
      console.log('⏳ Starting 3-second countdown for session propagation...');
      
      // Show countdown to user
      let secondsLeft = 3;
      setCountdown(secondsLeft);
      
      const countdownInterval = setInterval(() => {
        secondsLeft--;
        setCountdown(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      // ✅ CRITICAL: 3-second delay for complete cookie propagation
      setTimeout(() => {
        clearInterval(countdownInterval);
        const redirectTo = new URLSearchParams(window.location.search).get('redirectTo');
        const finalDestination = email === 'richtheocrypto@gmail.com' 
          ? '/admin' 
          : (redirectTo || '/account');
        
        console.log('🎯 Performing HARD redirect to:', finalDestination);
        console.log('🕒 Redirecting at:', new Date().toISOString());
        
        // Force complete page reload with fresh cookies
        window.location.assign(finalDestination);
      }, 3000); // ⚠️ Increased to 3 seconds for full cookie propagation
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Starting Google OAuth');
    
    try {
      // Get redirectTo parameter from URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      
      const result = await signInWithGoogle(redirectTo || '/account');
      
      if (!result.success) {
        setAuthError(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      setAuthError('An error occurred during Google sign-in');
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isWhite ? 'bg-gray-50' : isDarker ? 'bg-gray-900' : 'bg-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>
            Sign In
          </h1>
        </div>
        
        <div className="max-w-md mx-auto mt-8">
          <div className={`rounded-lg shadow-md overflow-hidden ${isWhite ? 'bg-white' : isDarker ? 'bg-gray-800 border border-gray-700' : 'bg-gray-700 border border-gray-600'}`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-6 ${isWhite ? 'text-gray-900' : 'text-white'}`}>Welcome Back</h2>
              
              {authError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {authError}
                </div>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isWhite 
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                        : 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400'
                    }`}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isWhite 
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                        : 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400'
                    }`}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className={`h-4 w-4 rounded ${
                        isWhite 
                          ? 'text-blue-600 focus:ring-blue-500 border-gray-300' 
                          : 'text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700'
                      }`}
                    />
                    <label htmlFor="remember-me" className={`ml-2 block text-sm ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <Link href="/forgot-password" className={`font-medium ${isWhite ? 'text-blue-600 hover:text-blue-500' : 'text-blue-400 hover:text-blue-300'}`}>
                      Forgot password?
                    </Link>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isWhite 
                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
                        : 'bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
              
              <div className="mt-4">
                <button
                  onClick={handleGoogleSignIn}
                  className={`w-full flex items-center justify-center p-3 text-sm font-medium border rounded-lg transition duration-150 ${
                    isWhite 
                      ? 'border-gray-300 hover:bg-gray-50 text-gray-700' 
                      : 'border-gray-600 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <FcGoogle className="w-5 h-5 mr-3" />
                  Sign in with Google
                </button>
              </div>
              
              <div className="mt-6">
                <p className={`text-center text-sm ${isWhite ? 'text-gray-600' : 'text-gray-400'}`}>
                  Don't have an account?{' '}
                  <Link href="/signup" className={`font-medium ${isWhite ? 'text-blue-600 hover:text-blue-500' : 'text-blue-400 hover:text-blue-300'}`}>
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
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
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>🔄 Setting up your session...</h2>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>Redirecting in {countdown} seconds</p>
          <p style={{ fontSize: '14px', marginTop: '10px', textAlign: 'center', maxWidth: '300px' }}>
            This ensures your admin access works properly
          </p>
        </div>
      )}
    </div>
  );
}