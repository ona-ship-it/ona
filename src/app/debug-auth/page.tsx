"use client";

import { useState } from 'react';
import { clearAuthTokens, validateSession, refreshSession } from '@/utils/authUtils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DebugAuthPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleClearTokens = async () => {
    setLoading(true);
    setStatus('Clearing authentication tokens...');
    
    const success = await clearAuthTokens();
    if (success) {
      setStatus('✅ Tokens cleared successfully! You can now try signing in again.');
    } else {
      setStatus('❌ Failed to clear tokens. Try manually clearing browser storage.');
    }
    setLoading(false);
  };

  const handleValidateSession = async () => {
    setLoading(true);
    setStatus('Validating current session...');
    
    const isValid = await validateSession();
    setStatus(isValid ? '✅ Session is valid' : '❌ Session is invalid or expired');
    setLoading(false);
  };

  const handleRefreshSession = async () => {
    setLoading(true);
    setStatus('Attempting to refresh session...');
    
    const success = await refreshSession();
    setStatus(success ? '✅ Session refreshed successfully' : '❌ Failed to refresh session');
    setLoading(false);
  };

  const handleCheckCurrentUser = async () => {
    setLoading(true);
    setStatus('Checking current user...');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setStatus(`❌ Error: ${error.message}`);
      } else if (user) {
        setStatus(`✅ User found: ${user.email} (ID: ${user.id})`);
      } else {
        setStatus('❌ No user found');
      }
    } catch (err) {
      setStatus(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setStatus('Signing out...');
    
    try {
      await supabase.auth.signOut();
      setStatus('✅ Signed out successfully');
    } catch (err) {
      setStatus(`❌ Sign out error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Authentication Debug Tools
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={handleClearTokens}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Clear All Auth Tokens
            </button>
            
            <button
              onClick={handleValidateSession}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Validate Current Session
            </button>
            
            <button
              onClick={handleRefreshSession}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Refresh Session
            </button>
            
            <button
              onClick={handleCheckCurrentUser}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Check Current User
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Sign Out
            </button>
          </div>
          
          {status && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{status}</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}