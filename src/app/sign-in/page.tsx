"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

const SignInPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { login } = useAuth();
  
  const handleSignIn = () => {
    console.log('Sign in clicked');
    // Call the login function which now generates a wallet
    login();
    // Redirect to my-account page
    window.location.href = '/my-account';
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg shadow-xl w-80 overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
          <div className="flex items-center">
            <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-white text-sm">Sign in to onagui.com with google.com</span>
          </div>
          <Link href="/" className="text-gray-400 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
        </div>
        
        <div className="p-3">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden mr-2">
              {/* Profile picture placeholder */}
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            <div>
              <div className="font-medium text-white text-sm">Google User</div>
              <div className="text-xs text-gray-300">Sign in with your Google account</div>
            </div>
          </div>
          
          <button 
            onClick={handleSignIn}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors mb-3"
          >
            Continue with Google
          </button>
          
          <div className="border-t border-gray-700 pt-3 mb-3"></div>
          
          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors mb-2"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
            Log in with your phone
          </button>

          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-1.5 px-3 rounded text-sm transition-colors mb-2"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z"/>
            </svg>
            Continue with Discord
          </button>

          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center bg-black hover:bg-gray-900 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors mb-2"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Continue with X
          </button>

          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center bg-black hover:bg-gray-900 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors mb-2"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
            </svg>
            Continue with Apple
          </button>
          
          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors mb-2"
          >
            <span className="w-4 h-4 mr-2 flex items-center justify-center">✉️</span>
            Log in with your email
          </button>
          
          <div className="mt-3 text-xs text-gray-400">
            <p>
              By continuing, you agree to our <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        <Link href="/" className="text-blue-400 hover:text-blue-300">
          Return to Home
        </Link>
      </div>
    </main>
  );
};

export default SignInPage;