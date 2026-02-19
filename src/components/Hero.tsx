'use client'

import { useEffect, useState } from 'react'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="hero-section">
      {/* Animated background */}
      <div className="hero-background">
        <div className="stars"></div>
        <div className="tech-grid"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="container">
          <div className="hero-inner">
            {/* Main headline */}
            <h1 className="hero-title animate-fade-in">
              ONAGUI
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle animate-fade-in">
              Statistically, Onagui is your best chance to win
            </p>

            {/* Trust indicators */}
            <div className="hero-trust animate-fade-in">
              <div className="trust-item">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.87-.96-7-5.21-7-9.5V8.3l7-3.11 7 3.11V11c0 4.29-3.13 8.54-7 9.5z"/>
                  <path d="M10 13l-2-2-1.41 1.41L10 15.83l6-6-1.41-1.42L10 13z"/>
                </svg>
                <span>100% Secure</span>
              </div>
              
              <div className="trust-item">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Verified Winners</span>
              </div>
              
              <div className="trust-item">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <span>Instant Payouts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll">
        <div className="scroll-indicator animate-bounce">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
