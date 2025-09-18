'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string | null>(null)
  const [projectInfo, setProjectInfo] = useState<{
    url: string | undefined;
    hasUser: boolean;
    sessionExists: boolean;
  } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        // Get project info (this will work if connection is successful)
        const { data: { user } } = await supabase.auth.getUser()
        
        setProjectInfo({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasUser: !!user,
          sessionExists: !!data.session
        })
        
        setConnectionStatus('connected')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Supabase Connection Test
          </h1>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                connectionStatus === 'testing' ? 'bg-yellow-400 animate-pulse' :
                connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-lg font-medium">
                {connectionStatus === 'testing' && 'Testing connection...'}
                {connectionStatus === 'connected' && 'Connected successfully!'}
                {connectionStatus === 'error' && 'Connection failed'}
              </span>
            </div>

            {connectionStatus === 'connected' && projectInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Connection Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Project URL:</span>
                    <span className="ml-2 text-gray-600">{projectInfo.url}</span>
                  </div>
                  <div>
                    <span className="font-medium">Auth Status:</span>
                    <span className="ml-2 text-gray-600">
                      {projectInfo.hasUser ? 'User logged in' : 'No user logged in'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Session:</span>
                    <span className="ml-2 text-gray-600">
                      {projectInfo.sessionExists ? 'Active session' : 'No active session'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Connection Error
                </h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• If connected: Your Supabase setup is working!</li>
                <li>• Configure authentication providers in Supabase dashboard</li>
                <li>• Create login/signup pages</li>
                <li>• Set up database tables and policies</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Link 
                href="/auth/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </Link>
              <Link 
                href="/" 
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}