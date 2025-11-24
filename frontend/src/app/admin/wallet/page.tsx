// /frontend/src/app/admin/wallet/page.tsx 
 
import React from 'react'; 
import { AdminWalletManager } from '@/components/AdminWalletManager'; 
import { useAuth } from '@/lib/auth'; // Ensure this provides user and isAdmin 
import { redirect } from 'next/navigation'; 
 
/** 
 * @page AdminWalletPage 
 * @description Dedicated, protected page for the Admin Wallet Management tool. 
 * Adheres to the principle of guarding critical features at the route level. 
 */ 
export default function AdminWalletPage() { 
  // Use the authentication state to determine access 
  const { user, isAdmin, loading } = useAuth(); 
 
  // --- Security & Loading Guards --- 
 
  if (loading) { 
    return ( 
      <div className="flex items-center justify-center min-h-screen"> 
        <p className="text-xl text-gray-400">Loading user permissions...</p> 
      </div> 
    ); 
  } 
 
  // If not logged in OR logged in but NOT an admin, redirect the user 
  if (!user || !isAdmin) { 
    // Architectural Guard: Redirect non-admin users to the homepage or login page 
    // The component guard in AdminWalletManager.tsx acts as a secondary defense. 
    console.warn(`Access attempt blocked: User ${user?.id || 'unauthenticated'} tried to access /admin/wallet.`); 
    // Using Next.js navigation redirect to enforce the route guard 
    redirect('/'); 
    return null; // Return null after redirecting 
  } 
 
  // --- Render Admin Tool --- 
 
  return ( 
    <div className="container mx-auto p-6 min-h-screen bg-gray-900"> 
      <h1 className="text-3xl font-extrabold text-white mb-8 border-b border-gray-700 pb-2"> 
        Admin Dashboard: Wallet Operations 
      </h1> 
      
      {/* RENDER THE ARCHITECTURALLY CRITICAL COMPONENT */} 
      <AdminWalletManager /> 
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm text-gray-400 border border-yellow-700/50"> 
        **Architectural Note:** This RPC call is secure because the database function 
        `add_funds_to_wallet_fiat` is defined as `SECURITY DEFINER` and the 
        Supabase client uses the Admin's JWT (or the service key in a secure 
        backend environment, though here we rely on the Admin's RLS permissions 
        to execute the RPC via their authenticated session). 
      </div> 
    </div> 
  ); 
}