"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
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

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="text-white">Loading...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}