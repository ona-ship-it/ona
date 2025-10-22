export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@/utils/supabase/server';
import { createAdminSupabaseClient } from '@/utils/supabase/server-admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect unauthenticated users to the sign-in page
    return redirect('/signin');
  }

  // Check for Admin Role using user metadata
  let isAdmin = false;
  try {
    const adminSupabase = await createAdminSupabaseClient();
    const { data: fullUser } = await adminSupabase.auth.admin.getUserById(user.id);
    
    isAdmin = fullUser?.user?.user_metadata?.is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    isAdmin = false;
  }

  // Fetch Profile Info (if needed)
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, user_id')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-3xl font-bold mb-6 text-white">My Account</h1>
      
      {/* ADMIN LINK: Conditional Rendering */}
      {isAdmin && (
        <div className="mb-8 p-4 bg-purple-600 rounded-lg shadow-lg">
          <p className="text-white font-semibold mb-3">Admin Access</p>
          {/* Link to the Admin Dashboard /admin */}
          <Link 
            href="/admin" 
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-purple-800 rounded-md hover:bg-purple-900 transition duration-150"
          >
            Go to Admin Panel 🛡️
          </Link>
        </div>
      )}

      {/* Existing Account Details */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <p className="text-gray-400">Email</p>
          <p className="text-white font-medium">{profile?.email || user.email}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-400">User ID</p>
          <p className="text-white text-sm break-all">{user.id}</p>
        </div>
        
        {/* Create Giveaway Link for all users */}
        <Link 
          href="/admin/giveaway/new" 
          className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition duration-150 mt-4"
        >
          Create Giveaway
        </Link>
        
        {/* Sign Out Button */}
        <form action="/auth/signout" method="post" className="mt-6">
          <button 
            type="submit" 
            className="w-full px-4 py-2 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}