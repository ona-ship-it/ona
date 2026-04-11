'use client'

export default function Hero() {
  return (
    <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 16px 56px', textAlign: 'center' }}>
        <h1
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'Space Grotesk, Inter, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          ONAGUI
        </h1>

        <p style={{ color: 'var(--text-secondary)', margin: '12px auto 0', maxWidth: 560, fontSize: 18 }}>
          The social fintech platform
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          maxWidth: 640,
          margin: '24px auto 0',
          borderTop: '1px solid var(--border)',
          paddingTop: 16,
        }}>
          {[
            'Win & Earn',
            'Fundraise & Give',
            'Connect & Grow',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: 'var(--text-tertiary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-green)">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z" />
              </svg>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
