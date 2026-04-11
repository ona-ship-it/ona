import { NextRequest, NextResponse } from 'next/server'

/**
 * Validation error response
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  errors?: ValidationError[]
  status: 'success' | 'error'
  timestamp: string
}

/**
 * Validate JSON request body
 */
export async function validateJsonBody(request: NextRequest) {
  try {
    const body = await request.json()
    return { success: true, data: body }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON in request body',
    }
  }
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = []

  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push({
        field,
        message: `${field} is required`,
      })
    }
  })

  return errors
}

/**
 * Validate field types
 */
export function validateFieldTypes(
  data: Record<string, unknown>,
  fieldTypes: Record<string, 'string' | 'number' | 'boolean' | 'object'>
): ValidationError[] {
  const errors: ValidationError[] = []

  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    if (data[field] !== undefined && data[field] !== null) {
      const actualType = typeof data[field]
      if (actualType !== expectedType) {
        errors.push({
          field,
          message: `${field} must be a ${expectedType}, got ${actualType}`,
        })
      }
    }
  })

  return errors
}

/**
 * Standardized permission / authorization error shape returned by API routes.
 *
 * code        — machine-readable reason (matches PermissionReason in PermissionGate)
 * message     — human-readable description
 * nextAction  — optional hint for the client (e.g. "verify_email", "contact_support")
 */
export interface PermissionError {
  code: 'must_login' | 'must_verify_email' | 'account_suspended' | 'insufficient_role'
  message: string
  nextAction?: string
}

/**
 * Returns a 401 or 403 NextResponse with a standard PermissionError body.
 *
 * httpStatus defaults to 403 for role/suspension errors and 401 for auth errors.
 */
export function permissionErrorResponse(
  error: PermissionError,
  httpStatus?: number,
): NextResponse {
  const defaultStatus =
    error.code === 'must_login' || error.code === 'must_verify_email' ? 401 : 403
  return NextResponse.json(
    { permission_error: error, status: 'error', timestamp: new Date().toISOString() },
    { status: httpStatus ?? defaultStatus },
  )
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      error: undefined,
      status: 'success',
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  errors?: ValidationError[],
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      data: undefined,
      error,
      errors,
      status: 'error',
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Validation middleware for API routes
 */
export function validateRequest(config: {
  requiredFields?: string[]
  fieldTypes?: Record<string, 'string' | 'number' | 'boolean' | 'object'>
  maxBodySize?: number
}) {
  return async (request: NextRequest) => {
    // Check body size
    if (config.maxBodySize) {
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > config.maxBodySize) {
        return errorResponse('Request body too large', undefined, 413)
      }
    }

    // Parse and validate JSON
    const jsonResult = await validateJsonBody(request)
    if (!jsonResult.success) {
      return errorResponse(jsonResult.error || 'Invalid JSON', undefined, 400)
    }

    const data = jsonResult.data
    const validationErrors: ValidationError[] = []

    // Validate required fields
    if (config.requiredFields) {
      validationErrors.push(...validateRequiredFields(data, config.requiredFields))
    }

    // Validate field types
    if (config.fieldTypes) {
      validationErrors.push(...validateFieldTypes(data, config.fieldTypes))
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', validationErrors, 400)
    }

    return { success: true, data }
  }
}

/**
 * Rate limiting helper
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
) {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
  }
}

/**
 * HTTP error responses
 */
export const HttpErrors = {
  BadRequest: (message: string, errors?: ValidationError[]) =>
    errorResponse(message, errors, 400),

  Unauthorized: (message = 'Unauthorized') =>
    errorResponse(message, undefined, 401),

  Forbidden: (message = 'Forbidden') =>
    errorResponse(message, undefined, 403),

  NotFound: (message = 'Resource not found') =>
    errorResponse(message, undefined, 404),

  Conflict: (message: string) =>
    errorResponse(message, undefined, 409),

  RateLimited: (message = 'Too many requests') =>
    errorResponse(message, undefined, 429),

  InternalError: (message = 'Internal server error') =>
    errorResponse(message, undefined, 500),

  BadGateway: (message = 'Bad Gateway') =>
    errorResponse(message, undefined, 502),

  ServiceUnavailable: (message = 'Service unavailable') =>
    errorResponse(message, undefined, 503),
}
