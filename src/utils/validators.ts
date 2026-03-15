/**
 * Email validation utility
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length > 0 && email.length <= 254
}

/**
 * Password validation utility
 * @param password - Password to validate
 * @returns object with isValid and errors
 */
export function validatePassword(password: string) {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate username
 * @param username - Username to validate
 * @returns true if valid username
 */
export function validateUsername(username: string): boolean {
  // Username: 3-20 chars, alphanumeric + underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * Validate wallet address format
 * @param address - Wallet address
 * @param network - Blockchain network (solana, ethereum, bitcoin)
 * @returns true if valid address for network
 */
export function validateWalletAddress(address: string, network: 'solana' | 'ethereum' | 'bitcoin'): boolean {
  if (!address || address.length === 0) return false

  switch (network) {
    case 'solana':
      // Solana addresses are 44 chars, base58 encoded
      return address.length === 44 && /^[1-9A-HJ-NP-Z]{44}$/.test(address)

    case 'ethereum':
      // Ethereum addresses are 42 chars (0x + 40 hex chars)
      return /^0x[a-fA-F0-9]{40}$/.test(address)

    case 'bitcoin':
      // Bitcoin addresses can be P2PKH (26-35 chars, starts with 1)
      // P2SH (26-35 chars, starts with 3)
      // Bech32 (42-62 chars, starts with bc1)
      return (
        /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
        /^bc1[ac-hj-np-z02-9]{39,59}$/.test(address)
      )

    default:
      return false
  }
}

/**
 * Validate positive number
 * @param value - Value to validate
 * @param min - Minimum value (optional)
 * @param max - Maximum value (optional)
 * @returns true if valid positive number
 */
export function validatePositiveNumber(value: number, min?: number, max?: number): boolean {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    return false
  }

  if (min !== undefined && value < min) {
    return false
  }

  if (max !== undefined && value > max) {
    return false
  }

  return true
}
