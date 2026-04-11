import { validateEmail } from '@/utils/validators'

describe('utilities/validators', () => {
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@test-domain.com',
      ]

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true)
      })
    })

    it('should return false for invalid email', () => {
      const invalidEmails = [
        'invalid.email',
        'user@',
        '@domain.com',
        'user name@example.com',
        '',
      ]

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false)
      })
    })
  })
})
