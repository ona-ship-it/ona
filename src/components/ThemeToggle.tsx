// src/components/ThemeToggle.tsx
'use client';

import { useTheme } from '@/components/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className={`toggle-track ${theme === 'dark' ? 'dark' : 'light'}`}>
          <div className="toggle-thumb">
            {theme === 'dark' ? (
              <Moon size={16} strokeWidth={2.5} />
            ) : (
              <Sun size={16} strokeWidth={2.5} />
            )}
          </div>
        </div>
      </button>

      <style jsx>{`
        .theme-toggle {
          position: relative;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        .toggle-track {
          width: 60px;
          height: 32px;
          background: var(--toggle-bg);
          border: 2px solid var(--toggle-border);
          border-radius: 16px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .toggle-track.dark {
          --toggle-bg: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          --toggle-border: rgba(0, 212, 212, 0.3);
        }

        .toggle-track.light {
          --toggle-bg: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          --toggle-border: rgba(100, 116, 139, 0.3);
        }

        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: var(--thumb-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--thumb-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .toggle-track.dark .toggle-thumb {
          --thumb-bg: linear-gradient(135deg, #00D4D4 0%, #10b981 100%);
          --thumb-color: #0a1929;
          transform: translateX(28px);
        }

        .toggle-track.light .toggle-thumb {
          --thumb-bg: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          --thumb-color: #ffffff;
          transform: translateX(0);
        }

        .theme-toggle:hover .toggle-track {
          transform: scale(1.05);
        }

        .theme-toggle:active .toggle-track {
          transform: scale(0.98);
        }

        /* Glow effect */
        .toggle-track.dark::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #00D4D4 0%, #10b981 100%);
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .theme-toggle:hover .toggle-track.dark::before {
          opacity: 0.3;
        }

        .toggle-track.light::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .theme-toggle:hover .toggle-track.light::before {
          opacity: 0.3;
        }

        /* Icon animations */
        .toggle-thumb :global(svg) {
          animation: iconSpin 0.5s ease;
        }

        @keyframes iconSpin {
          0% { transform: rotate(0deg) scale(0.8); opacity: 0; }
          100% { transform: rotate(360deg) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}