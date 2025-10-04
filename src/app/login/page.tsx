"use client";

import GoogleSignIn from "@/components/GoogleSignIn";
import PhoneSignIn from "@/components/PhoneSignIn";
import AuthCard from "@/components/AuthCard";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const supabase = createClientComponentClient();
  
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

  const handleSelectMethod = (method: 'google' | 'phone') => {
    setAuthMethod(method);
  };

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