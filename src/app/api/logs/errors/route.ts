import { NextRequest, NextResponse } from 'next/server'

interface ErrorLog {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
}

/**
 * POST /api/logs/errors
 * Log client-side errors for monitoring and debugging
 */
export async function POST(request: NextRequest) {
  try {
    const body: ErrorLog = await request.json()

    // Validate error log
    if (!body.errorId || !body.message || !body.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log to console/file in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[CLIENT ERROR LOG]', {
        ...body,
        timestamp: new Date(body.timestamp).toLocaleString(),
      })
    }

    // In production, you could:
    // 1. Store in database for analytics
    // 2. Send to external logging service
    // 3. Alert on critical errors
    // For now, just acknowledge receipt

    // Example: Log to Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        // This is a simplified example - implement as needed
        await logToSupabase(body)
      } catch (dbError) {
        console.error('Failed to log to database:', dbError)
        // Don't fail the API response if DB logging fails
      }
    }

    return NextResponse.json(
      { success: true, errorId: body.errorId },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error logging endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

/**
 * Log error to Supabase (optional)
 */
async function logToSupabase(errorLog: ErrorLog) {
  try {
    // Import Supabase server client
    const { createClient } = await import('@/lib/supabaseServer')
    const supabase = await createClient()

    // Insert error log record
    await supabase.from('error_logs').insert({
      error_id: errorLog.errorId,
      message: errorLog.message,
      stack: errorLog.stack,
      component_stack: errorLog.componentStack,
      url: errorLog.url,
      user_agent: errorLog.userAgent,
      created_at: errorLog.timestamp,
    })
  } catch (error) {
    console.error('Supabase logging error:', error)
    // Silently fail - don't break error reporting if database is unavailable
  }
}
