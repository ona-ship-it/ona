import { validatePassword, validateUsername, validateWalletAddress } from '@/utils/validators'

describe('validators', () => {
  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('weakpass123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject short password', () => {
      const result = validatePassword('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters')
    })
  })

  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('user123')).toBe(true)
      expect(validateUsername('john_doe')).toBe(true)
      expect(validateUsername('test_user_99')).toBe(true)
    })

    it('should reject invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false) // too short
      expect(validateUsername('user-name')).toBe(false) // contains dash
      expect(validateUsername('user@name')).toBe(false) // contains @
      expect(validateUsername('')).toBe(false) // empty
    })
  })

  describe('validateWalletAddress', () => {
    it('should validate Solana addresses', () => {
      expect(validateWalletAddress('11111111111111111111111111111111', 'solana')).toBe(false) // too short
      expect(validateWalletAddress('EPjFWaJxNvtokMV8xjVHzpHXDCAjLpwxKDDpUSzgYqyG', 'solana')).toBe(true)
    })

    it('should validate Ethereum addresses', () => {
      expect(validateWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f42e8d', 'ethereum')).toBe(true)
      expect(validateWalletAddress('0xINVALID', 'ethereum')).toBe(false)
    })

    it('should reject empty addresses', () => {
      expect(validateWalletAddress('', 'solana')).toBe(false)
      expect(validateWalletAddress('', 'ethereum')).toBe(false)
    })
  })
})
