'use client'

import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('onagui-theme') as Theme || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('onagui-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Prevent flash of unstyled content
  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-all hover:bg-[var(--surface-hover)] group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun Icon (Light Mode) */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
        } absolute inset-0 m-auto`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" strokeWidth="2" />
        <path
          strokeLinecap="round"
          strokeWidth="2"
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
      
      {/* Moon Icon (Dark Mode) */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  )
}