// /frontend/src/app/admin/tickets/page.tsx 

import React from 'react'; 
import { AdminTicketManager } from '@/components/AdminTicketManager'; 
import { useAuth } from '@/lib/auth'; // Ensure this provides user and isAdmin 
import { redirect } from 'next/navigation'; 

/** 
 * @page AdminTicketPage 
 * @description Dedicated, protected page for the Admin Ticket Management tool. 
 */ 
export default function AdminTicketPage() { 
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
    console.warn(`Access attempt blocked: User ${user?.id || 'unauthenticated'} tried to access /admin/tickets.`); 
    redirect('/'); 
    return null; 
  } 

  // --- Render Admin Tool --- 

  return ( 
    <div className="container mx-auto p-6 min-h-screen bg-gray-900"> 
      <h1 className="text-3xl font-extrabold text-white mb-8 border-b border-gray-700 pb-2"> 
        Admin Dashboard: Ticket Operations 
      </h1> 
      
      {/* RENDER THE TICKET MANAGEMENT COMPONENT */} 
      <AdminTicketManager /> 
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm text-gray-400 border border-yellow-700/50"> 
        **Architectural Note:** This RPC call uses the `add_funds_to_wallet_tickets` function, which handles integer arithmetic for tickets securely on the database side. 
      </div> 
    </div> 
  ); 
}