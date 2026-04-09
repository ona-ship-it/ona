'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import ProfilePicture from '@/components/ProfilePicture'
import NotificationBell from '@/components/NotificationBell'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/giveaways', label: 'Giveaways' },
  { href: '/raffles', label: 'Raffles' },
  { href: '/fundraise', label: 'Fundraise' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/profiles', label: 'Profiles' },
]

export default function Header() {
  const pathname = usePathname()
  const supabase = createClient()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuth()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setShowMobileMenu(false)
  }, [pathname])

  async function checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setIsLoggedIn(!!session)
  }

  const activeStyle = (href: string) => ({
    color: pathname === href ? 'var(--accent-green)' : 'var(--text-secondary)',
  })

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', height: 64, alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <Link href="/" className="font-extrabold tracking-tight text-3xl" style={{ color: 'var(--text-primary)' }}>
          ONAGUI
        </Link>

        <nav className="hdr-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={activeStyle(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hdr-actions">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Sign In
              </Link>
              <Link
                href="/raffles/create"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--accent-green)' }}
              >
                + Create
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/raffles/create" className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent-green)' }}>
                + Create
              </Link>
              <Link href="/profile" className="block">
                <ProfilePicture size="sm" />
              </Link>
            </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Link href="/raffles/create" className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent-green)' }}>
                          + Create
                        </Link>
                        <NotificationBell />
                        <Link href="/profile" className="block">
                          <ProfilePicture size="sm" />
                        </Link>
                      </div>
          )}
        </div>

        <button
          onClick={() => setShowMobileMenu((prev) => !prev)}
          className="hdr-burger"
          aria-label="Toggle menu"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {showMobileMenu && (
        <div className="hdr-mobile-menu border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
          <div className="space-y-1 px-4 py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium"
                style={{
                  color: pathname === item.href ? 'var(--accent-green)' : 'var(--text-secondary)',
                  background: pathname === item.href ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 flex gap-2">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="flex-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/raffles/create"
                    className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold text-white"
                    style={{ background: 'var(--accent-green)' }}
                  >
                    + Create
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="flex-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/raffles/create"
                    className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold text-white"
                    style={{ background: 'var(--accent-green)' }}
                  >
                    + Create
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
