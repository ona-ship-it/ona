'use client'

import Link from 'next/link'
import { useState } from 'react'

interface LogoProps {
  variant?: 'default' | 'icon' | 'full'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ variant = 'default', size = 'md', className = '' }: LogoProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizes = {
    sm: { text: 'text-xl', icon: 'w-6 h-6' },
    md: { text: 'text-2xl', icon: 'w-8 h-8' },
    lg: { text: 'text-3xl', icon: 'w-10 h-10' }
  }

  const Logo3D = () => (
    <div 
      className={`relative ${sizes[size].icon} transition-transform duration-300 ${
        isHovered ? 'scale-110' : 'scale-100'
      }`}
    >
      {/* Gradient background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--accent-gold)] rounded-lg blur-md opacity-50" />
      
      {/* Main icon */}
      <div className="relative bg-gradient-to-br from-[var(--brand-primary)] to-[var(--accent-gold)] rounded-lg p-1.5 shadow-lg">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full"
          stroke="white"
          strokeWidth="2"
        >
          {/* Gift box icon */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      </div>
    </div>
  )

  const LogoText = () => (
    <span
      className={`${sizes[size].text} font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--accent-gold)] bg-clip-text text-transparent transition-all duration-300 ${
        isHovered ? 'tracking-wider' : 'tracking-normal'
      }`}
    >
      ONAGUI
    </span>
  )

  const content = (
    <>
      {variant === 'icon' ? (
        <Logo3D />
      ) : variant === 'full' ? (
        <div className="flex items-center gap-3">
          <Logo3D />
          <LogoText />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Logo3D />
          {size !== 'sm' && <LogoText />}
        </div>
      )}
    </>
  )

  return (
    <Link
      href="/"
      className={`inline-flex items-center transition-opacity hover:opacity-90 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </Link>
  )
}

export default Logo
