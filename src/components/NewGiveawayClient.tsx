'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from './Navigation';
import PageTitle from './PageTitle';
import WalletBalance from './WalletBalance';
import { supabase } from '@/lib/supabaseClient';
import { CreateGiveawayPayload } from '../types/giveaways';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function NewGiveawayClient() {
  const [formData, setFormData] = useState<CreateGiveawayPayload & {
    title: string;
    ticket_price: number;
    ends_at: string;
    media_url: string;
  }>({
    title: '',
    description: '',
    prize_amount: 0,
    ticket_price: 0,
    ends_at: '',
    photo_url: '',
    media_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fiatBalance, setFiatBalance] = useState<number | null>(null);
  const [ticketBalance, setTicketBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch user admin status on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login?redirect=/giveaways/new');
          return;
        }
        
        setUser(user);
        
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        setIsAdmin(!!adminData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      }
    }
    
    fetchUserData();
  }, [router, supabase]);

  // Handle wallet balance updates from WalletBalance component
  const handleWalletBalanceUpdate = (fiat: number, tickets: number) => {
    setFiatBalance(fiat);
    setTicketBalance(tickets);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['prize_amount', 'ticket_price'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  // Determine initial status based on admin status
  const getInitialStatus = () => {
    return isAdmin ? 'active' : 'draft';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      if (formData.prize_amount <= 0) {
        throw new Error('Prize amount must be greater than 0');
      }
      
      if (formData.ticket_price < 0) {
        throw new Error('Ticket price must be 0 or greater');
      }
      
      if (!formData.ends_at) {
        throw new Error('End date is required');
      }
      
      const endDate = new Date(formData.ends_at);
      if (endDate <= new Date()) {
        throw new Error('End date must be in the future');
      }
      
      // For non-admin users, check fiat wallet balance
      if (!isAdmin && fiatBalance !== null && formData.prize_amount > fiatBalance) {
        throw new Error(`Insufficient wallet balance. You need ${formData.prize_amount} USDT but have ${fiatBalance.toFixed(2)} USDT`);
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/giveaways/new');
        return;
      }
      
      // Prepare media URL (either from upload or direct URL input)
      const mediaUrl = formData.photo_url || formData.media_url || null;
      
      const initialStatus = getInitialStatus();
      
      // Insert new giveaway
      const { data, error } = await supabase
        .from('giveaways')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          prize_amount: formData.prize_amount,
          prize_pool_usdt: formData.prize_amount, // Initial prize pool equals the prize amount
          ticket_price: formData.ticket_price,
          photo_url: formData.photo_url || null,
          media_url: mediaUrl,
          ends_at: formData.ends_at,
          status: initialStatus,
          escrow_amount: isAdmin ? 0 : formData.prize_amount // Admin bypass escrow
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to giveaways page after short delay
      setTimeout(() => {
        router.push('/giveaways');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating giveaway:', err);
      setError(err.message || 'Failed to create giveaway');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      if (formData.prize_amount <= 0) {
        throw new Error('Prize amount must be greater than 0');
      }
      
      if (formData.ticket_price < 0) {
        throw new Error('Ticket price must be 0 or greater');
      }
      
      if (!formData.ends_at) {
        throw new Error('End date is required');
      }
      
      const endDate = new Date(formData.ends_at);
      if (endDate <= new Date()) {
        throw new Error('End date must be in the future');
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/giveaways/new');
        return;
      }
      
      // Prepare media URL (either from upload or direct URL input)
      const mediaUrl = formData.photo_url || formData.media_url || null;
      
      // Insert new giveaway with active status (admin bypass)
      const { data, error } = await supabase
        .from('giveaways')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          prize_amount: formData.prize_amount,
          prize_pool_usdt: formData.prize_amount,
          ticket_price: formData.ticket_price,
          photo_url: formData.photo_url || null,
          media_url: mediaUrl,
          ends_at: formData.ends_at,
          status: 'active', // Force active status for admin
          escrow_amount: 0 // Admin bypass escrow
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to giveaways page after short delay
      setTimeout(() => {
        router.push('/giveaways');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating and activating giveaway:', err);
      setError(err.message || 'Failed to create and activate giveaway');
    } finally {
      setLoading(false);
    }
  };

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    try {
      setLoading(true);
      // Create a temporary preview
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        photo_url: previewUrl,
      }));
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `giveaway-photos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('giveaways')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('giveaways')
        .getPublicUrl(filePath);
        
      setFormData(prev => ({
        ...prev,
        photo_url: data.publicUrl,
        media_url: data.publicUrl,
      }));
      
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
      
      // Reset photo_url if upload failed
      setFormData(prev => ({
        ...prev,
        photo_url: '',
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#1a0033] text-white">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle title="Create New Giveaway" className="text-3xl md:text-4xl mb-8" />
        
        {success ? (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-white p-6 rounded-lg text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-semibold mb-2">Giveaway Created!</h3>
            <p className="text-green-300 mb-4">Your giveaway has been created successfully.</p>
            <p className="text-sm text-purple-300">Redirecting to giveaways page...</p>
          </div>
        ) : (
          <div className="bg-purple-900 bg-opacity-30 rounded-xl overflow-hidden shadow-lg border border-purple-500/30 p-6">
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-purple-300 mb-2">
                  Giveaway Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                  placeholder="Enter a catchy title"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-purple-300 mb-2">
                  Giveaway Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                  placeholder="Describe your giveaway..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="prize_amount" className="block text-purple-300 mb-2">
                    Prize Amount (USDT)*
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="prize_amount"
                      name="prize_amount"
                      value={formData.prize_amount || ''}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      required
                      className="w-full bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                      placeholder="100"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-purple-300">USDT</span>
                    </div>
                  </div>
                  {user && (
                    <WalletBalance 
                      userId={user.id} 
                      onBalanceUpdate={handleWalletBalanceUpdate}
                      className="mt-2"
                      showTickets={false}
                    />
                  )}
                  {fiatBalance !== null && !isAdmin && formData.prize_amount > 0 && (
                    <div className={`mt-2 p-3 rounded-lg border ${
                      fiatBalance >= formData.prize_amount 
                        ? 'bg-green-500 bg-opacity-20 border-green-500' 
                        : 'bg-red-500 bg-opacity-20 border-red-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {fiatBalance >= formData.prize_amount ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          fiatBalance >= formData.prize_amount ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {fiatBalance >= formData.prize_amount ? 'Sufficient Funds' : 'Insufficient Funds'}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        fiatBalance >= formData.prize_amount ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {fiatBalance >= formData.prize_amount 
                          ? `✓ ${formData.prize_amount} USDT will be locked in escrow when activated.`
                          : `✗ You need ${(formData.prize_amount - fiatBalance).toFixed(2)} more USDT to create this giveaway.`
                        }
                      </p>
                    </div>
                  )}
                  {isAdmin && (
                    <p className="text-sm text-green-300 mt-1">
                      Admin: No escrow required
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="ticket_price" className="block text-purple-300 mb-2">
                    Ticket Price (USDT)*
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="ticket_price"
                      name="ticket_price"
                      value={formData.ticket_price || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                      placeholder="5"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-purple-300">USDT</span>
                    </div>
                  </div>
                  <p className="text-sm text-purple-300 mt-1">
                    Set to 0 for free tickets
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="ends_at" className="block text-purple-300 mb-2">
                  End Date*
                </label>
                <input
                  type="datetime-local"
                  id="ends_at"
                  name="ends_at"
                  value={formData.ends_at}
                  onChange={handleChange}
                  required
                  className="w-full bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                />
              </div>
              
              <div>
                <label htmlFor="media_url" className="block text-purple-300 mb-2">
                  Media URL
                </label>
                <input
                  type="url"
                  id="media_url"
                  name="media_url"
                  value={formData.media_url}
                  onChange={handleChange}
                  className="w-full bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-purple-300 mt-1">
                  Enter a URL for an image to display with your giveaway
                </p>
              </div>
              
              <div>
                <label htmlFor="photo" className="block text-purple-300 mb-2">
                  Upload Photo (Optional)
                </label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full bg-purple-900 bg-opacity-50 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                />
                {formData.photo_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.photo_url} 
                      alt="Giveaway preview" 
                      className="h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Important Information</h4>
                <ul className="text-sm text-purple-300 space-y-2">
                  {isAdmin ? (
                    <>
                      <li>• As an admin, your giveaways bypass escrow requirements.</li>
                      <li>• Admin giveaways can be activated immediately without wallet balance checks.</li>
                      <li>• Each verified user automatically gets 1 free ticket.</li>
                      <li>• Users can purchase additional tickets for the price you set.</li>
                      <li>• The winner will be randomly selected from all tickets.</li>
                    </>
                  ) : (
                    <>
                      <li>• When your giveaway is activated, the prize amount will be locked in escrow.</li>
                      <li>• Each verified user automatically gets 1 free ticket.</li>
                      <li>• Users can purchase additional tickets for the price you set.</li>
                      <li>• The winner will be randomly selected from all tickets.</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2" size={20} />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    isAdmin ? 'Create Draft' : 'Create Giveaway'
                  )}
                </button>
                
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleCreateAndActivate}
                    disabled={loading}
                    className={`flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2" size={20} />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create & Activate'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}