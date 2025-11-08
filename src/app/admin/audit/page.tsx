import { requireAdminAccess } from '@/lib/supabaseServer';
import { createAdminSupabaseClient } from '@/utils/supabase/server-admin';
import Link from 'next/link';
import React from 'react';
import { CSVExportButton } from './CSVExportButton';

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  return sp.toString();
}

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { supabase } = await requireAdminAccess();

  const sp = await searchParams;
  const userId = sp.user_id;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const action = sp.action;
  const from = sp.from; // ISO date string
  const to = sp.to; // ISO date string
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = (supabase as any)
    .from('admin_access_audit')
    .select('id, user_id, page, action, note, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (userId) query = query.eq('user_id', userId);
  if (action) query = query.eq('action', action);
  if (sp.page) query = query.eq('page', sp.page);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data: entries, error } = await query;
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Admin Audit Viewer</h1>
        <p className="text-red-600">Failed to load audit entries: {String(error.message || error)}</p>
      </div>
    );
  }

  // Resolve emails for the user IDs on this page using the service role (server-side only)
  const emailById: Record<string, string> = {};
  try {
    const admin = await createAdminSupabaseClient();
    const ids = Array.from(
      new Set(
        ((entries || []) as Array<{ user_id?: string }>)
          .map((e) => e.user_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      )
    );
    for (const id of ids) {
      const { data, error } = await admin.auth.admin.getUserById(id);
      if (!error && data?.user?.email) {
        emailById[id] = data.user.email;
      }
    }
  } catch (err) {
    // If service role is not configured locally, gracefully fall back to blanks
    console.warn('Admin Audit: could not resolve emails via service role', err);
  }

  const nextQuery = buildQuery({ ...sp, page: String(page + 1) });
  const prevQuery = buildQuery({ ...sp, page: String(Math.max(1, page - 1)) });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin Audit Viewer</h1>

      <form className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <input name="user_id" placeholder="User ID" defaultValue={userId} className="border p-2 rounded" />
        <input name="page" placeholder="Page path" defaultValue={sp.page} className="border p-2 rounded" />
        <input name="action" placeholder="Action" defaultValue={action} className="border p-2 rounded" />
        <input name="from" placeholder="From (ISO)" defaultValue={from} className="border p-2 rounded" />
        <input name="to" placeholder="To (ISO)" defaultValue={to} className="border p-2 rounded" />
        <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded col-span-1">Apply Filters</button>
      </form>

      <CSVExportButton
        entries={(entries || []).map((e: any) => ({
          ...e,
          email: typeof e?.user_id === 'string' ? (emailById[e.user_id] ?? null) : null,
        }))}
      />

      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Time</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Page</th>
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Note</th>
          </tr>
        </thead>
        <tbody>
          {(entries || []).map((e: any) => (
            <tr key={e.id}>
              <td className="p-2 border">{new Date(e.created_at).toLocaleString()}</td>
              <td className="p-2 border">{e.user_id || '-'}</td>
              <td className="p-2 border">
                {typeof e.user_id === 'string' && emailById[e.user_id] ? (
                  <a href={`mailto:${emailById[e.user_id]}`} className="underline text-blue-400 hover:text-blue-300">
                    {emailById[e.user_id]}
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td className="p-2 border">{e.page || '-'}</td>
              <td className="p-2 border">{e.action || '-'}</td>
              <td className="p-2 border">{e.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-4">
        <Link href={`?${prevQuery}`} className="px-3 py-1 border rounded">Previous</Link>
        <span>Page {page}</span>
        <Link href={`?${nextQuery}`} className="px-3 py-1 border rounded">Next</Link>
      </div>
    </div>
  );
}

// CSV export button moved to dedicated Client Component file