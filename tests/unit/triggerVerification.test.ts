import { triggerVerificationEmail } from '@/lib/triggerVerification'

describe('lib/triggerVerification triggerVerificationEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success when API responds ok', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    global.fetch = mockFetch

    const result = await triggerVerificationEmail('new-user@example.com', 'user_1')

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new-user@example.com', userId: 'user_1' }),
    })
    expect(result).toEqual({ success: true })
  })

  it('returns API error when response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Too many requests' }),
    }) as jest.Mock

    const result = await triggerVerificationEmail('new-user@example.com', 'user_1')

    expect(result).toEqual({ success: false, error: 'Too many requests' })
  })

  it('returns fallback error when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network unavailable')) as jest.Mock

    const result = await triggerVerificationEmail('new-user@example.com', 'user_1')

    expect(result).toEqual({ success: false, error: 'Network unavailable' })
  })
})
