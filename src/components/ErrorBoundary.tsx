'use client'

import React, { ReactNode, useEffect } from 'react'
import Link from 'next/link'

type SentryLike = {
  captureException: (error: Error, context: {
    tags: Record<string, string>
    extra: { errorInfo: string | null }
    level: string
  }) => void
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

/**
 * Global Error Boundary Component
 * Catches React errors and displays user-friendly error message
 * Logs errors to Sentry if configured
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.setState({
      error,
      errorInfo,
      errorId,
    })

    // Log to Sentry if available
    logErrorToSentry(error, errorInfo, errorId)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error)
      console.error('Error info:', errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            resetError={() =>
              this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
              })
            }
            errorId={this.state.errorId}
          />
        )
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null
  resetError: () => void
  errorId: string
}

function ErrorFallback({ error, resetError, errorId }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2M7.5 5.5H20.25a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H7.5"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>

          {/* Error Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
                <strong>Error:</strong> {error.message}
              </p>
            </div>
          )}

          {/* Error ID */}
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Error ID:</strong> {errorId}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Share this ID with support to help us investigate
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={resetError}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg text-center transition-colors"
            >
              Go Home
            </Link>
          </div>

          {/* Support Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Need help?{' '}
            <a
              href="mailto:support@onagui.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Log error to Sentry
 */
function logErrorToSentry(
  error: Error,
  errorInfo: React.ErrorInfo,
  errorId: string
) {
  try {
    // Check if Sentry is configured
    const sentry = typeof window !== 'undefined' ? (window as Window & { Sentry?: SentryLike }).Sentry : undefined
    if (sentry) {
      sentry.captureException(error, {
        tags: {
          errorBoundary: 'true',
          errorId,
        },
        extra: {
          errorInfo: errorInfo.componentStack,
        },
        level: 'error',
      })
    }
  } catch (sentryError: unknown) {
    console.error('Failed to log to Sentry:', sentryError)
  }

  // Also send to custom error logging endpoint
  logToCustomEndpoint(error, errorInfo, errorId)
}

/**
 * Log error to custom endpoint
 */
async function logToCustomEndpoint(
  error: Error,
  errorInfo: React.ErrorInfo,
  errorId: string
) {
  try {
    if (typeof window === 'undefined') return

    const payload = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // Send to logging endpoint (implement your own)
    await fetch('/api/logs/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail if logging endpoint is down
      console.error('Failed to send error log to server')
    })
  } catch (err) {
    console.error('Error logging failed:', err)
  }
}
