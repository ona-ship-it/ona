'use client'

import { useState } from 'react'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'

export default function DemoPage() {
  const [progress, setProgress] = useState(60)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: 'var(--space-8) 0' }}>
      {/* Header */}
      <div className="container" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="flex justify-between items-center">
          <Logo variant="text" size="lg" />
          <ThemeToggle />
        </div>
      </div>

      <div className="container">
        {/* Page Title */}
        <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <h1 
            className="gradient-animated"
            style={{ 
              fontSize: 'var(--text-4xl)', 
              fontWeight: 'var(--font-bold)',
              marginBottom: 'var(--space-2)'
            }}
          >
            ONAGUI Design System
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
            Modern component library with cyan branding
          </p>
        </div>

        {/* Buttons Section */}
        <section className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Buttons
          </h2>
          
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
              Variants
            </h3>
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-success">Success</button>
              <button className="btn btn-danger">Danger</button>
              <button className="btn btn-ghost">Ghost</button>
              <button className="btn btn-primary" disabled>Disabled</button>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
              Sizes
            </h3>
            <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary">Medium</button>
              <button className="btn btn-primary btn-lg">Large</button>
              <button className="btn btn-primary btn-xl">Extra Large</button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
              With Icons
            </h3>
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
              <button className="btn btn-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm
              </button>
              <button className="btn-icon btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)', animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Cards
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="card card-flat">
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                Standard Card
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Hover for lift effect
              </p>
            </div>

            <div className="card-premium">
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                Premium Card
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Animated shimmer effect
              </p>
            </div>

            <div className="card animate-glow-pulse">
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                Glowing Card
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Pulsing cyan glow
              </p>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)', animationDelay: '0.2s' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Form Inputs
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                Text Input
              </label>
              <input className="input" placeholder="Enter your name" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                Small Input
              </label>
              <input className="input input-sm" placeholder="Small size" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                Select
              </label>
              <select className="select">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                Large Input
              </label>
              <input className="input input-lg" placeholder="Large size" />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
              Textarea
            </label>
            <textarea className="textarea" rows={4} placeholder="Enter description..."></textarea>
          </div>
        </section>

        {/* Badges Section */}
        <section className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)', animationDelay: '0.3s' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Badges
          </h2>
          
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-cyan">New</span>
            <span className="badge badge-success">Active</span>
            <span className="badge badge-warning">Pending</span>
            <span className="badge badge-danger">Error</span>
          </div>
        </section>

        {/* Progress Bars */}
        <section className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)', animationDelay: '0.4s' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Progress Bars
          </h2>
          
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div className="flex justify-between" style={{ marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)' }}>Default</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{progress}%</span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div className="flex justify-between" style={{ marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)' }}>Success</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>80%</span>
            </div>
            <div className="progress">
              <div className="progress-bar progress-bar-success" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between" style={{ marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)' }}>Danger</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>30%</span>
            </div>
            <div className="progress">
              <div className="progress-bar progress-bar-danger" style={{ width: '30%' }}></div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => setProgress(Math.random() * 100)}>
              Randomize
            </button>
          </div>
        </section>

        {/* Alerts */}
        <section className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)', animationDelay: '0.5s' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Alerts
          </h2>
          
          <div className="alert alert-info" style={{ marginBottom: 'var(--space-3)' }}>
            <span>ℹ️</span>
            <div>
              <strong>Info:</strong> This is an informational message.
            </div>
          </div>

          <div className="alert alert-success" style={{ marginBottom: 'var(--space-3)' }}>
            <span>✅</span>
            <div>
              <strong>Success:</strong> Your action was completed successfully.
            </div>
          </div>

          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-3)' }}>
            <span>⚠️</span>
            <div>
              <strong>Warning:</strong> Please review this carefully.
            </div>
          </div>

          <div className="alert alert-danger">
            <span>❌</span>
            <div>
              <strong>Error:</strong> Something went wrong.
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)', animationDelay: '0.6s' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Animations
          </h2>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="card text-center animate-fade-in">
              <p style={{ fontSize: 'var(--text-sm)' }}>Fade In</p>
            </div>
            <div className="card text-center animate-slide-up">
              <p style={{ fontSize: 'var(--text-sm)' }}>Slide Up</p>
            </div>
            <div className="card text-center animate-scale-in">
              <p style={{ fontSize: 'var(--text-sm)' }}>Scale In</p>
            </div>
            <div className="card text-center animate-glow-pulse">
              <p style={{ fontSize: 'var(--text-sm)' }}>Glow Pulse</p>
            </div>
          </div>
        </section>

        {/* Skeleton Loaders */}
        <section className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            Skeleton Loaders
          </h2>
          
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
          
          <div style={{ marginTop: 'var(--space-4)' }} className="flex gap-3 items-center">
            <div className="skeleton skeleton-avatar"></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
