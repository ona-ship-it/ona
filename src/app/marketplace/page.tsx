import Link from 'next/link'

export const metadata = { title: 'Marketplace | Onagui' }

export default function MarketplacePage() {
  const features = [
    { icon: '🖼️', label: 'Digital collectibles' },
    { icon: '⚡', label: 'Instant settlement' },
    { icon: '🔐', label: 'Escrow protection' },
    { icon: '💸', label: 'Low platform fees' },
  ]
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 text-6xl">🛒</div>
        <h1
          className="mb-3 text-4xl font-extrabold"
          style={{ color: 'var(--text-primary)' }}
        >
          Marketplace
        </h1>
        <p
          className="mb-2 text-lg font-semibold"
          style={{ color: 'var(--accent-green)' }}
        >
          Coming Soon
        </p>
        <p
          className="mb-8 max-w-md text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Buy and sell digital goods, collectibles, and raffle prizes.
          Secure peer-to-peer trading with instant settlement.
        </p>
        <div className="mb-8 grid w-full max-w-sm gap-3">
          {features.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <Link
          href="/"
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: 'var(--accent-green)' }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}