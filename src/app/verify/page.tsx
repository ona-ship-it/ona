'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token and type from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Verification params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (!accessToken || !refreshToken) {
          setStatus('error');
          setMessage('Invalid verification link. Please try signing up again.');
          return;
        }

        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Session error:', error);
          setStatus('error');
          setMessage('Verification failed. Please try signing up again.');
          return;
        }

        if (data.user) {
          console.log('User verified successfully:', data.user);
          
          // Check if user profile exists in onagui_profiles
          const { data: profile, error: profileError } = await supabase
            .from('onagui_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile check error:', profileError);
          }

          // If no profile exists, create one
          if (!profile) {
            const { error: insertError } = await supabase
              .from('onagui_profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || '',
                avatar_url: data.user.user_metadata?.avatar_url || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Profile creation error:', insertError);
              // Don't fail verification if profile creation fails
            } else {
              console.log('Profile created successfully');
            }
          }

          setStatus('success');
          setMessage('Email verified successfully! Redirecting to dashboard...');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Verification failed. No user data received.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verifyEmail();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verifying your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-green-900 mb-2">
                  Email Verified!
                </h2>
                <p className="text-green-700 mb-4">
                  {message}
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="rounded-full h-12 w-12 bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-red-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-red-700 mb-4">
                  {message}
                </p>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}