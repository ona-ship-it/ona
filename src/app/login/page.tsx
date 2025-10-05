"use client";

import GoogleSignIn from "@/components/GoogleSignIn";
import PhoneSignIn from "@/components/PhoneSignIn";
import AuthCard from "@/components/AuthCard";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Separate component that uses useSearchParams
import LoginContent from "./LoginContent";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSelectMethod = (method: 'google' | 'phone') => {
    setAuthMethod(method);
  };

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginContent 
        authMethod={authMethod}
        setAuthMethod={setAuthMethod}
        handleSelectMethod={handleSelectMethod}
        router={router}
        supabase={supabase}
      />
    </Suspense>
  );
}
}