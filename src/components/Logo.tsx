import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  variant?: 'full' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 180, height: 60 },
    lg: { width: 240, height: 80 },
  }

  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64,
  }

  return (
    <Link href="/" className={`inline-block ${className}`}>
      {variant === 'full' && (
        <div className="relative" style={{ width: sizes[size].width, height: sizes[size].height }}>
          {/* Replace with your actual logo */}
          <Image
            src="/logo.png"
            alt="ONAGUI"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      )}

      {variant === 'icon' && (
        <div className="relative" style={{ width: iconSizes[size], height: iconSizes[size] }}>
          {/* Husky mascot icon */}
          <Image
            src="/logo-icon.png"
            alt="ONAGUI"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      )}

      {variant === 'text' && (
        <span
          className="font-heading font-bold"
          style={{
            fontSize: size === 'sm' ? 'var(--text-xl)' : size === 'md' ? 'var(--text-2xl)' : 'var(--text-4xl)',
            background: 'linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-cyan-hover) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ONAGUI
        </span>
      )}
    </Link>
  )
}
