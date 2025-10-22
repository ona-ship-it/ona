'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAdminUsers, AdminUserWithRole } from '../actions';

interface AdminUser {
  id: string;
  email: string;
  onagui_type: string | null;
  created_at: string;
  roles: string[];
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AdminUserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enable preview mode when query param `preview=1` or `true` is present
  const previewEnabled = (() => {
    const flag = searchParams?.get('preview');
    return flag === '1' || flag === 'true';
  })();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (previewEnabled) {
          // Populate mock data for preview instead of using Server Action
          const mockUsers: AdminUserWithRole[] = [
            {
              id: 'preview-user-1',
              email: 'user@example.com',
              full_name: 'Preview User',
              avatar_url: null,
              current_rank: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              role_name: 'user',
            },
            {
              id: 'preview-admin',
              email: 'richtheocrypto@gmail.com',
              full_name: 'Admin User',
              avatar_url: null,
              current_rank: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              role_name: 'admin',
            },
          ];
          setUsers(mockUsers);
          setError('Preview mode: showing mock data (authorization not required).');
          return;
        }

        // *** NEW: Call the secure Server Action ***
        const { data: usersWithRoles, error } = await fetchAdminUsers();

        if (error) {
          throw new Error(error);
        }

        if (usersWithRoles) {
          setUsers(usersWithRoles);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Admin Fetch Error:', message);
        setError(`Failed to load user data: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router, previewEnabled, searchParams]);

  if (loading) {
    return (
      <div className="p-8 text-black">
        <h1 className="text-2xl font-bold mb-4 text-black">User Management</h1>
        <p className="text-black">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-black">
        <h1 className="text-2xl font-bold mb-4 text-black">User Management</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-black">
      <h1 className="text-2xl font-bold mb-4 text-black">User Management</h1>
      {previewEnabled && (
        <p className="mb-4 text-sm bg-purple-100 p-2 rounded text-black">
          Preview mode enabled. Authorization checks are bypassed; data may be mocked.
        </p>
      )}
      <p className="mb-4 text-sm bg-yellow-100 p-2 rounded text-black">
        Note: Only richtheocrypto@gmail.com has admin privileges. This cannot be changed.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-black">
          <thead>
            <tr>
              <th className="px-4 py-2 border text-black">User ID</th>
              <th className="px-4 py-2 border text-black">Email</th>
              <th className="px-4 py-2 border text-black">User Type</th>
              <th className="px-4 py-2 border text-black">Roles</th>
              <th className="px-4 py-2 border text-black">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: AdminUserWithRole) => (
              <tr key={user.id} className={user.email === 'richtheocrypto@gmail.com' ? 'bg-blue-50' : ''}>
                <td className="px-4 py-2 border text-black">{user.id}</td>
                <td className="px-4 py-2 border text-black">{user.email}</td>
                <td className="px-4 py-2 border text-black">{user.current_rank || 'user'}</td>
                <td className="px-4 py-2 border text-black">
                  {user.role_name || 'user'}
                  {user.email === 'richtheocrypto@gmail.com' && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Admin</span>
                  )}
                </td>
                <td className="px-4 py-2 border text-black">{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded text-black">
        <h2 className="text-xl font-bold mb-2 text-black">Role System Information</h2>
        <p className="text-black">This system uses two separate role systems:</p>
        <div className="mt-4">
          <h3 className="font-bold text-black">Application Roles</h3>
          <p className="text-sm text-black mb-2">Used for application-level logic and permissions</p>
          <ul className="list-disc ml-6 mt-2 text-black">
            <li className="text-black"><strong>user</strong> - Basic user with limited permissions</li>
            <li className="text-black"><strong>subscriber</strong> - Paid subscriber with additional features</li>
            <li className="text-black"><strong>influencer</strong> - Content creator with special privileges</li>
            <li className="text-black"><strong>admin</strong> - Application administrator with full app access</li>
          </ul>
          <p className="mt-2 text-sm text-black">Only the user with email <strong>richtheocrypto@gmail.com</strong> has the admin app role</p>
        </div>
        <div className="mt-4">
          <h3 className="font-bold text-black">Database Role</h3>
          <p className="text-sm text-black mb-2">Used only for schema management, not daily app logic</p>
          <ul className="list-disc ml-6 mt-2 text-black">
            <li className="text-black">PostgreSQL <strong>admin</strong> role has ALL privileges on the onagui schema</li>
            <li className="text-black">This role is used for database administration and schema changes</li>
            <li className="text-black">Not used for regular application logic or user permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}