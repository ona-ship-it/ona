'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Gift, Heart, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems: Array<{
    href: string
    label: string
    active: boolean
    icon: typeof Home | 'plus'
    special?: boolean
  }> = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/',
    },
    {
      href: '/giveaways',
      icon: Gift,
      label: 'Giveaways',
      active: pathname === '/giveaways' || pathname.startsWith('/giveaways/'),
    },
    {
      href: '/create-giveaway',
      icon: 'plus',
      label: 'Create',
      active: pathname === '/create-giveaway' || pathname.startsWith('/create-giveaway/'),
      special: true,
    },
    {
      href: '/fundraise',
      icon: Heart,
      label: 'Fundraise',
      active: pathname.startsWith('/fundraise'),
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
      active: pathname === '/profile' || pathname.startsWith('/profile/'),
    },
  ]

  return (
    <>
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon === 'plus' ? null : item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${item.active ? 'active' : ''} ${item.special ? 'create-btn' : ''}`}
            >
              {item.special ? (
                <div className="create-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  </svg>
                </div>
              ) : (
                Icon && <Icon size={22} strokeWidth={2} />
              )}
              <span className="nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 6px 0 calc(8px + env(safe-area-inset-bottom));
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
        }

        .nav-item {
          min-width: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-decoration: none;
          color: var(--text-tertiary);
          transition: color 0.2s ease;
        }

        .nav-item :global(svg) {
          transition: transform 0.2s ease;
        }

        .nav-item.active {
          color: var(--brand-cyan-dark);
        }

        .nav-label {
          font-size: 10px;
          font-weight: 500;
        }

        .create-btn {
          transform: translateY(-6px);
        }

        .create-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--accent-green);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
        }

        .create-btn .nav-label {
          font-weight: 700;
        }

        @media (min-width: 1024px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
