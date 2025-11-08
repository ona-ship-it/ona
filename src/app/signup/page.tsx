'use client';

import AuthCard from '@/components/AuthCard';
import Navigation from '@/components/Navigation';

export default function SignUp() {
  return (
    <main className="min-h-screen bg-gray-800 text-white">
      <Navigation />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <AuthCard title="Create an Account" isLogin={false} />
      </div>
    </main>
  );
}