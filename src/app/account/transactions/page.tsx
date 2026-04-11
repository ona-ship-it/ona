'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import Link from 'next/link'

type Transaction = {
  id: string
  transaction_type: string
  amount: number
  currency: string
  payment_method: string | null
  status: string
  created_at: string
  giveaway_id: string | null
  ticket_id: string | null
  giveaway: { id: string; title: string; emoji: string | null } | null
}

type ApiResponse = {
  transactions: Transaction[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

const STATUS_COLOR: Record<string, string> = {
  completed: '#00ff88',
  pending: '#f59e0b',
  failed: '#ef4444',
}

const STATUS_BG: Record<string, string> = {
  completed: 'rgba(0,255,136,0.1)',
  pending: 'rgba(245,158,11,0.1)',
  failed: 'rgba(239,68,68,0.1)',
}

const TYPE_LABEL: Record<string, string> = {
  ticket_purchase: 'Giveaway Entry',
  raffle_ticket: 'Raffle Ticket',
  donation: 'Donation',
  fundraise: 'Fundraiser',
}

type FilterType = 'all' | 'giveaway' | 'raffle'
type FilterStatus = 'all' | 'completed' | 'pending' | 'failed'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(amount: number, currency: string) {
  if (currency === 'FREE') return 'Free'
  return `${amount.toFixed(2)} ${currency}`
}

export default function TransactionsPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

  const fetchTransactions = useCallback(
    async (p: number, type: FilterType, status: FilterStatus) => {
      setLoading(true)
      const params = new URLSearchParams({ page: String(p) })
      if (type !== 'all') params.set('type', type)
      if (status !== 'all') params.set('status', status)

      const res = await fetch(`/api/account/transactions?${params}`)
      if (res.ok) {
        const json: ApiResponse = await res.json()
        setTransactions(p === 1 ? json.transactions : (prev) => [...prev, ...json.transactions])
        setTotal(json.total)
        setHasMore(json.hasMore)
        setPage(p)
      }
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    if (!user) return
    fetchTransactions(1, typeFilter, statusFilter)
  }, [user, typeFilter, statusFilter, fetchTransactions])

  if (authLoading) {
    return (
      <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const FILTER_BTN = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: 20,
        border: active ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)',
        background: active ? 'rgba(0,255,136,0.1)' : 'transparent',
        color: active ? '#00ff88' : 'rgba(255,255,255,0.6)',
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Transaction History</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
              {total} transaction{total !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/account" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
            ← Back
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTER_BTN('All', typeFilter === 'all', () => setTypeFilter('all'))}
            {FILTER_BTN('Giveaways', typeFilter === 'giveaway', () => setTypeFilter('giveaway'))}
            {FILTER_BTN('Raffles', typeFilter === 'raffle', () => setTypeFilter('raffle'))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTER_BTN('Any Status', statusFilter === 'all', () => setStatusFilter('all'))}
            {FILTER_BTN('Completed', statusFilter === 'completed', () => setStatusFilter('completed'))}
            {FILTER_BTN('Pending', statusFilter === 'pending', () => setStatusFilter('pending'))}
            {FILTER_BTN('Failed', statusFilter === 'failed', () => setStatusFilter('failed'))}
          </div>
        </div>

        {/* List */}
        {loading && transactions.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>No transactions yet</p>
            <Link
              href="/giveaways"
              style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: 8, color: '#00ff88', textDecoration: 'none', fontSize: 14 }}
            >
              Browse Giveaways
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'background 0.2s',
                }}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,255,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {tx.giveaway?.emoji ?? (tx.transaction_type === 'raffle_ticket' ? '🎰' : '🎟️')}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.giveaway?.title ?? TYPE_LABEL[tx.transaction_type] ?? tx.transaction_type}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    {TYPE_LABEL[tx.transaction_type] ?? tx.transaction_type} · {formatDate(tx.created_at)}
                  </div>
                </div>

                {/* Status badge */}
                <div
                  style={{
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    color: STATUS_COLOR[tx.status] ?? '#fff',
                    background: STATUS_BG[tx.status] ?? 'rgba(255,255,255,0.05)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                  }}
                >
                  {tx.status}
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                  <div style={{ fontWeight: 700, color: tx.currency === 'FREE' ? 'rgba(255,255,255,0.5)' : '#00ff88', fontSize: 15 }}>
                    {formatAmount(tx.amount, tx.currency)}
                  </div>
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => fetchTransactions(page + 1, typeFilter, statusFilter)}
                disabled={loading}
                style={{
                  marginTop: 8,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: 'rgba(255,255,255,0.5)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  width: '100%',
                }}
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
