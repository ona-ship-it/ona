'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import { supabase } from '@/lib/supabaseClient';

interface CreateWizardProps {
  title: string;
  children?: React.ReactNode;
}

export default function CreateWizard({ title, children }: CreateWizardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push(`/signin?redirectTo=${encodeURIComponent(pathname)}`);
          return;
        }
      } catch (e) {
        // If auth check fails for any reason, treat as unauthenticated
        router.push(`/signin?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router, pathname]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#1a0033] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageTitle title={title} className="text-3xl md:text-4xl mb-8" />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0033] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle title={title} className="text-3xl md:text-4xl mb-8" />
        {children || (
          <div className="bg-purple-900 bg-opacity-30 rounded-xl overflow-hidden shadow-lg border border-purple-500/30 p-6">
            <p className="text-purple-200">Coming soon. The creation flow for this feature will be available shortly.</p>
          </div>
        )}
      </div>
    </main>
  );
}