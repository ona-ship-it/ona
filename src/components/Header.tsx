'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import ProfilePicture from '@/components/ProfilePicture'

export default function Header() {
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showProfilesMenu, setShowProfilesMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    setIsLoggedIn(!!session)
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b sticky top-0 z-50 backdrop-blur-xl" style={{ 
      background: 'var(--bg-secondary)',
      borderColor: 'var(--border)'
    }}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo - Always clickable to home */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>
              ONAGUI
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link 
              href="/" 
              className="text-xs sm:text-sm font-medium transition-colors"
              style={{ color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Home
            </Link>
            <Link 
              href="/giveaways" 
              className="text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/giveaways') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Giveaways
            </Link>
            <Link 
              href="/raffles" 
              className="text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/raffles') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Raffles
            </Link>
            <Link 
              href="/fundraise" 
              className="text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/fundraise') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Fundraise
            </Link>
            <Link 
              href="/marketplace" 
              className="text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isActive('/marketplace') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              Marketplace
            </Link>
            
            {/* Profiles Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowProfilesMenu(true)}
              onMouseLeave={() => setShowProfilesMenu(false)}
            >
              <div
                className="text-xs sm:text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
                style={{ color: isActive('/profiles') ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                Profiles
              </div>

              {showProfilesMenu && (
                <div
                  className="absolute top-full left-0 pt-2 w-64 z-50"
                >
                <div className="rounded-lg shadow-xl overflow-hidden"
                  style={{ 
                    background: 'var(--secondary-bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {/* My Profile */}
                  <Link
                    href="/profile"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowProfilesMenu(false)}
                  >
                    <div className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--accent-green)' }}>
                      <span>👤</span>
                      <span>My Profile</span>
                    </div>
                  </Link>

                  {/* Divider */}
                  <div className="px-4 py-2" style={{ background: 'rgba(0, 255, 136, 0.05)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Top Creators
                    </div>
                  </div>

                  {/* Top 5 Profiles */}
                  <Link
                    href="/profiles"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowProfilesMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          Tech King
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          547 giveaways • 98% trust
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/profiles"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowProfilesMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          Crypto Queen
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          432 giveaways • 96% trust
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/profiles"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowProfilesMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          Giveaway Master
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          389 giveaways • 95% trust
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/profiles"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowProfilesMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs font-bold">
                        4
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          Prize Hunter
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          321 giveaways • 94% trust
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/profiles"
                    className="block px-4 py-3 transition-colors cursor-pointer"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--tertiary-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowProfilesMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-xs font-bold">
                        5
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          Lucky Star
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          298 giveaways • 93% trust
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Side */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Sign Up Button - Only show when NOT logged in */}
            {!isLoggedIn && (
              <Link href="/signup">
                <button
                  className="px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-semibold rounded-md transition-all hover:opacity-90"
                  style={{ 
                    background: 'var(--accent-blue)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Sign Up
                </button>
              </Link>
            )}

            {/* Create Button with Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCreateMenu(true)}
                onMouseLeave={() => setShowCreateMenu(false)}
                className="px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-semibold rounded-md transition-all hover:opacity-90"
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

            {/* User Profile - Only show when logged in */}
            {isLoggedIn && (
              <Link href="/dashboard">
                <ProfilePicture size="sm" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
