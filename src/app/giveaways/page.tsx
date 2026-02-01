export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import GiveawaysClient from '../../components/GiveawaysClient';

export default function Page() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="border-b" style={{ 
        background: 'var(--secondary-bg)',
        borderColor: 'var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Active Giveaways
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Enter giveaways and win amazing prizes
              </p>
            </div>
            <Link
              href="/giveaways/new"
              className="px-6 py-3 rounded-lg font-semibold transition-all"
              style={{ background: 'var(--accent-green)', color: 'var(--text-primary)' }}
            >
              Create your giveaway
            </Link>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <GiveawaysClient />
      </div>
    </div>
  );
}
