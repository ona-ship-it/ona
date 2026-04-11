'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
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
        showResend: false,
      }
    }
    if (status === 'already_verified') {
      return {
        icon: '✅',
        title: 'Already Verified',
        message: "Your email was already verified. You're all set!",
        color: '#00ff88',
        cta: { label: 'Go to Raffles', href: '/raffles' },
        showResend: false,
      }
    }
    if (status === 'pending') {
      return {
        icon: '📧',
        title: 'Check Your Email',
        message: "We sent a verification link to your email address. Click the link to verify your account. Check your spam folder if you don't see it.",
        color: '#3b82f6',
        cta: { label: 'Go Home', href: '/' },
        showResend: true,
      }
    }
    if (error === 'expired') {
      return {
        icon: '⏰',
        title: 'Link Expired',
        message: 'This verification link has expired. Request a new one below.',
        color: '#ef4444',
        cta: { label: 'Sign In', href: '/login' },
        showResend: true,
      }
    }
    if (error === 'invalid_token' || error === 'missing_token') {
      return {
        icon: '❌',
        title: 'Invalid Link',
        message: 'This verification link is invalid or has already been used.',
        color: '#ef4444',
        cta: { label: 'Go Home', href: '/' },
        showResend: false,
      }
    }
    return {
      icon: '⚠️',
      title: 'Something Went Wrong',
      message: "We couldn't verify your email. Please try again or contact support.",
      color: '#f59e0b',
      cta: { label: 'Go Home', href: '/' },
      showResend: false,
    }
  }

  const content = getContent()

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#00ff88', letterSpacing: 2, margin: 0 }}>ONAGUI</h1>
        </div>
        <div style={{
          background: '#1e293b', border: '1px solid rgba(0,255,136,0.15)',
          borderRadius: '20px', padding: '48px 32px',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>{content.icon}</div>
          <h2 style={{ fontWeight: 700, fontSize: '28px', color: content.color, margin: '0 0 12px' }}>
            {content.title}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 32px' }}>
            {content.message}
          </p>
          <Link
            href={content.cta.href}
            style={{
              display: 'inline-block', padding: '14px 40px',
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: '#0a1929', fontSize: '14px', fontWeight: 700,
              textDecoration: 'none', borderRadius: '10px', letterSpacing: '0.5px',
            }}
          >
            {content.cta.label}
          </Link>

          {content.showResend && (
            <div style={{ marginTop: 24 }}>
              <p style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>
                Didn&apos;t receive it?
              </p>
              <Link
                href="/resend-verification"
                style={{
                  display: 'inline-block', padding: '10px 28px',
                  border: '1px solid rgba(0,255,136,0.3)',
                  color: '#00ff88', fontSize: '13px', fontWeight: 600,
                  textDecoration: 'none', borderRadius: '10px',
                  background: 'rgba(0,255,136,0.05)',
                }}
              >
                Resend Verification Email
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
