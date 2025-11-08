"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useTheme } from '../../lib/ThemeContext';
import PageTitle from '../../components/PageTitle';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { isWhite, isDarker } = useTheme();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isWhite ? 'bg-gray-50' : isDarker ? 'bg-gray-900' : 'bg-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <PageTitle>Sign In</PageTitle>
        
        <div className="max-w-md mx-auto mt-8">
          <div className={`rounded-lg shadow-md overflow-hidden ${isWhite ? 'bg-white' : isDarker ? 'bg-gray-800 border border-gray-700' : 'bg-gray-700 border border-gray-600'}`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-6 ${isWhite ? 'text-gray-900' : 'text-white'}`}>Welcome Back</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
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
                    className={`mt-1 block w-full rounded-md ${isWhite ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' : 'bg-gray-700 border-gray-600 text-white focus:border-onaguiGreen-light focus:ring-purple-400'}`}
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
                    className={`mt-1 block w-full rounded-md ${isWhite ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' : 'bg-gray-700 border-gray-600 text-white focus:border-onaguiGreen-light focus:ring-purple-400'}`}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className={`h-4 w-4 rounded ${isWhite ? 'text-onaguiGreen focus:ring-onaguiGreen border-gray-300' : 'text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-700'}`}
                    />
                    <label htmlFor="remember-me" className={`ml-2 block text-sm ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <Link href="/forgot-password" className={`font-medium ${isWhite ? 'text-onaguiGreen hover:text-onaguiGreen-dark' : 'text-purple-400 hover:text-purple-300'}`}>
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
                        ? 'bg-onaguiGreen hover:bg-onaguiGreen-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onaguiGreen' 
                        : 'bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
              
              <div className="mt-6">
                <p className={`text-center text-sm ${isWhite ? 'text-gray-600' : 'text-gray-400'}`}>
                  Don&#39;t have an account?{' '}
                  <Link href="/signup" className={`font-medium ${isWhite ? 'text-onaguiGreen hover:text-onaguiGreen-dark' : 'text-purple-400 hover:text-purple-300'}`}>
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}