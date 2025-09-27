"use client";

import GoogleSignIn from "@/components/GoogleSignIn";
import PhoneSignIn from "@/components/PhoneSignIn";
import AuthCard from "@/components/AuthCard";
import { useState } from "react";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | null>(null);

  const handleSelectMethod = (method: 'google' | 'phone') => {
    setAuthMethod(method);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-purple-900">
      {!authMethod ? (
        <AuthCard 
          title="Sign In" 
          isLogin={true} 
          onSelectMethod={handleSelectMethod} 
        />
      ) : authMethod === 'google' ? (
        <div className="w-full max-w-md p-8 space-y-8 bg-purple-950 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-pink-500">Sign In with Google</h2>
          <div className="flex justify-center mt-6">
            <GoogleSignIn />
          </div>
          <button 
            onClick={() => setAuthMethod(null)}
            className="w-full py-2 text-white bg-purple-700 rounded-md hover:bg-purple-800"
          >
            Back to Sign In Options
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md p-8 space-y-8 bg-purple-950 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-pink-500">Sign In with Phone</h2>
          <div className="flex justify-center mt-6">
            <PhoneSignIn />
          </div>
          <button 
            onClick={() => setAuthMethod(null)}
            className="w-full py-2 text-white bg-purple-700 rounded-md hover:bg-purple-800"
          >
            Back to Sign In Options
          </button>
        </div>
      )}
    </div>
  );
}