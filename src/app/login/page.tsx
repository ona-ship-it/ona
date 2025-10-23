"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Redirect to signin page with any query parameters preserved
    const redirectTo = searchParams.get('redirectTo');
    const signinUrl = redirectTo ? `/signin?redirectTo=${encodeURIComponent(redirectTo)}` : '/signin';
    router.replace(signinUrl);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="text-white">Redirecting to sign in...</div>
    </div>
  );
}