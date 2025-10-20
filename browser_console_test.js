// Browser Console Test for Admin Authentication
// Copy and paste this into your browser console while on onagui.com

// Test 1: Check current session
console.log('=== Testing Admin Authentication ===');

// First, let's check if we can access the Supabase client
if (typeof window !== 'undefined' && window.supabase) {
  console.log('Supabase client found');
} else {
  console.log('Supabase client not found in window object');
}

// Test 2: Check current user session
async function testSession() {
  try {
    // Try to get the session using the auth helpers
    const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createClientComponentClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      return;
    }
    
    if (session) {
      console.log('Current session:', {
        user_id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      });
      
      // Test 3: Check app_users table
      const { data: appUser, error: appUserError } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (appUserError) {
        console.error('App user lookup error:', appUserError);
      } else {
        console.log('App user data:', appUser);
      }
      
      // Test 4: Check user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('onagui.user_roles')
        .select(`
          *,
          roles!inner(name)
        `)
        .eq('user_id', session.user.id);
      
      if (rolesError) {
        console.error('User roles lookup error:', rolesError);
      } else {
        console.log('User roles:', userRoles);
      }
      
      // Test 5: Test the RPC function
      const { data: isAdminResult, error: rpcError } = await supabase
        .rpc('is_admin_user');
      
      if (rpcError) {
        console.error('RPC function error:', rpcError);
      } else {
        console.log('is_admin_user RPC result:', isAdminResult);
      }
      
    } else {
      console.log('No active session found');
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Test 6: Test the isAdmin function directly
async function testIsAdminFunction() {
  try {
    // Try to import and test the isAdmin function
    const { isAdmin } = await import('/src/utils/roleUtils.js');
    const result = await isAdmin();
    console.log('isAdmin() function result:', result);
  } catch (error) {
    console.error('isAdmin function test error:', error);
  }
}

// Run the tests
console.log('Running session test...');
testSession();

console.log('Running isAdmin function test...');
testIsAdminFunction();

console.log('=== Test completed ===');
console.log('Check the results above to see what might be failing.');