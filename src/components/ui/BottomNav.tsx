'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Gift, Ticket, ShoppingBag, User } from 'lucide-react'

export const BottomNav: React.FC = () => {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/giveaways', label: 'Giveaways', icon: Gift },
    { href: '/raffles', label: 'Raffles', icon: Ticket },
    { href: '/marketplace', label: 'Market', icon: ShoppingBag },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-light)',
        padding: '0.75rem 0.5rem calc(0.75rem + env(safe-area-inset-bottom))',
        zIndex: 50,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.25rem',
      }} className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                padding: '0.5rem',
                textDecoration: 'none',
                color: active ? 'var(--primary)' : 'var(--text-tertiary)',
                transition: 'color 0.2s ease',
                minHeight: '44px',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: active ? 600 : 500,
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <style jsx>{`
        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
