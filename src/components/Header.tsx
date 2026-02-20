'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import ProfilePicture from '@/components/ProfilePicture'

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
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-extrabold tracking-tight text-3xl" style={{ color: 'var(--text-primary)' }}>
          ONAGUI
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
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

        <div className="hidden items-center gap-2 md:flex">
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
                href="/create-giveaway"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--accent-green)' }}
              >
                + Create
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/create-giveaway" className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent-green)' }}>
                + Create
              </Link>
              <Link href="/profile" className="block">
                <ProfilePicture size="sm" />
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowMobileMenu((prev) => !prev)}
          className="md:hidden"
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
        <div className="border-t md:hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
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
                    href="/create-giveaway"
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
                    href="/create-giveaway"
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
