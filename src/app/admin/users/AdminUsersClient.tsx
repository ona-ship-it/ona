'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';

interface OnaguiProfile {
  id: string;
  email: string;
  onagui_type: string | null;
  created_at: string;
}

interface UserRoleRecord {
  user_id: string;
  role_id: string;
  roles?: { name?: string } | null;
}

interface AdminUser extends OnaguiProfile {
  roles: string[];
}

export default function AdminUsersPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentUserEmail(user.email);
      }
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get all users with their profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('onagui_profiles')
          .select('*');
        
        if (profilesError) throw profilesError;

        // Get user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role_id, roles(name)');
        
        if (rolesError) throw rolesError;

        // Map roles to users
        const usersWithRoles: AdminUser[] = (profiles ?? []).map((profile: OnaguiProfile) => {
          const roles = (userRoles ?? [])
            .filter((role: UserRoleRecord) => role.user_id === profile.id)
            .map((role: UserRoleRecord) => role.roles?.name)
            .filter((name): name is string => !!name);
          
          return {
            ...profile,
            roles: roles || []
          };
        });

        setUsers(usersWithRoles);
      } catch (error: unknown) {
        console.error('Error fetching users:', error);
        const message = error instanceof Error ? error.message : String(error);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, [supabase]);

  // Function to check if current user is richtheocrypto@gmail.com
  const isAuthorizedAdmin = () => {
    return currentUserEmail === 'richtheocrypto@gmail.com';
  };

  // Redirect if not the authorized admin
  useEffect(() => {
    if (currentUserEmail && !isAuthorizedAdmin()) {
      router.push('/');
    }
  }, [currentUserEmail, router]);

  if (!isAuthorizedAdmin()) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
        <p>Only the designated administrator can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p className="mb-4 text-sm bg-yellow-100 p-2 rounded">
        Note: Only richtheocrypto@gmail.com has admin privileges. This cannot be changed.
      </p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">User Type</th>
              <th className="px-4 py-2 border">Roles</th>
              <th className="px-4 py-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: AdminUser) => (
              <tr key={user.id} className={user.email === 'richtheocrypto@gmail.com' ? 'bg-blue-50' : ''}>
                <td className="px-4 py-2 border">{user.id}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{user.onagui_type}</td>
                <td className="px-4 py-2 border">
                  {user.roles && user.roles.length > 0 
                    ? user.roles.join(', ') 
                    : 'No roles'}
                  {user.email === 'richtheocrypto@gmail.com' && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(user.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-2">Role System Information</h2>
        <p>
          This system uses two separate role systems:
        </p>
        
        <div className="mt-4">
          <h3 className="font-bold">Application Roles</h3>
          <p className="text-sm text-gray-600 mb-2">Used for application-level logic and permissions</p>
          <ul className="list-disc ml-6 mt-2">
            <li><strong>user</strong> - Basic user with limited permissions</li>
            <li><strong>subscriber</strong> - Paid subscriber with additional features</li>
            <li><strong>influencer</strong> - Content creator with special privileges</li>
            <li><strong>admin</strong> - Application administrator with full app access</li>
          </ul>
          <p className="mt-2 text-sm">Only the user with email <strong>richtheocrypto@gmail.com</strong> has the admin app role</p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold">Database Role</h3>
          <p className="text-sm text-gray-600 mb-2">Used only for schema management, not daily app logic</p>
          <ul className="list-disc ml-6 mt-2">
            <li>PostgreSQL <strong>admin</strong> role has ALL privileges on the onagui schema</li>
            <li>This role is used for database administration and schema changes</li>
            <li>Not used for regular application logic or user permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}