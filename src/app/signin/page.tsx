'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message || 'Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#1a0033] text-white">
      <Navigation />
      
      <div className="max-w-md mx-auto mt-16 p-6 rounded-lg shadow-lg bg-[#2a0044]/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Sign In to ONAGUI
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#3a0066] rounded-md border border-[#4a0088] focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#3a0066] rounded-md border border-[#4a0088] focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md font-medium text-white hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}