export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import GiveawaysClient from '../../components/GiveawaysClient';

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary-bg)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'var(--secondary-bg)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                Active Giveaways
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                Enter giveaways and win amazing prizes
              </p>
            </div>
            <Link
              href="/create-giveaway"
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 600,
                background: 'var(--accent-green)',
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
            >
              Create your giveaway
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <GiveawaysClient />
      </div>
    </div>
  );
}
