"use client";

// /ona-production/src/app/admin/tickets/page.tsx

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTicketManager } from '@/components/AdminTicketManager';
import { useAuth } from '@/lib/auth';

/**
 * @page AdminTicketPage
 * @description Dedicated, protected page for the Admin Ticket Management tool.
 */
export default function AdminTicketPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  // Client-side guard: redirect non-admins or unauthenticated users safely
  useEffect(() => {
    if (!user || !isAdmin) {
      console.warn(`Access attempt blocked: User ${user?.id || 'unauthenticated'} tried to access /admin/tickets.`);
      router.replace('/signin?redirectTo=/admin/tickets');
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) {
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