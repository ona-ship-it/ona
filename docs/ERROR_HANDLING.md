# Error Handling & Logging Guide

Onagui includes comprehensive error handling and optional error logging for debugging and monitoring production issues.

## Overview

The platform includes:
- **Global Error Boundary** - Catches React component errors
- **API Error Responses** - Standardized error format for all endpoints
- **Custom Error Logging** - Server-side error tracking
- **Sentry Integration** - Optional external error monitoring

## Global Error Boundary

The `ErrorBoundary` component wraps the entire application and catches unhandled React errors.

### How It Works

```tsx
// Automatically catches errors from:
// - React component rendering
// - Event handlers in render (e.g., onClick)
// - Lifecycle methods
// - Constructors of child components
```

### User Experience

When an error occurs, users see:
1. **Error message** - "Oops! Something went wrong"
2. **Error ID** - Unique identifier for support
3. **Recovery options** - "Try Again" and "Go Home" buttons
4. **Support contact** - Link to contact support

### Development Experience

In development mode, errors show:
- **Full error message**
- **Component stack trace**
- **Error ID for tracking**

## API Error Responses

All API endpoints use a standardized error format:

### Success Response

```json
{
  "data": { /* response data */ },
  "status": "success",
  "timestamp": "2024-03-12T15:30:00Z"
}
```

### Error Response

```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "status": "error",
  "timestamp": "2024-03-12T15:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Transaction processed |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Raffle already closed |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Database failure |
| 503 | Unavailable | Service down |

## Using API Error Helpers

### In API Routes

```typescript
import { 
  successResponse, 
  errorResponse, 
  HttpErrors,
  validateRequiredFields 
} from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const errors = validateRequiredFields(body, ['email', 'password'])
    if (errors.length > 0) {
      return errorResponse('Validation failed', errors, 400)
    }

    // Process...
    const result = await processPayment(body)

    // Return success
    return successResponse(result, 200)
  } catch (error) {
    return HttpErrors.InternalError()
  }
}
```

### HTTP Error Methods

```typescript
// 400 Bad Request
HttpErrors.BadRequest('Invalid input')
HttpErrors.BadRequest('Validation failed', validationErrors)

// 401 Unauthorized
HttpErrors.Unauthorized('Please log in')

// 403 Forbidden
HttpErrors.Forbidden('You do not have permission')

// 404 Not Found
HttpErrors.NotFound('Raffle not found')

// 409 Conflict
HttpErrors.Conflict('Raffle is no longer active')

// 429 Rate Limited
HttpErrors.RateLimited('Too many payment attempts')

// 500 Server Error
HttpErrors.InternalError('Failed to process payment')
```

## Client-Side Error Handling

### API Calls

```typescript
// Bad approach - ignoring errors
const data = await fetch('/api/raffles')
  .then(r => r.json())

// Good approach - handling errors
const response = await fetch('/api/raffles')
const data = await response.json()

if (data.status === 'error') {
  // Handle error
  console.error(data.error)
  showUserError(data.error)
}
```

### React Hooks

```typescript
// Handle errors in useEffect
useEffect(() => {
  async function loadData() {
    try {
      const response = await fetch('/api/raffles')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setRaffles(data.data)
    } catch (error) {
      console.error('Failed to load raffles:', error)
      setError('Failed to load raffles. Please try again.')
    }
  }
  loadData()
}, [])
```

### Error Messages to Users

```typescript
// Show user-friendly messages
const userMessages: Record<number, string> = {
  400: 'Please check your input and try again',
  401: 'Please log in to continue',
  403: 'You do not have permission for this action',
  404: 'This item was not found',
  429: 'Too many requests. Please wait a moment',
  500: 'Server error. Please try again later',
  503: 'Service is temporarily unavailable',
}

function handleApiError(status: number, error: string) {
  const message = userMessages[status] || error
  showNotification(message, 'error')
}
```

## Sentry Integration (Optional)

Set up Sentry for monitoring errors in production.

### 1. Create Sentry Account

1. Go to https://sentry.io
2. Sign up for free account
3. Create a new Next.js project
4. Copy your DSN (Data Source Name)

### 2. Install Sentry

```bash
npm install @sentry/nextjs
```

### 3. Configure Environment Variables

```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token-for-build-time
```

### 4. Initialize Sentry

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event, hint) {
    // Filter out errors we don't want to track
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        // Don't track network errors
        if ((error.message as string).includes('Failed to fetch')) {
          return null
        }
      }
    }
    return event
  },
})
```

