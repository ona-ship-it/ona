import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUpClient from '@/app/signup/SignUpClient'
import { triggerVerificationEmail } from '@/lib/triggerVerification'

const mockPush = jest.fn()
const mockSignUp = jest.fn()
const mockUpsert = jest.fn().mockResolvedValue({ error: null })

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithOAuth: jest.fn(),
    },
    from: jest.fn(() => ({
      upsert: mockUpsert,
    })),
  }),
}))

jest.mock('@/lib/triggerVerification', () => ({
  triggerVerificationEmail: jest.fn(),
}))

describe('signup verification email flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'user_1',
          email: 'new-user@example.com',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      },
      error: null,
    })
    ;(triggerVerificationEmail as jest.Mock).mockResolvedValue({ success: true })
  })

  async function submitSignUpForm() {
    render(<SignUpClient />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new-user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'strongpass1' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), {
      target: { value: 'strongpass1' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled()
    })
  }

  it('calls triggerVerificationEmail for a new user', async () => {
    await submitSignUpForm()

    await waitFor(() => {
      expect(triggerVerificationEmail).toHaveBeenCalledWith('new-user@example.com', 'user_1')
      expect(mockPush).toHaveBeenCalledWith('/verify-email?status=pending')
    })
  })

  it('redirects to resend verification page when triggerVerificationEmail fails', async () => {
    ;(triggerVerificationEmail as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to send email',
    })

    await submitSignUpForm()

    await waitFor(() => {
      expect(triggerVerificationEmail).toHaveBeenCalledWith('new-user@example.com', 'user_1')
      expect(mockPush).toHaveBeenCalledWith('/resend-verification?email=new-user%40example.com&source=signup')
    })
  })
})
