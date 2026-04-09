import { sendVerificationEmail } from '@/lib/resend'

const mockSend = jest.fn()

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}))

describe('lib/resend sendVerificationEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sends verification email through Resend', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'email_123' }, error: null })

    const result = await sendVerificationEmail('new-user@example.com', 'https://www.onagui.com/api/auth/verify-email?token=abc123')

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new-user@example.com',
        subject: 'Verify your Onagui account',
      })
    )
    expect(result).toEqual({ success: true, id: 'email_123' })
  })

  it('returns an error when Resend send fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'bad api key' } })

    const result = await sendVerificationEmail('new-user@example.com', 'https://www.onagui.com/api/auth/verify-email?token=abc123')

    expect(result).toEqual({ success: false, error: 'bad api key' })
  })
})
