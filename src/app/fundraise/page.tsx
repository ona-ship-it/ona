import Link from 'next/link'

export const metadata = { title: 'Fundraise | Onagui' }

export default function FundraisePage() {
  const features = [
    { icon: '🎯', label: 'Set funding goals' },
    { icon: '📊', label: 'Real-time progress tracking' },
    { icon: '🔒', label: 'On-chain transparency' },
    { icon: '🎁', label: 'Backer rewards and perks' },
  ]
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 text-6xl">🤝</div>
        <h1
          className="mb-3 text-4xl font-extrabold"
          style={{ color: 'var(--text-primary)' }}
        >
          Fundraise
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
          Launch transparent fundraising campaigns powered by blockchain.
          Set goals, track progress, and reward your supporters.
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