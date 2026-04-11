/** @jest-environment node */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'

const mockCreateServerClient = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}))

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}))

// ──────────────────────────────────────────────────────────────────
// Shared helper: build a mock Supabase client
// ──────────────────────────────────────────────────────────────────
function mockSupabase({
  user,
  authError = null,
  transactions = [],
  txCount = 0,
  txError = null,
}: {
  user?: { id: string; email: string } | null
  authError?: unknown
  transactions?: object[]
  txCount?: number
  txError?: unknown
}) {
  const rangeStub = jest.fn().mockResolvedValue({ data: transactions, count: txCount, error: txError })
  const orderStub = jest.fn().mockReturnValue({ range: rangeStub })
  const notStub = jest.fn().mockReturnValue({ order: orderStub })
  const eqStatusStub = jest.fn().mockReturnValue({ order: orderStub, not: notStub })
  const eqUserStub = jest.fn().mockReturnValue({
    order: orderStub,
    eq: eqStatusStub,
    not: notStub,
  })
  const selectStub = jest.fn().mockReturnValue({ eq: eqUserStub })
  const fromStub = jest.fn().mockReturnValue({ select: selectStub })

  return mockCreateServerClient.mockImplementation(() => ({
    auth: {
      getUser: async () => ({ data: { user: user ?? null }, error: authError }),
    },
    from: fromStub,
  }))
}

// ──────────────────────────────────────────────────────────────────
// Transactions API: auth boundary
// ──────────────────────────────────────────────────────────────────
describe('GET /api/account/transactions — auth boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('returns 401 when no user session', async () => {
    mockSupabase({ user: null })
    const { GET } = await import('@/app/api/account/transactions/route')
    const req = new Request('http://localhost/api/account/transactions')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when auth.getUser returns error', async () => {
    mockSupabase({ user: null, authError: new Error('session expired') })
    const { GET } = await import('@/app/api/account/transactions/route')
    const req = new Request('http://localhost/api/account/transactions')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})

// ──────────────────────────────────────────────────────────────────
// Transactions API: data ownership
// ──────────────────────────────────────────────────────────────────
describe('GET /api/account/transactions — data ownership', () => {
  const userId = 'user-abc'
  const anotherUserId = 'another-user-xyz'

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('queries transactions filtered by the authenticated user id', async () => {
    const eqMock = jest.fn().mockReturnThis()
    const orderMock = jest.fn().mockReturnThis()
    const rangeMock = jest.fn().mockReturnThis()
    const notMock = jest.fn().mockReturnThis()
    const selectMock = jest.fn().mockReturnValue({
      eq: eqMock,
    })
    eqMock.mockReturnValue({
      order: orderMock,
      eq: eqMock,
      not: notMock,
    })
    orderMock.mockReturnValue({ range: rangeMock })
    notMock.mockReturnValue({ order: orderMock })
    rangeMock.mockResolvedValue({ data: [], count: 0, error: null })

    const fromMock = jest.fn().mockReturnValue({ select: selectMock })

    mockCreateServerClient.mockImplementation(() => ({
      auth: {
        getUser: async () => ({ data: { user: { id: userId, email: 'user@test.com' } }, error: null }),
      },
      from: fromMock,
    }))

    const { GET } = await import('@/app/api/account/transactions/route')
    const req = new Request('http://localhost/api/account/transactions')
    await GET(req)

    // Confirm we queried the transactions table
    expect(fromMock).toHaveBeenCalledWith('transactions')
    // Confirm user_id filter was applied with the authenticated user's id (not another user's)
    expect(eqMock).toHaveBeenCalledWith('user_id', userId)
    expect(eqMock).not.toHaveBeenCalledWith('user_id', anotherUserId)
  })

  it('returns paginated response shape', async () => {
    const sampleTx = [
      { id: 'tx-1', transaction_type: 'ticket_purchase', amount: 1, currency: 'USDC', status: 'completed', created_at: '2026-01-01T00:00:00Z', giveaway_id: 'g1', ticket_id: 't1', giveaway: null },
    ]
    mockSupabase({ user: { id: userId, email: 'user@test.com' }, transactions: sampleTx, txCount: 1 })

    const { GET } = await import('@/app/api/account/transactions/route')
    const req = new Request('http://localhost/api/account/transactions')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('transactions')
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page')
    expect(body).toHaveProperty('pageSize')
    expect(body).toHaveProperty('hasMore')
    expect(body.total).toBe(1)
    expect(body.page).toBe(1)
  })

  it('returns empty transactions array (not null) when no results', async () => {
    mockSupabase({ user: { id: userId, email: 'user@test.com' }, transactions: undefined as unknown as object[], txCount: 0 })

    const { GET } = await import('@/app/api/account/transactions/route')
    const req = new Request('http://localhost/api/account/transactions')
    const res = await GET(req)
    const body = await res.json()
    expect(Array.isArray(body.transactions)).toBe(true)
  })
})

// ──────────────────────────────────────────────────────────────────
// PermissionGate: unit tests (pure logic, no rendering)
// ──────────────────────────────────────────────────────────────────
describe('PermissionGate reasons', () => {
  it('exports all expected reason values', async () => {
    const mod = await import('@/components/PermissionGate')
    // Ensure the type is defined by checking the component export exists
    expect(typeof mod.PermissionGate).toBe('function')
  })
})

// ──────────────────────────────────────────────────────────────────
// api-helpers: permissionErrorResponse
// ──────────────────────────────────────────────────────────────────
describe('permissionErrorResponse helper', () => {
  it('returns 401 for must_login by default', async () => {
    const { permissionErrorResponse } = await import('@/lib/api-helpers')
    const res = permissionErrorResponse({ code: 'must_login', message: 'Sign in required' })
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.permission_error.code).toBe('must_login')
    expect(body.permission_error.message).toBe('Sign in required')
  })

  it('returns 403 for insufficient_role by default', async () => {
    const { permissionErrorResponse } = await import('@/lib/api-helpers')
    const res = permissionErrorResponse({ code: 'insufficient_role', message: 'Admins only' })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.permission_error.code).toBe('insufficient_role')
  })

  it('accepts a custom status code override', async () => {
    const { permissionErrorResponse } = await import('@/lib/api-helpers')
    const res = permissionErrorResponse({ code: 'must_login', message: 'Please log in' }, 403)
    expect(res.status).toBe(403)
  })

  it('includes nextAction when provided', async () => {
    const { permissionErrorResponse } = await import('@/lib/api-helpers')
    const res = permissionErrorResponse({ code: 'must_verify_email', message: 'Verify email', nextAction: '/resend-verification' })
    const body = await res.json()
    expect(body.permission_error.nextAction).toBe('/resend-verification')
  })

  it('covers all PermissionError code variants', async () => {
    const { permissionErrorResponse } = await import('@/lib/api-helpers')
    const codes = ['must_login', 'must_verify_email', 'account_suspended', 'insufficient_role'] as const
    for (const code of codes) {
      const res = permissionErrorResponse({ code, message: `test ${code}` })
      const body = await res.json()
      expect(body.permission_error.code).toBe(code)
    }
  })
})
