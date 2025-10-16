'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { isAdmin } from '@/utils/roleUtils';

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize_amount: number;
  status: string;
  is_active: boolean;
  created_at: string;
  creator_id: string;
  media_url?: string;
  ends_at: string;
  ticket_price: number;
  prize_pool_usdt: number;
}

export default function AdminGiveawaysPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndLoadGiveaways = async () => {
      try {
        // Check if user is admin
        const adminStatus = await isAdmin();
        setUserIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Load all giveaways
        const { data, error: giveawaysError } = await supabase
          .from('giveaways')
          .select('*')
          .order('created_at', { ascending: false });

        if (giveawaysError) {
          throw giveawaysError;
        }

        setGiveaways(data || []);
      } catch (err: any) {
        console.error('Error loading giveaways:', err);
        setError(err.message || 'Failed to load giveaways');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadGiveaways();
  }, [supabase]);

  const handleActivateGiveaway = async (giveawayId: string) => {
    try {
      const { error } = await supabase
        .from('giveaways')
        .update({ 
          status: 'active', 
          is_active: true,
          escrow_amount: 0 // Admin bypass
        })
        .eq('id', giveawayId);

      if (error) throw error;

      // Refresh the list
      setGiveaways(prev => prev.map(g => 
        g.id === giveawayId 
          ? { ...g, status: 'active', is_active: true }
          : g
      ));

      alert('Giveaway activated successfully!');
    } catch (err: any) {
      console.error('Error activating giveaway:', err);
      alert(err.message || 'Failed to activate giveaway');
    }
  };

  const handleDeactivateGiveaway = async (giveawayId: string) => {
    try {
      const { error } = await supabase
        .from('giveaways')
        .update({ 
          status: 'inactive', 
          is_active: false 
        })
        .eq('id', giveawayId);

      if (error) throw error;

      // Refresh the list
      setGiveaways(prev => prev.map(g => 
        g.id === giveawayId 
          ? { ...g, status: 'inactive', is_active: false }
          : g
      ));

      alert('Giveaway deactivated successfully!');
    } catch (err: any) {
      console.error('Error deactivating giveaway:', err);
      alert(err.message || 'Failed to deactivate giveaway');
    }
  };

  const handleDeleteGiveaway = async (giveawayId: string) => {
    if (!confirm('Are you sure you want to delete this giveaway? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('giveaways')
        .delete()
        .eq('id', giveawayId);

      if (error) throw error;

      // Remove from the list
      setGiveaways(prev => prev.filter(g => g.id !== giveawayId));

      alert('Giveaway deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting giveaway:', err);
      alert(err.message || 'Failed to delete giveaway');
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive && status === 'active') {
      return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Active</span>;
    } else if (status === 'draft') {
      return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Draft</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">Inactive</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading giveaways...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => router.push('/admin')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin - Giveaways Management</h1>
          <button
            onClick={() => router.push('/giveaways/new')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Create New Giveaway
          </button>
        </div>

        {giveaways.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">No Giveaways Found</h2>
              <p className="text-gray-600 mb-6">Get started by creating your first giveaway!</p>
              <button
                onClick={() => router.push('/giveaways/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Create First Giveaway
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {giveaways.map((giveaway) => (
              <div key={giveaway.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{giveaway.title}</h3>
                      {getStatusBadge(giveaway.status, giveaway.is_active)}
                    </div>
                    <p className="text-gray-600 mb-3">{giveaway.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Prize:</span> ${giveaway.prize_amount} USDT
                      </div>
                      <div>
                        <span className="font-medium">Ticket Price:</span> ${giveaway.ticket_price} USDT
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(giveaway.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Ends:</span> {new Date(giveaway.ends_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {giveaway.media_url && (
                    <div className="ml-4">
                      <img 
                        src={giveaway.media_url} 
                        alt={giveaway.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {giveaway.status === 'draft' || !giveaway.is_active ? (
                    <button
                      onClick={() => handleActivateGiveaway(giveaway.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeactivateGiveaway(giveaway.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Deactivate
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push(`/giveaways/${giveaway.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleDeleteGiveaway(giveaway.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}