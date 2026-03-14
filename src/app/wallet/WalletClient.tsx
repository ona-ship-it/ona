'use client';

export default function WalletClient() {
  const assets = [
    { symbol: 'USDC', balance: '12.500000', usd: '$12.50', color: '#2775ca', initial: 'U' },
    { symbol: 'ETH', balance: '0.000000', usd: '$0.00', color: '#627eea', initial: 'E' },
    { symbol: 'BTC', balance: '0.000000', usd: '$0.00', color: '#f7931a', initial: 'B' },
    { symbol: 'BNB', balance: '0.000000', usd: '$0.00', color: '#f3ba2f', initial: 'B' },
    { symbol: 'SOL', balance: '0.000000', usd: '$0.00', color: '#9945ff', initial: 'S' },
    { symbol: 'USDT', balance: '0.000000', usd: '$0.00', color: '#26a17b', initial: 'U' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Value</span>
          <span style={{ color: 'var(--text-tertiary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
        </div>

        <div className="mb-1 text-5xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          12.50 <span className="text-2xl font-semibold" style={{ color: 'var(--text-secondary)' }}>USDC</span>
        </div>
        <div className="mb-6 text-lg" style={{ color: 'var(--text-tertiary)' }}>≈ $12.50 USD</div>

        <div className="mb-7 grid grid-cols-3 gap-3">
          <button className="rounded-xl py-3 text-base font-semibold text-white" style={{ background: 'var(--accent-green)' }}>
            Deposit
          </button>
          <button className="rounded-xl border py-3 text-base font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>
            Withdraw
          </button>
          <button className="rounded-xl border py-3 text-base font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>
            Transfer
          </button>
        </div>

        <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Crypto</h2>
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          {assets.map((asset, index) => (
            <div key={asset.symbol} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: index < assets.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: asset.color }}
              >
                {asset.initial}
              </div>
              <div>
                <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{asset.symbol}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {asset.balance} ≈ {asset.usd}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
