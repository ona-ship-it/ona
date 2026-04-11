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

describe('admin API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('users route redirects to /signin when no session', async () => {
    const { GET } = await import('@/app/api/admin/users/route')

    mockCreateServerClient.mockImplementation(() => ({
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    }))

    const request = new Request('http://localhost/api/admin/users', { method: 'GET' })
    const response = await GET(request as never)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/signin')
  })

  it('users route returns 403 for non-admin email', async () => {
    const { GET } = await import('@/app/api/admin/users/route')

    mockCreateServerClient.mockImplementation(() => ({
      auth: {
        getSession: async () => ({ data: { session: { user: { email: 'user@example.com' } } }, error: null }),
        getUser: async () => ({ data: { user: { id: 'u1', email: 'user@example.com' } }, error: null }),
      },
    }))

    const request = new Request('http://localhost/api/admin/users', { method: 'GET' })
    const response = await GET(request as never)

    expect(response.status).toBe(403)
  })

  it('participation-events route returns 401 without session', async () => {
    const { GET } = await import('@/app/api/admin/participation-events/route')

    mockCreateServerClient.mockImplementation(() => ({
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    }))

    const request = { nextUrl: new URL('http://localhost/api/admin/participation-events') }
    const response = await GET(request as never)

    expect(response.status).toBe(401)
  })

  it('participation-events route returns 403 for non-admin email', async () => {
    const { GET } = await import('@/app/api/admin/participation-events/route')

    mockCreateServerClient.mockImplementation(() => ({
      auth: {
        getSession: async () => ({
          data: { session: { user: { email: 'not-admin@example.com' } } },
          error: null,
        }),
      },
    }))

    const request = { nextUrl: new URL('http://localhost/api/admin/participation-events') }
    const response = await GET(request as never)

    expect(response.status).toBe(403)
  })

  it('giveaways-no-entries GET returns 401 when user missing', async () => {
    const { GET } = await import('@/app/api/admin/giveaways-no-entries/route')

    mockCreateServerClient.mockImplementation(() => ({
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
    }))

    const request = {}
    const response = await GET(request as never)

    expect(response.status).toBe(401)
  })

  it('giveaways-no-entries GET returns giveaway list for allowed admin email', async () => {
    const { GET } = await import('@/app/api/admin/giveaways-no-entries/route')

    const mockGiveaways = [{ id: 'g1', title: 'Test Giveaway', tickets_sold: 0 }]

    const supabase = {
      auth: {
        getUser: async () => ({
          data: { user: { id: 'u1', email: 'samiraeddaoudi88@gmail.com' } },
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            neq: async () => ({ data: mockGiveaways, error: null }),
          }),
        }),
      }),
    }

    mockCreateServerClient.mockImplementation(() => supabase)

    const request = {}
    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.giveaways).toEqual(mockGiveaways)
  })

  it('giveaways-no-entries POST returns 400 for invalid action', async () => {
    const { POST } = await import('@/app/api/admin/giveaways-no-entries/route')

    const supabase = {
      auth: {
        getUser: async () => ({
          data: { user: { id: 'u1', email: 'richtheocrypto@gmail.com' } },
        }),
      },
      from: jest.fn(),
    }

    mockCreateServerClient.mockImplementation(() => supabase)

    const request = new Request('http://localhost/api/admin/giveaways-no-entries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ giveawayId: 'g1', action: 'bad-action' }),
    })

    const response = await POST(request as never)

    expect(response.status).toBe(400)
  })

  it('giveaways-no-entries POST promote allows both allowlisted admin emails', async () => {
    const { POST } = await import('@/app/api/admin/giveaways-no-entries/route')

    for (const email of ['samiraeddaoudi88@gmail.com', 'richtheocrypto@gmail.com']) {
      const rpc = jest.fn().mockResolvedValue({ error: null })
      const updateEq = jest.fn().mockResolvedValue({ error: null })
      const update = jest.fn(() => ({ eq: updateEq }))
      const from = jest.fn(() => ({ update }))

      const supabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'u1', email } },
          }),
        },
        rpc,
        from,
      }

      mockCreateServerClient.mockImplementation(() => supabase)

      const request = new Request('http://localhost/api/admin/giveaways-no-entries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ giveawayId: 'g1', action: 'promote' }),
      })

      const response = await POST(request as never)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(rpc).toHaveBeenCalledWith('increment_promotion_count', { giveaway_id: 'g1' })
      expect(from).toHaveBeenCalledWith('giveaways')
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ promoted_at: expect.any(String) }))
      expect(updateEq).toHaveBeenCalledWith('id', 'g1')
    }
  })

  it('giveaways-no-entries POST promote returns 403 for non-allowlisted email', async () => {
    const { POST } = await import('@/app/api/admin/giveaways-no-entries/route')

    const rpc = jest.fn().mockResolvedValue({ error: null })
    const from = jest.fn()

    const supabase = {
      auth: {
        getUser: async () => ({
          data: { user: { id: 'u1', email: 'not-admin@example.com' } },
        }),
      },
      rpc,
      from,
    }

    mockCreateServerClient.mockImplementation(() => supabase)

    const request = new Request('http://localhost/api/admin/giveaways-no-entries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ giveawayId: 'g1', action: 'promote' }),
    })

    const response = await POST(request as never)

    expect(response.status).toBe(403)
    expect(rpc).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
  })
})
