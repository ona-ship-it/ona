'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import ProfilePicture from '@/components/ProfilePicture'

export default function Header() {
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b sticky top-0 z-50 backdrop-blur-xl" style={{ 
      background: 'rgba(11, 14, 17, 0.95)',
      borderColor: 'var(--border)'
    }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Always clickable to home */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>
              ONAGUI
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium transition-colors"
              style={{ color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Home
            </Link>
            <Link 
              href="/giveaways" 
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/giveaways') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Giveaways
            </Link>
            <Link 
              href="/raffles" 
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/raffles') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Raffles
            </Link>
            <Link 
              href="/fundraise" 
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/fundraise') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Fundraise
            </Link>
            <Link 
              href="/marketplace" 
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/marketplace') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Marketplace
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Create Button with Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCreateMenu(true)}
                onMouseLeave={() => setShowCreateMenu(false)}
                className="px-5 py-2.5 text-sm font-semibold rounded-md transition-all hover:opacity-90"
                style={{ 
                  background: 'var(--accent-green)',
                  color: 'var(--text-primary)'
                }}
              >
                + Create
              </button>

              {showCreateMenu && (
                <div
                  onMouseEnter={() => setShowCreateMenu(true)}
                  onMouseLeave={() => setShowCreateMenu(false)}
                  className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-xl overflow-hidden z-50"
                  style={{ 
                    background: 'var(--secondary-bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <Link
                    href="/create"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Giveaway
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Create a free or paid giveaway
                    </div>
                  </Link>
                  
                  <Link
                    href="/raffles/create"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Raffle
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Launch a raffle for prizes
                    </div>
                  </Link>
                  
                  <Link
                    href="/fundraise/create"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Fundraise
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Start a fundraising campaign
                    </div>
                  </Link>
                  
                  <Link
                    href="/marketplace/create"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Marketplace
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      List an item for sale
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile */}
            <Link href="/dashboard">
              <ProfilePicture size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
