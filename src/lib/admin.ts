// Admin Configuration - Email allowlist only
export const ADMIN_EMAILS = [
  'samiraeddaoudi88@gmail.com',
  'richtheocrypto@gmail.com',
]

function normalizeEmail(email: string): string {
  const trimmed = email.toLowerCase().trim()
  const [localPart, domain] = trimmed.split('@')

  if (!localPart || !domain) return trimmed

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const canonicalLocal = localPart.split('+')[0].replace(/\./g, '')
    return `${canonicalLocal}@gmail.com`
  }

  return `${localPart}@${domain}`
}

export function isAdmin(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false
  const normalizedEmail = normalizeEmail(userEmail)
  return ADMIN_EMAILS.some(adminEmail => normalizeEmail(adminEmail) === normalizedEmail)
}
