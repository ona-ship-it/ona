'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, Menu, Search } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
  menuOpen?: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, menuOpen }) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-light)',
      padding: '1rem 1.25rem',
      zIndex: 50,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--primary)',
          textDecoration: 'none',
        }}>
          ONAGUI
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'none',
          gap: '2rem',
          alignItems: 'center',
        }} className="desktop-nav">
          <Link href="/giveaways" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
            Giveaways
          </Link>
          <Link href="/raffles" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
            Raffles
          </Link>
          <Link href="/marketplace" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
            Marketplace
          </Link>
          <Link href="/fundraise" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
            Fundraise
          </Link>
        </nav>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <button
            style={{
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          
          <button
            style={{
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          
          <button
            onClick={onMenuClick}
            style={{
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  )
}
