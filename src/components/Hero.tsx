'use client'

export default function Hero() {
  return (
    <section className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-7xl px-4 py-12 text-center md:py-16">
        <h1
          className="font-extrabold tracking-tight"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'Space Grotesk, Inter, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          ONAGUI
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-base md:text-xl" style={{ color: 'var(--text-secondary)' }}>
          Your best chance to win
        </p>

        <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 border-t pt-4 md:grid-cols-3" style={{ borderColor: 'var(--border)' }}>
          {[
            '100% Secure',
            'Verified Winners',
            'Instant Payouts',
          ].map((item) => (
            <div key={item} className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
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
