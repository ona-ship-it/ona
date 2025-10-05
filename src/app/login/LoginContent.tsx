"use client";

import GoogleSignIn from "@/components/GoogleSignIn";
import PhoneSignIn from "@/components/PhoneSignIn";
import AuthCard from "@/components/AuthCard";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface LoginContentProps {
  authMethod: 'google' | 'phone' | null;
  setAuthMethod: (method: 'google' | 'phone' | null) => void;
  handleSelectMethod: (method: 'google' | 'phone') => void;
  router: any;
  supabase: any;
}

export default function LoginContent({
  authMethod,
  setAuthMethod,
  handleSelectMethod,
  router,
  supabase
}: LoginContentProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      }
    };
    
    checkSession();
  }, [redirectTo, router, supabase.auth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-800">
      {!authMethod ? (
        <AuthCard 
          title="Sign In" 
          isLogin={true} 
          onSelectMethod={handleSelectMethod} 
        />
      ) : authMethod === 'google' ? (
        <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-pink-500">Sign In with Google</h2>
          <div className="flex justify-center mt-6">
            <GoogleSignIn />
          </div>
          <button 
            onClick={() => setAuthMethod(null)}
            className="w-full py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
          >
            Back to Sign In Options
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-green-500">Sign In with Phone</h2>
          <div className="flex justify-center mt-6">
            <PhoneSignIn />
          </div>
          <button 
            onClick={() => setAuthMethod(null)}
            className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Back to Sign In Options
          </button>
        </div>
      )}
    </div>
  );
}