"use client"; 
  
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { handleAuthError } from '@/utils/authUtils';
import type { Database } from '@/types/supabase';
  
export default function GoogleSignIn() { 
  const supabase = createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  });
  const [visible, setVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is already signed in
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          setIsAuthenticated(true);
          setUser(data.session.user);
          
          // Set up auth state change listener
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              setUser(session?.user ?? null);
              setIsAuthenticated(!!session);
            }
          );
          
          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        
        // Handle refresh token errors gracefully
        const handled = await handleAuthError(err);
        if (!handled) {
          setError(err instanceof Error ? err.message : 'Authentication error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Hide after 5 seconds if visible
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, supabase.auth]);
  
  const handleSignIn = async () => { 
    try {
      setLoading(true);
      
      // Get the redirectTo parameter from URL if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirectTo') || '/';
      const callbackUrl = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectPath)}`;
      
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: "google", 
        options: { 
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }, 
      }); 
      
      if (error) { 
        throw error;
      } 
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is already authenticated or component should be hidden
  if (isAuthenticated || !visible) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black bg-opacity-90 backdrop-blur-sm text-white rounded-lg shadow-xl p-4">
          Loading...
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black bg-opacity-90 backdrop-blur-sm text-white rounded-lg shadow-xl max-w-md w-full border border-gray-700 overflow-hidden">
        {/* Header with Google logo and close button */}
        <div className="flex items-center p-4 border-b border-gray-700">
          <svg viewBox="0 0 24 24" width="24" height="24" className="mr-3">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-base font-medium">Sign in to onagui.com with google.com</span>
          <button onClick={() => setVisible(false)} className="ml-auto text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* User profile section */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div className="font-medium">
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Google User'}
              </div>
              <div className="text-sm text-gray-400">
                {user?.email || 'Sign in with your Google account'}
              </div>
            </div>
          </div>
          
          {/* Continue button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
          
          {/* Privacy notice */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            To continue, google.com will share your name, email address and profile picture with this site. See this site's <a href="/privacy" className="text-[#5AFF7F] hover:underline">privacy policy</a> and <a href="/terms" className="text-[#5AFF7F] hover:underline">Terms of Service</a>.
          </div>
        </div>
      </div>
    </div>
  );
}