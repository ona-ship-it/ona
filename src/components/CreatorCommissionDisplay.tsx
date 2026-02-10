'use client'

import React from 'react'

export type CommissionHistoryItem = {
  id: string
  title: string
  amount: number
  status: 'paid' | 'pending'
}

export type CommissionTotals = {
  totalEarned: number
  paidOut: number
  pending: number
}

type CreatorCommissionDisplayProps = {
  totals: CommissionTotals
  history: CommissionHistoryItem[]
}

const formatUSDC = (amount: number) =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`

export default function CreatorCommissionDisplay({ totals, history }: CreatorCommissionDisplayProps) {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-white">ONAGUI Subs</h2>
        <p className="text-slate-400">
          Commission from paid tickets. Transparent split: 50% ONAGUI, 40% winners, 10% creator.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700">
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Total Earned</div>
          <div className="text-2xl font-black text-white">{formatUSDC(totals.totalEarned)}</div>
        </div>
        <div className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700">
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Paid Out</div>
          <div className="text-2xl font-black text-emerald-400">{formatUSDC(totals.paidOut)}</div>
        </div>
        <div className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700">
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Pending</div>
          <div className="text-2xl font-black text-amber-400">{formatUSDC(totals.pending)}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Revenue Split</span>
          <span>50 / 40 / 10</span>
        </div>
        <div className="h-3 w-full rounded-full overflow-hidden bg-slate-800">
          <div className="h-full flex">
            <div className="w-1/2 bg-cyan-500" />
            <div className="w-2/5 bg-violet-500" />
            <div className="w-1/10 bg-emerald-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <span>50% ONAGUI platform</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            <span>40% winners pool</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>10% creator commission</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Commission History</h3>
          <span className="text-xs text-slate-500">Latest payouts</span>
        </div>
        {history.length === 0 ? (
          <div className="text-slate-400 text-sm">No commissions yet.</div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-4"
              >
                <div>
                  <div className="text-white font-semibold">{item.title}</div>
                  <div className="text-xs text-slate-400">{formatUSDC(item.amount)}</div>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    item.status === 'paid'
                      ? 'text-emerald-300 border-emerald-500/50 bg-emerald-500/10'
                      : 'text-amber-300 border-amber-500/50 bg-amber-500/10'
                  }`}
                >
                  {item.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <h4 className="text-white font-semibold mb-2">How it works</h4>
          <p>
            Paid tickets increase the prize pool while supporting the creator. After the initial
            winner is paid, the remaining pool is split 50% ONAGUI, 40% winners, 10% creator.
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <h4 className="text-white font-semibold mb-2">Features</h4>
          <ul className="space-y-2">
            <li>Escrow-secured initial prize</li>
            <li>Auto-calculation on ticket purchases</li>
            <li>Flexible winner distribution</li>
            <li>Transparent breakdown for users</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
