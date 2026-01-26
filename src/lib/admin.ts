// Admin Configuration - Multiple Admins
export const ADMIN_EMAILS = [
  'theoonagui@icloud.com',
  'samiraeddaoudi88@gmail.com',
]

export function isAdmin(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false
  const normalizedEmail = userEmail.toLowerCase().trim()
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail)
}