### 5. Add to Layout

```tsx
// src/app/layout.tsx
import * as Sentry from '@sentry/nextjs'

// Sentry is automatically initialized, errors are captured
```

### 6. Verify in Development

```bash
# Test error tracking
npm run dev

# Trigger a test error in your app, check Sentry dashboard
```

## Server-Side Error Logging

### Log to Supabase

```typescript
// Log errors to database
async function logErrorToDatabase(error: Error, context: any) {
  const supabase = await createClient()
  
  await supabase.from('error_logs').insert({
    message: error.message,
    stack: error.stack,
    context: JSON.stringify(context),
    created_at: new Date().toISOString(),
  })
}

// Use in API routes
export async function POST(request: NextRequest) {
  try {
    // Route logic...
  } catch (error) {
    await logErrorToDatabase(error as Error, {
      endpoint: request.url,
      method: request.method,
      ip: request.ip,
    })
    return HttpErrors.InternalError()
  }
}
```

### Structured Logging

```typescript
// Use consistent log format
function logError(level: 'error' | 'warn' | 'info', message: string, context?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }

  console.log(JSON.stringify(logEntry))

  // Send to logging service (Sentry, Datadog, etc.)
  if (level === 'error' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const Sentry = require('@sentry/nextjs')
    Sentry.captureMessage(message, 'error')
  }
}

// Usage
logError('error', 'Payment processing failed', {
  raffleId: '123',
  userId: 'user456',
  amount: 50,
  error: 'Insufficient funds',
})
```

## Error Monitoring Best Practices

### ✅ Do's

- **Log with context** - Include relevant information
- **Use error levels** - error, warn, info appropriately
- **Monitor critical paths** - Payment, auth, winner drawing
- **Set up alerts** - Get notified of critical errors
- **Review logs regularly** - Find patterns and bugs
- **Track error trends** - Monitor error rates over time

### ❌ Don'ts

- **Log sensitive data** - Never log passwords, API keys
- **Log too much** - Overwhelming noise makes issues hard to find
- **Ignore errors** - All errors should be tracked
- **Keep errors out of production** - Remove debug logging from prod
- **Log PII** - Avoid logging personal identifiable information

## Common Error Scenarios

### Payment Failures

```typescript
try {
  const tx = await processPayment(data)
} catch (error) {
  logError('error', 'Payment failed', {
    raffleId: data.raffleId,
    userId: user.id,
    amount: data.amount,
    network: data.paymentMethod,
    errorMessage: error.message,
  })
  throw new PaymentError('Payment processing failed')
}
```

### Database Errors

```typescript
const { data, error } = await supabase.from('raffles').select()
if (error) {
  logError('error', 'Database query failed', {
    table: 'raffles',
    operation: 'select',
    code: error.code,
    message: error.message,
  })
  return HttpErrors.InternalError('Failed to load raffles')
}
```

### Authentication Errors

```typescript
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  logError('warn', 'Auth verification failed', {
    error: error?.message,
    ip: request.ip,
  })
  return HttpErrors.Unauthorized('Invalid session')
}
```

## Debugging

### Enable verbose logging

```env
# .env.local
DEBUG=ona:*
NODE_ENV=development
```

### Check console for errors

Browser DevTools → Console tab shows:
- React error warnings
- Network errors
- Unhandled promise rejections

### Review Sentry dashboard

Log in to https://sentry.io to see:
- Real-time error stream
- Error grouping and trends
- User impact analysis
- Release health

## Testing Error Handling

### Unit Tests

```typescript
describe('error handling', () => {
  it('should catch and handle API errors', async () => {
    const response = await fetch('/api/test')
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data.status).toBe('error')
    expect(data.error).toBeDefined()
  })
})
```

### Integration Tests

```typescript
it('should handle payment failures gracefully', async () => {
  const response = await fetch('/api/raffles/invalid/buy-crypto', {
    method: 'POST',
    body: JSON.stringify({ /* invalid data */ })
  })
  
  expect(response.status).toBe(400)
  const data = await response.json()
  expect(data.errors).toBeDefined()
})
```

## Support

For questions:
- Docs: https://onagui.com/docs
- GitHub: https://github.com/ona-ship-it/ona/issues
- Email: support@onagui.com
