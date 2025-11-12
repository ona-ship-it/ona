'use client';

import Navigation from '@/components/Navigation';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top navbar, offset to account for the persistent sidebar */}
      <div style={{ marginLeft: 'var(--sidebar-width)' }}>
        <Navigation />
      </div>
      <main className="flex-1" style={{ marginLeft: 'var(--sidebar-width)' }}>
        {children}
      </main>
    </div>
  );
}