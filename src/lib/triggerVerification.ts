/**
 * Call this function right after a successful supabase.auth.signUp()
 * It sends the verification email via Resend.
 *
 * Usage in your signup page:
 *
 *   const { data, error } = await supabase.auth.signUp({ email, password })
 *   if (data.user && !error) {
 *     await triggerVerificationEmail(data.user.email, data.user.id)
 *     // redirect to /verify-email?status=pending
 *   }
 */
export async function triggerVerificationEmail(email: string, userId: string) {
  try {
    const response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Verification email error:', data.error);
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Trigger verification failed:', err);
    return { success: false, error: err.message };
  }
}
