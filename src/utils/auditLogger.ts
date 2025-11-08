import { createClient } from '@supabase/supabase-js';
import type { Database, Json } from '../types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

/**
 * Log an audit event
 * @param userId - User ID performing the action
 * @param action - Action being performed
 * @param details - Additional details about the action
 * @returns Promise<void>
 */
export async function logAuditEvent(
  userId: string,
  action: string,
  details: Json
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      details,
      ip_address: getClientIp(),
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw - audit logging should not block main operations
  }
}

/**
 * Get client IP address from request
 * @returns string - IP address or 'unknown'
 */
function getClientIp(): string {
  // In a real implementation, this would extract the IP from the request
  // For now, return a placeholder
  return 'server-side';
}

/**
 * Log a transaction event
 * @param userId - User ID performing the action
 * @param transactionId - ID of the transaction
 * @param action - Action being performed
 * @param details - Additional details about the action
 * @returns Promise<void>
 */
export async function logTransactionEvent(
  userId: string,
  transactionId: string,
  action: string,
  details: Json
): Promise<void> {
  return logAuditEvent(userId, `transaction_${action}`, {
    transaction_id: transactionId,
    ...details
  });
}

/**
 * Log an admin action
 * @param adminId - Admin user ID
 * @param action - Action being performed
 * @param details - Additional details about the action
 * @returns Promise<void>
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  details: Json
): Promise<void> {
  return logAuditEvent(adminId, `admin_${action}`, details);
}

/**
 * Log a security event
 * @param userId - User ID (if available)
 * @param action - Security action or violation
 * @param details - Additional details about the event
 * @returns Promise<void>
 */
export async function logSecurityEvent(
  userId: string | null,
  action: string,
  details: Json
): Promise<void> {
  return logAuditEvent(userId || 'system', `security_${action}`, details);
}