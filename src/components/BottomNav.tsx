// src/components/BottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Gift, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems: Array<{
    href: string;
    label: string;
    active: boolean;
    icon: typeof Home | 'plus';
    special?: boolean;
  }> = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: '/giveaways',
      icon: Gift,
      label: 'Giveaways',
      active: pathname === '/giveaways' || pathname.startsWith('/giveaways/')
    },
    {
      href: '/create-giveaway',
      icon: 'plus',
      label: 'Create',
      active: pathname === '/create-giveaway' || pathname.startsWith('/create-giveaway/'),
      special: true
    },
    {
      href: '/saved',
      icon: Heart,
      label: 'Saved',
      active: pathname === '/saved'
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
      active: pathname === '/profile' || pathname.startsWith('/profile/')
    }
  ];

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isSpecial = item.special;
          const Icon = item.icon === 'plus' ? null : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${item.active ? 'active' : ''} ${isSpecial ? 'create-btn' : ''}`}
            >
              {isSpecial ? (
                <div className="create-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              ) : (
                Icon && <Icon size={24} strokeWidth={2} />
              )}
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        /* Bottom Navigation - Always Dark Theme */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 25, 41, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(0, 212, 212, 0.1);
          display: flex;
          justify-content: space-around;
          padding: 8px 0 max(8px, env(safe-area-inset-bottom));
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
        }

        /* Nav Item */
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          color: rgba(148, 163, 184, 0.8);
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          min-width: 64px;
        }

        /* Icon */
        .nav-item :global(svg) {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Label */
        .nav-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Hover State */
        .nav-item:hover {
          color: rgba(0, 212, 212, 0.8);
          background: rgba(0, 212, 212, 0.05);
        }

        .nav-item:hover :global(svg) {
          transform: translateY(-2px);
        }

        /* Active State - iOS Style */
        .nav-item.active {
          color: #00D4D4;
          background: rgba(0, 212, 212, 0.1);
        }

        .nav-item.active :global(svg) {
          filter: drop-shadow(0 0 8px rgba(0, 212, 212, 0.6));
        }

        .nav-item.active .nav-label {
          font-weight: 700;
        }

        /* Active Indicator - iOS Style Dot */
        .nav-item.active::before {
          content: '';
          position: absolute;
          top: 6px;
          width: 4px;
          height: 4px;
          background: #00D4D4;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(0, 212, 212, 0.8);
        }

        /* Touch Feedback */
        .nav-item:active {
          transform: scale(0.95);
          background: rgba(0, 212, 212, 0.15);
        }

        /* Create Button Special Style */
        .nav-item.create-btn {
          position: relative;
        }

        .nav-item.create-btn .create-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00D4D4 0%, #10b981 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a1929;
          box-shadow: 0 4px 15px rgba(0, 212, 212, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .nav-item.create-btn:hover .create-icon {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 212, 212, 0.6);
        }

        .nav-item.create-btn.active .create-icon {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(0, 212, 212, 0.8);
        }

        .nav-item.create-btn .nav-label {
          color: #00D4D4;
          font-weight: 700;
        }

        /* Create button pulse animation */
        .nav-item.create-btn .create-icon::before {
          content: '';
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, #00D4D4 0%, #10b981 100%);
          border-radius: 14px;
          opacity: 0;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }

        /* Hide on Desktop */
        @media (min-width: 1024px) {
          .bottom-nav {
            display: none;
          }
        }

        /* Landscape Mode */
        @media (orientation: landscape) and (max-height: 500px) {
          .bottom-nav {
            padding: 4px 0;
          }
          
          .nav-item {
            padding: 4px 12px;
          }
          
          .nav-label {
            font-size: 10px;
          }
        }

        /* Safe Area Support - iOS */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .bottom-nav {
            padding-bottom: calc(8px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  );
}
