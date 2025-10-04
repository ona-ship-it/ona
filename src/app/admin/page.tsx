'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { GiveawayWithTickets } from '@/types/giveaway';
import Link from 'next/link';

export default function AdminDashboard() {
  const [giveaways, setGiveaways] = useState<GiveawayWithTickets[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchGiveaways = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          tickets(*)
        `);

      if (error) {
        console.error('Error fetching giveaways:', error);
      } else {
        setGiveaways(data as GiveawayWithTickets[]);
      }
      setLoading(false);
    };

    fetchGiveaways();
  }, [supabase]);

  const toggleGiveawayStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('giveaways')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating giveaway:', error);
    } else {
      setGiveaways(
        giveaways.map((giveaway) =>
          giveaway.id === id
            ? { ...giveaway, is_active: !currentStatus }
            : giveaway
        )
      );
    }
  };

  const deleteGiveaway = async (id: string) => {
    const { error } = await supabase.from('giveaways').delete().eq('id', id);

    if (error) {
      console.error('Error deleting giveaway:', error);
    } else {
      setGiveaways(giveaways.filter((giveaway) => giveaway.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6">
        <Link 
          href="/giveaways/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Giveaway
        </Link>
      </div>

      {loading ? (
        <p>Loading giveaways...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {giveaways.map((giveaway) => (
                <tr key={giveaway.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {giveaway.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {giveaway.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        giveaway.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {giveaway.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {giveaway.tickets?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleGiveawayStatus(giveaway.id, giveaway.is_active)}
                      className={`mr-2 ${
                        giveaway.is_active
                          ? 'text-yellow-600 hover:text-yellow-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {giveaway.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      href={`/giveaways/${giveaway.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => deleteGiveaway(giveaway.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}