'use client';

import Navigation from '@/components/Navigation';
import type { User } from '@supabase/supabase-js';

export default function ClientWrapper({ children, initialUser }: { children: React.ReactNode; initialUser?: User | null }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top navbar, offset to account for the persistent sidebar */}
      <div style={{ marginLeft: 'var(--sidebar-width)' }}>
        <Navigation initialUser={initialUser ?? null} />
      </div>
      <main className="flex-1" style={{ marginLeft: 'var(--sidebar-width)' }}>
        {children}
      </main>
    </div>
  );
}
