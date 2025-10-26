'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 [AdminAuthGuard] Starting auth check...');
        console.log('🔍 [AdminAuthGuard] NODE_ENV value:', process.env.NODE_ENV);
        console.log('🔍 [AdminAuthGuard] window.location.hostname:', window.location.hostname);
        
        // DEVELOPMENT BYPASS - Allow access without authentication in development
        // Check both NODE_ENV and localhost hostname for development detection
        const isDevelopment = process.env.NODE_ENV === 'development' || 
                             window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
          console.log('🚧 [AdminAuthGuard] DEVELOPMENT MODE: Bypassing authentication');
          setIsAuthenticated(true);
          setIsAdmin(true);
          setDebugInfo('Development mode: Authentication bypassed');
          setIsLoading(false);
          return;
        }
        
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log('🚫 [AdminAuthGuard] No session found, redirecting to signin');
          const currentPath = window.location.pathname;
          router.push(`/signin?redirectTo=${encodeURIComponent(currentPath)}`);
          return;
        }

        setIsAuthenticated(true);
        console.log(`✅ [AdminAuthGuard] User authenticated: ${session.user.email}`);

        // Emergency admin check first
        const emergencyAdmins = ['richtheocrypto@gmail.com', 'samiraeddaoudi88@gmail.com'];
        if (session.user.email && emergencyAdmins.includes(session.user.email)) {
          console.log(`🚨 [AdminAuthGuard] Emergency admin access for: ${session.user.email}`);
          setIsAdmin(true);
          setDebugInfo(`Emergency admin access granted for ${session.user.email}`);
          return;
        }

        // Check admin status using the new schema (is_admin column + onagui_type)
        const { data: profileData, error: profileError } = await supabase
          .from('onagui_profiles')
          .select('is_admin, onagui_type')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('❌ [AdminAuthGuard] Profile check error:', profileError);
          setDebugInfo(`Profile error: ${profileError.message}`);
          
          // Try RPC fallback
          try {
            const { data: rpcResult, error: rpcError } = await supabase
              .rpc('is_admin_user', { user_uuid: session.user.id });
            
            if (!rpcError && rpcResult === true) {
              console.log(`✅ [AdminAuthGuard] Admin access via RPC fallback`);
              setIsAdmin(true);
              setDebugInfo(`Admin access granted via RPC fallback`);
              return;
            }
          } catch (rpcError) {
            console.warn('⚠️ [AdminAuthGuard] RPC fallback failed:', rpcError);
          }
          
          router.push('/unauthorized');
          return;
        }

        // Priority 1: Check is_admin column
        let isAdminUser = false;
        let adminSource = '';

        if (profileData?.is_admin === true) {
          isAdminUser = true;
          adminSource = 'is_admin column';
        } 
        // Priority 2: Check onagui_type for backward compatibility
        else if (profileData?.onagui_type === 'admin') {
          isAdminUser = true;
          adminSource = 'onagui_type enum';
        }

        console.log(`🔍 [AdminAuthGuard] Admin check result: ${isAdminUser} via ${adminSource} (is_admin: ${profileData?.is_admin}, onagui_type: ${profileData?.onagui_type})`);
        
        if (!isAdminUser) {
          console.log('🚫 [AdminAuthGuard] User is not admin, redirecting to home');
          setDebugInfo(`Not admin: is_admin = ${profileData?.is_admin}, onagui_type = ${profileData?.onagui_type}`);
          router.push('/');
          return;
        }

        setIsAdmin(true);
        setDebugInfo(`Admin access granted via ${adminSource}: is_admin = ${profileData?.is_admin}, onagui_type = ${profileData?.onagui_type}`);
        console.log('✅ [AdminAuthGuard] Admin access granted');
        
      } catch (error) {
        console.error('💥 [AdminAuthGuard] Auth check error:', error);
        setDebugInfo(`Error: ${error}`);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AdminAuthGuard] Auth state change: ${event}`);
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/signin');
        } else if (event === 'SIGNED_IN') {
          // Re-check admin status when user signs in
          checkAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin access...</p>
          {debugInfo && (
            <p className="mt-2 text-sm text-gray-500">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">Debug: {debugInfo}</p>
            </div>
          )}
          <div className="mt-6 space-x-4">
            <button 
              onClick={() => router.push('/signin')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}