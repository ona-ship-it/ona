'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SessionDebugInfo {
  user: any;
  session: any;
  isAdmin: boolean;
  adminCheckMethods: {
    emailCheck: boolean;
    rpcCheck: boolean | null;
    profileCheck: any;
  };
  cookies: string[];
  errors: any[];
}

export default function SessionDebugPage() {
  const [debugInfo, setDebugInfo] = useState<SessionDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getDebugInfo() {
      const errors: any[] = [];
      
      try {
        // Get user and session
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (userError) errors.push({ type: 'user_error', error: userError });
        if (sessionError) errors.push({ type: 'session_error', error: sessionError });

        // Check admin status via email
        const emailCheck = user?.email === 'richtheocrypto@gmail.com';

        // Check admin status via RPC
        let rpcCheck = null;
        if (user) {
          try {
            const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin_user', {
              user_uuid: user.id
            });
            rpcCheck = isAdmin;
            if (rpcError) errors.push({ type: 'rpc_error', error: rpcError });
          } catch (error) {
            errors.push({ type: 'rpc_exception', error });
          }
        }

        // Check profile
        let profileCheck = null;
        if (user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('onagui_profiles')
              .select('onagui_type, is_admin')
              .eq('id', user.id)
              .single();
            profileCheck = profile;
            if (profileError) errors.push({ type: 'profile_error', error: profileError });
          } catch (error) {
            errors.push({ type: 'profile_exception', error });
          }
        }

        // Get cookies
        const cookies = document.cookie.split(';').map(c => c.trim());

        setDebugInfo({
          user,
          session,
          isAdmin: emailCheck || rpcCheck === true,
          adminCheckMethods: {
            emailCheck,
            rpcCheck,
            profileCheck
          },
          cookies,
          errors
        });
      } catch (error) {
        errors.push({ type: 'general_error', error });
        setDebugInfo({
          user: null,
          session: null,
          isAdmin: false,
          adminCheckMethods: {
            emailCheck: false,
            rpcCheck: null,
            profileCheck: null
          },
          cookies: [],
          errors
        });
      } finally {
        setLoading(false);
      }
    }

    getDebugInfo();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
        <p>Loading session information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Session Debug Information</h1>
      
      <div className="space-y-6">
        {/* User Information */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">User Information</h2>
          <pre className="bg-gray-700 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo?.user, null, 2)}
          </pre>
        </div>

        {/* Session Information */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Session Information</h2>
          <pre className="bg-gray-700 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo?.session, null, 2)}
          </pre>
        </div>

        {/* Admin Status */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Admin Status</h2>
          <div className="space-y-2">
            <p><strong>Is Admin:</strong> <span className={debugInfo?.isAdmin ? 'text-green-400' : 'text-red-400'}>{debugInfo?.isAdmin ? 'YES' : 'NO'}</span></p>
            <p><strong>Email Check (richtheocrypto@gmail.com):</strong> <span className={debugInfo?.adminCheckMethods.emailCheck ? 'text-green-400' : 'text-red-400'}>{debugInfo?.adminCheckMethods.emailCheck ? 'PASS' : 'FAIL'}</span></p>
            <p><strong>RPC Check:</strong> <span className={debugInfo?.adminCheckMethods.rpcCheck === true ? 'text-green-400' : debugInfo?.adminCheckMethods.rpcCheck === false ? 'text-red-400' : 'text-yellow-400'}>{debugInfo?.adminCheckMethods.rpcCheck === null ? 'NULL' : debugInfo?.adminCheckMethods.rpcCheck ? 'PASS' : 'FAIL'}</span></p>
          </div>
          <div className="mt-3">
            <h3 className="font-semibold">Profile Check:</h3>
            <pre className="bg-gray-700 p-3 rounded text-sm overflow-auto mt-2">
              {JSON.stringify(debugInfo?.adminCheckMethods.profileCheck, null, 2)}
            </pre>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Cookies</h2>
          <div className="space-y-1">
            {debugInfo?.cookies.map((cookie, index) => (
              <div key={index} className="text-sm font-mono bg-gray-700 p-2 rounded">
                {cookie}
              </div>
            ))}
          </div>
        </div>

        {/* Errors */}
        {debugInfo?.errors && debugInfo.errors.length > 0 && (
          <div className="bg-red-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Errors</h2>
            <div className="space-y-3">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="bg-red-800 p-3 rounded">
                  <p className="font-semibold">{error.type}</p>
                  <pre className="text-sm mt-2 overflow-auto">
                    {JSON.stringify(error.error, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Refresh Debug Info
            </button>
            <button 
              onClick={() => window.location.href = '/admin'} 
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Try Admin Access
            </button>
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.href = '/signin')} 
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}