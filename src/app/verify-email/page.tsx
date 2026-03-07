'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const error = searchParams.get('error')

  const getContent = () => {
    if (status === 'success') {
      return {
        icon: '✅',
        title: 'Email Verified!',
        message: 'Your email has been verified successfully. Welcome to Onagui!',
        color: '#00ff88',
        cta: { label: 'Go to Raffles', href: '/raffles' },
      }
    }
    if (status === 'already_verified') {
      return {
        icon: '✅',
        title: 'Already Verified',
        message: 'Your email was already verified. You\'re all set!',
        color: '#00ff88',
        cta: { label: 'Go to Raffles', href: '/raffles' },
      }
    }
    if (status === 'pending') {
      return {
        icon: '📧',
        title: 'Check Your Email',
        message: 'We sent a verification link to your email address. Click the link to verify your account. Check your spam folder if you don\'t see it.',
        color: '#3b82f6',
        cta: { label: 'Go Home', href: '/' },
      }
    }
    if (error === 'expired') {
      return {
        icon: '⏰',
        title: 'Link Expired',
        message: 'This verification link has expired. Please sign in and request a new one from your profile settings.',
        color: '#ef4444',
        cta: { label: 'Sign In', href: '/login' },
      }
    }
    if (error === 'invalid_token' || error === 'missing_token') {
      return {
        icon: '❌',
        title: 'Invalid Link',
        message: 'This verification link is invalid or has already been used.',
        color: '#ef4444',
        cta: { label: 'Go Home', href: '/' },
      }
    }
    return {
      icon: '⚠️',
      title: 'Something Went Wrong',
      message: 'We couldn\'t verify your email. Please try again or contact support.',
      color: '#f59e0b',
      cta: { label: 'Go Home', href: '/' },
    }
  }

  const content = getContent()

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          background: '#1e293b', border: '1px solid rgba(0,255,136,0.15)',
          borderRadius: '20px', padding: '48px 32px',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>{content.icon}</div>
          <h1 style={{
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
            fontSize: '28px', color: content.color, margin: '0 0 12px',
          }}>
            {content.title}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 32px' }}>
            {content.message}
          </p>
          <Link
            href={content.cta.href}
            style={{
              display: 'inline-block', padding: '14px 40px',
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: '#0a1929', fontSize: '14px', fontWeight: 700,
              textDecoration: 'none', borderRadius: '10px',
              fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px',
            }}
          >
            {content.cta.label}
          </Link>
        </div>
      </div>
    </div>
  )
}
