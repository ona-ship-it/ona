'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  action_url: string | null
  is_read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, string> = {
  giveaway_won: '🏆',
  raffle_won: '🎯',
  entry_confirmed: '🎟️',
  raffle_ticket: '🎰',
  giveaway_ending: '⏳',
  system: '📢',
}

const TYPE_LABEL: Record<string, string> = {
  giveaway_won: 'Giveaway Won',
  raffle_won: 'Raffle Won',
  entry_confirmed: 'Entry Confirmed',
  raffle_ticket: 'Raffle Ticket',
  giveaway_ending: 'Ending Soon',
  system: 'System',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/account/notifications')
    if (res.ok) {
      const json = await res.json()
      setNotifications(json.notifications ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) return
    load()
  }, [user, load])

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    await fetch(`/api/account/notifications/${id}`, { method: 'PATCH' })
  }

  async function markAllRead() {
    setMarkingAll(true)
    await fetch('/api/account/notifications/read-all', { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  async function handleClick(n: Notification) {
    if (!n.is_read) await markRead(n.id)
    if (n.action_url) router.push(n.action_url)
  }

  if (authLoading) {
    return (
      <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Notifications</h1>
            {unreadCount > 0 && (
              <p style={{ color: '#00ff88', fontSize: 13, marginTop: 4 }}>
                {unreadCount} unread
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                style={{
                  background: 'none',
                  border: '1px solid rgba(0,255,136,0.3)',
                  borderRadius: 8,
                  color: '#00ff88',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '6px 14px',
                }}
              >
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
            <Link href="/account" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
              ← Back
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>You&apos;re all caught up!</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 8 }}>Notifications will appear here when you win, enter giveaways, or receive updates.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '16px 20px',
                  background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(0,255,136,0.04)',
                  borderLeft: n.is_read ? '3px solid transparent' : '3px solid #00ff88',
                  borderRadius: 10,
                  cursor: n.action_url || !n.is_read ? 'pointer' : 'default',
                  marginBottom: 4,
                  transition: 'background 0.15s',
                }}
              >
                {/* Icon */}
                <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, paddingTop: 2 }}>
                  {TYPE_ICON[n.type] ?? '🔔'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: n.is_read ? 400 : 600, color: n.is_read ? 'rgba(255,255,255,0.7)' : '#fff' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                  {n.body && (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>{n.body}</p>
                  )}
                  <span style={{
                    display: 'inline-block',
                    marginTop: 6,
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
