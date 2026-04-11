/** @jest-environment node */

const mockCreateServerClient = jest.fn()
const mockCreateSupabaseClient = jest.fn()

jest.mock('@/lib/supabaseServer', () => ({
  createClient: (...args: unknown[]) => mockCreateServerClient(...args),
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateSupabaseClient(...args),
}))

jest.mock('@/lib/email', () => ({
  sendWinnerEmail: jest.fn(async () => ({ success: true })),
  sendFundraiserEmail: jest.fn(async () => ({ success: true })),
}))

function makeDrawWinnersSupabase() {
  return {
    from: (table: string) => {
      if (table !== 'raffles') throw new Error(`Unexpected table: ${table}`)
      return {
        select: () => ({
          eq: () => ({
            lt: () => ({
              is: async () => ({ data: [], error: null }),
            }),
          }),
        }),
      }
    },
  }
}

function makeSendEmailsSupabase() {
  return {
    from: (table: string) => {
      if (table !== 'winner_notifications') throw new Error(`Unexpected table: ${table}`)
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        }),
      }
    },
  }
}

function makeFundraiseEmailsSupabase() {
  return {
    from: (table: string) => {
      if (table !== 'email_notifications') throw new Error(`Unexpected table: ${table}`)
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        }),
      }
    },
  }
}

describe('cron routes success path', () => {
  const originalCronSecret = process.env.CRON_SECRET
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'test-cron-secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  afterEach(() => {
    if (originalCronSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = originalCronSecret

    if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl

    if (originalServiceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRole
  })

  it('draw-winners GET returns 200 with bearer auth and no expired raffles', async () => {
    const { GET } = await import('@/app/api/cron/draw-winners/route')

    mockCreateServerClient.mockResolvedValueOnce(makeDrawWinnersSupabase())

    const request = new Request('http://localhost/api/cron/draw-winners', {
      method: 'GET',
      headers: { authorization: 'Bearer test-cron-secret' },
    })

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'No raffles to draw', drawn: 0 })
  })

  it('send-emails GET returns 200 with bearer auth and empty queue', async () => {
    const { GET } = await import('@/app/api/cron/send-emails/route')

    mockCreateSupabaseClient.mockReturnValueOnce(makeSendEmailsSupabase())

    const request = new Request('http://localhost/api/cron/send-emails', {
      method: 'GET',
      headers: { authorization: 'Bearer test-cron-secret' },
    })

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.winnerEmails).toBe(0)
    expect(body.errors).toEqual([])
    expect(body.timestamp).toBeDefined()
  })

  it('fundraise send-emails POST returns 200 with bearer auth and empty queue', async () => {
    const { POST } = await import('@/app/api/fundraise/send-emails/route')

    mockCreateServerClient.mockResolvedValueOnce(makeFundraiseEmailsSupabase())

    const request = new Request('http://localhost/api/fundraise/send-emails', {
      method: 'POST',
      headers: { authorization: 'Bearer test-cron-secret' },
    })

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'No pending emails', sent: 0 })
  })
})
