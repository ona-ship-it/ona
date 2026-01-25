// Admin Configuration - Multiple Admins
export const ADMIN_EMAILS = [
  'theoonagui@icloud.com',
  'samiraeddaoudi88@gmail.com',
]

/**
 * Check if a user is a platform admin
 */
export function isAdmin(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false
  const normalizedEmail = userEmail.toLowerCase().trim()
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail)
}

/**
 * Check if current user is admin (use with useAuth hook)
 */
export function checkAdminAccess(user: any): boolean {
  if (!user || !user.email) return false
  return isAdmin(user.email)
}

/**
 * Get list of all admin emails
 */
export function getAdminEmails(): string[] {
  return ADMIN_EMAILS
}
