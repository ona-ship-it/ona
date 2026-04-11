import Link from 'next/link'

// Force dynamic rendering so Next.js never tries to statically prerender
// this page (which would require Supabase at build time).
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a1929', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 900, color: '#00ff88', margin: '0 0 8px', lineHeight: 1 }}>404</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', margin: '0 0 32px' }}>
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: 'linear-gradient(135deg,#00ff88,#00cc6a)',
            color: '#0a1929',
            fontWeight: 700,
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.875rem',
            letterSpacing: '0.5px',
          }}
        >
          GO HOME
        </Link>
      </div>
    </main>
  )
}
