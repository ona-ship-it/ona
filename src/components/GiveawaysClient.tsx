'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Link from 'next/link';
import PageTitle from './PageTitle';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { GiveawayWithTickets } from '../types/giveaways';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BuyTicketsModal from './BuyTicketsModal';
import DonateModal from './DonateModal';

// Client component to handle interactivity
export default function GiveawaysClient() {
  const [activeGiveaways, setActiveGiveaways] = useState<GiveawayWithTickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [userTickets, setUserTickets] = useState<{[key: string]: number}>({});
  const [uploadingIds, setUploadingIds] = useState<{[key: string]: boolean}>({});
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    loadGiveaways();
  }, []);

  const loadGiveaways = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          tickets(*)
        `)
        .eq('is_active', true);

      if (error) throw error;
      setActiveGiveaways(data as GiveawayWithTickets[] || []);
      
      // Get user's tickets for each giveaway
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const ticketCounts: {[key: string]: number} = {};
        
        for (const giveaway of (data || [])) {
          const { data: tickets, error: ticketsError } = await supabase
            .from('tickets')
            .select('*')
            .eq('giveaway_id', giveaway.id)
            .eq('user_id', user.id);
            
          if (!ticketsError && tickets) {
            ticketCounts[giveaway.id] = tickets.length;
          }
        }
        
        setUserTickets(ticketCounts);
      }
    } catch (err) {
      console.error('Error fetching giveaways:', err);
      setError('Failed to load giveaways');
    } finally {
      setLoading(false);
    }
  };

  const joinGiveaway = async (giveawayId: string) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/giveaways');
        return;
      }

      // Check if user already has tickets
      const userGiveawayTickets = userTickets[giveawayId] || 0;
      
      if (userGiveawayTickets === 0) {
        // First time joining - get free ticket
        const { data, error } = await supabase.functions.invoke('buy-ticket', {
          body: { 
            user_id: user.id, 
            giveaway_id: giveawayId, 
            quantity: 1,
            is_free: true
          }
        });

        if (error) throw error;
        
        // Refresh the giveaways list
        await loadGiveaways();
      } else {
        // User already has tickets - open modal to buy more
        setSelectedGiveaway(giveawayId);
        setIsTicketModalOpen(true);
      }
    } catch (err) {
      console.error('Error joining giveaway:', err);
      setError('Failed to join giveaway');
    }
  };
  
  const handleDonate = (giveawayId: string) => {
    setSelectedGiveaway(giveawayId);
    setIsDonateModalOpen(true);
  };
  
  const handleTicketModalClose = () => {
    setIsTicketModalOpen(false);
    setSelectedGiveaway(null);
  };
  
  const handleDonateModalClose = () => {
    setIsDonateModalOpen(false);
    setSelectedGiveaway(null);
  };

  const triggerFileInput = (giveawayId: string) => {
    const input = document.getElementById(`upload-input-${giveawayId}`) as HTMLInputElement | null;
    if (input) input.click();
  };

  const handleCardPhotoUpload = async (giveawayId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingIds(prev => ({ ...prev, [giveawayId]: true }));
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/giveaways');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${giveawayId}-${Date.now()}.${fileExt}`;
      const filePath = `giveaway-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      // Update public giveaways table
      await supabase
        .from('giveaways')
        .update({ photo_url: publicUrl, media_url: publicUrl })
        .eq('id', giveawayId);

      await loadGiveaways();
    } catch (err: any) {
      console.error('Error uploading giveaway photo:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingIds(prev => ({ ...prev, [giveawayId]: false }));
      const input = document.getElementById(`upload-input-${giveawayId}`) as HTMLInputElement | null;
      if (input) input.value = '';
    }
  };

  const handleDriveImport = (giveawayId: string) => {
    // Placeholder for upcoming Google Drive integration
    setError('Google Drive import is coming soon.');
    console.log('Drive import coming soon for giveaway:', giveawayId);
  };

  const handleSuccess = async () => {
    await loadGiveaways();
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#1f2937] text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <PageTitle className="text-3xl md:text-4xl" gradient={true}>
            Active Giveaways
          </PageTitle>
          <Link href="/giveaways/new" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30 flex items-center">
            + Create Giveaway
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGiveaways.length > 0 ? (
              activeGiveaways.map((giveaway) => (
                <div key={giveaway.id} className="bg-purple-900 bg-opacity-30 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300 border border-purple-500/30">
                  <div className="relative h-48 w-full">
                    {giveaway.photo_url ? (
                      <Image 
                        src={giveaway.photo_url} 
                        alt={giveaway.description} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-800 to-indigo-800">
                        <span className="text-5xl">🎁</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-2 text-white">{giveaway.description}</h3>
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-purple-300 text-sm">Cash Prize</p>
                        <p className="text-white font-bold">{giveaway.prize_amount} USDT</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm">Ticket Price</p>
                        <p className="text-white font-bold">1 USDT</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-purple-300 text-sm">Total Entries</p>
                      <p className="text-white">{giveaway.tickets_count || 0} tickets</p>
                      {userTickets[giveaway.id] > 0 && (
                        <p className="text-purple-300 text-sm mt-1">
                          You have {userTickets[giveaway.id]} ticket{userTickets[giveaway.id] > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => joinGiveaway(giveaway.id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                      >
                        {userTickets[giveaway.id] ? 'Buy More Tickets' : 'Join Giveaway'}
                      </button>
                      <button
                          onClick={() => handleDonate(giveaway.id)}
                          className="bg-purple-800 hover:bg-onaguiGreen-dark text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                        >
                          Donate
                        </button>
                      {/* Upload controls */}
                      <input
                        id={`upload-input-${giveaway.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCardPhotoUpload(giveaway.id, e)}
                      />
                      <button
                        onClick={() => triggerFileInput(giveaway.id)}
                        className="bg-purple-700 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                        disabled={!!uploadingIds[giveaway.id]}
                      >
                        {uploadingIds[giveaway.id] ? 'Uploading...' : 'Upload Photo'}
                      </button>
                      <button
                        onClick={() => handleDriveImport(giveaway.id)}
                        className="bg-indigo-700 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                      >
                        Import from Drive
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-2xl font-semibold mb-2">No Active Giveaways</h3>
                <p className="text-purple-300 mb-6">Be the first to create a giveaway!</p>
                <Link href="/giveaways/new" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30">
                  Create Giveaway
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Most Popular Influencers Section */}
        <MostPopularInfluencers />
        
        {/* Favorites Onagui Powered Giveaway Section */}
        <FavoritesGiveaways />
        
        {/* Last Chance Section */}
        <LastChanceGiveaways />
        
        {/* Recently Added Giveaways Section */}
        <RecentlyAddedGiveaways />
      </div>
      
      {selectedGiveaway && (
        <>
          <BuyTicketsModal
            giveawayId={selectedGiveaway}
            isOpen={isTicketModalOpen}
            onClose={handleTicketModalClose}
            onSuccess={handleSuccess}
          />
          
          <DonateModal
            giveawayId={selectedGiveaway}
            isOpen={isDonateModalOpen}
            onClose={handleDonateModalClose}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </main>
  );
}

// Most Popular Influencers Section with horizontal scrolling
function MostPopularInfluencers() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('popular-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('popular-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const popularGiveaways = [
    {
      id: 1,
      title: "MrBeast $10,000 Cash Giveaway",
      prize: "$10,000",
      entries: "1.2M",
      image: "🎮",
      influencer: "MrBeast",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      id: 2,
      title: "PewDiePie Gaming Setup",
      prize: "$5,000",
      entries: "845K",
      image: "🎧",
      influencer: "PewDiePie",
      gradient: "from-red-600 to-pink-600"
    },
    {
      id: 3,
      title: "Ninja Fortnite V-Bucks",
      prize: "50,000 V-Bucks",
      entries: "732K",
      image: "🎯",
      influencer: "Ninja",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      id: 4,
      title: "Pokimane Streaming Bundle",
      prize: "$3,000",
      entries: "621K",
      image: "📱",
      influencer: "Pokimane",
      gradient: "from-pink-600 to-purple-600"
    },
    {
      id: 5,
      title: "Shroud PC Giveaway",
      prize: "$7,500",
      entries: "589K",
      image: "💻",
      influencer: "Shroud",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 6,
      title: "TimTheTatman Merch Bundle",
      prize: "$1,000",
      entries: "412K",
      image: "👕",
      influencer: "TimTheTatman",
      gradient: "from-yellow-600 to-red-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          VIP Giveaways
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2 items-center">
            <button 
              className="px-3 py-1 mr-2 rounded bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300 text-sm font-medium"
            >
              Most Popular
            </button>
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularGiveaways.map((giveaway, index) => (
            <GiveawayCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      ) : (
        <div 
          id="popular-scroll"
          className="flex overflow-x-auto space-x-8 pb-8 pt-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {popularGiveaways.map((giveaway, index) => (
            <GiveawayCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

// Favorites Onagui Powered Giveaway Section
function FavoritesGiveaways() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('favorites-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('favorites-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const favoritesGiveaways = [
    {
      id: 1,
      title: "RTX 4090 Gaming PC",
      prize: "$3,500",
      entries: "245K",
      image: "🖥️",
      influencer: "Onagui Gaming",
      gradient: "from-yellow-600 to-amber-600"
    },
    {
      id: 2,
      title: "PlayStation 5 Bundle",
      prize: "$800",
      entries: "189K",
      image: "🎮",
      influencer: "Onagui Console",
      gradient: "from-yellow-600 to-amber-600"
    },
    {
      id: 3,
      title: "Xbox Series X Package",
      prize: "$750",
      entries: "156K",
      image: "🎯",
      influencer: "Onagui Xbox",
      gradient: "from-yellow-600 to-amber-600"
    },
    {
      id: 4,
      title: "Gaming Laptop Giveaway",
      prize: "$2,200",
      entries: "134K",
      image: "💻",
      influencer: "Onagui Mobile",
      gradient: "from-yellow-600 to-amber-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          Favorites Onagui Powered Giveaway
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2">
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {favoritesGiveaways.map((giveaway, index) => (
            <FavoriteCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      ) : (
        <div 
          id="favorites-scroll"
          className="flex overflow-x-auto space-x-8 pb-8 pt-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {favoritesGiveaways.map((giveaway, index) => (
            <FavoriteCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

// Last Chance Section
function LastChanceGiveaways() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('lastchance-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('lastchance-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const lastChanceGiveaways = [
    {
      id: 1,
      title: "iPhone 15 Pro Max",
      prize: "$1,200",
      entries: "98K",
      image: "📱",
      timeLeft: "2h 15m",
      gradient: "from-red-600 to-rose-600"
    },
    {
      id: 2,
      title: "Crypto Starter Pack",
      prize: "$500",
      entries: "76K",
      image: "💰",
      timeLeft: "4h 30m",
      gradient: "from-red-600 to-rose-600"
    },
    {
      id: 3,
      title: "Gaming Monitor Bundle",
      prize: "$800",
      entries: "54K",
      image: "🖥️",
      timeLeft: "6h 45m",
      gradient: "from-red-600 to-rose-600"
    },
    {
      id: 4,
      title: "Mechanical Keyboard",
      prize: "$250",
      entries: "42K",
      image: "⌨️",
      timeLeft: "8h 20m",
      gradient: "from-red-600 to-rose-600"
    },
    {
      id: 5,
      title: "Gaming Chair",
      prize: "$350",
      entries: "38K",
      image: "🪑",
      timeLeft: "10h 10m",
      gradient: "from-red-600 to-rose-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          Last Chance
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2">
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lastChanceGiveaways.map((giveaway, index) => (
            <LastChanceCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      ) : (
        <div 
          id="lastchance-scroll"
          className="flex overflow-x-auto space-x-8 pb-8 pt-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {lastChanceGiveaways.map((giveaway, index) => (
            <LastChanceCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

// Recently Added Giveaways Section
function RecentlyAddedGiveaways() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('recent-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('recent-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const recentGiveaways = [
    {
      id: 1,
      title: "Steam Deck OLED",
      prize: "$650",
      entries: "12K",
      image: "🎮",
      addedTime: "2h ago",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      id: 2,
      title: "Razer Gaming Bundle",
      prize: "$450",
      entries: "8K",
      image: "🎧",
      addedTime: "4h ago",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      id: 3,
      title: "Streaming Microphone",
      prize: "$200",
      entries: "5K",
      image: "🎙️",
      addedTime: "6h ago",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      id: 4,
      title: "Gaming Mouse",
      prize: "$150",
      entries: "3K",
      image: "🖱️",
      addedTime: "8h ago",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      id: 5,
      title: "Nintendo Switch",
      prize: "$300",
      entries: "7K",
      image: "🎮",
      addedTime: "10h ago",
      gradient: "from-green-600 to-emerald-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          Recently Added Giveaways
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2">
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentGiveaways.map((giveaway, index) => (
            <RecentCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      ) : (
        <div 
          id="recent-scroll"
          className="flex overflow-x-auto space-x-8 pb-8 pt-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentGiveaways.map((giveaway, index) => (
            <RecentCard key={giveaway.id} giveaway={giveaway} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

// Giveaway Card Component for Most Popular Influencers
interface Giveaway {
  id: number;
  title: string;
  prize: string;
  entries: string;
  image: string;
  influencer: string;
  gradient: string;
}

function GiveawayCard({ giveaway, index }: { giveaway: Giveaway; index: number }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 mb-2 mx-1"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-40 bg-gradient-to-r ${giveaway.gradient} flex items-center justify-center`}>
        <span className="text-6xl">{giveaway.image}</span>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-bcgames-darkgrey text-white text-xs px-2 py-1 rounded-full">
            {giveaway.influencer}
          </span>
          <span className="text-gray-600 dark:text-gray-300 text-sm">{giveaway.entries} entries</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{giveaway.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-3">Prize: <span className="text-bcgames-green font-semibold">{giveaway.prize}</span></p>
        <button className="w-full bg-bcgames-green hover:bg-bcgames-green/90 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
          Enter
        </button>
      </div>
    </div>
  );
}

// Favorite Card Component
interface FavoriteGiveaway {
  id: number;
  title: string;
  prize: string;
  entries: string;
  image: string;
  influencer: string;
  gradient: string;
}

function FavoriteCard({ giveaway, index }: { giveaway: FavoriteGiveaway; index: number }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-32 bg-gradient-to-r ${giveaway.gradient} flex items-center justify-center`}>
        <span className="text-5xl">{giveaway.image}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-bcgames-darkgrey text-white text-xs px-2 py-1 rounded-full">
            {giveaway.influencer}
          </span>
          <span className="text-gray-300 text-sm">{giveaway.entries} entries</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{giveaway.title}</h3>
        <p className="text-gray-300 mb-3">Prize: <span className="text-bcgames-green font-semibold">{giveaway.prize}</span></p>
        <button className="w-full bg-bcgames-green hover:bg-bcgames-green/90 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
          Join
        </button>
      </div>
    </div>
  );
}

// Last Chance Card Component
interface LastChanceGiveaway {
  id: number;
  title: string;
  prize: string;
  entries: string;
  image: string;
  timeLeft: string;
  gradient: string;
}

function LastChanceCard({ giveaway, index }: { giveaway: LastChanceGiveaway; index: number }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-32 bg-gradient-to-r ${giveaway.gradient} flex items-center justify-center`}>
        <span className="text-5xl">{giveaway.image}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-red-900 text-red-100 text-xs px-2 py-1 rounded-full animate-pulse">
            {giveaway.timeLeft} left
          </span>
          <span className="text-gray-300 text-sm">{giveaway.entries} entries</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{giveaway.title}</h3>
        <p className="text-gray-300 mb-3">Prize: <span className="text-red-400 font-semibold">{giveaway.prize}</span></p>
        <button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 animate-pulse">
          Enter Now!
        </button>
      </div>
    </div>
  );
}

// Recent Card Component
interface RecentGiveaway {
  id: number;
  title: string;
  prize: string;
  entries: string;
  image: string;
  addedTime: string;
  gradient: string;
}

function RecentCard({ giveaway, index }: { giveaway: RecentGiveaway; index: number }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-32 bg-gradient-to-r ${giveaway.gradient} flex items-center justify-center`}>
        <span className="text-5xl">{giveaway.image}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-green-900 text-green-100 text-xs px-2 py-1 rounded-full">
            NEW
          </span>
          <span className="text-gray-300 text-sm">{giveaway.addedTime}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{giveaway.title}</h3>
        <p className="text-gray-300 mb-3">Prize: <span className="text-green-400 font-semibold">{giveaway.prize}</span></p>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">{giveaway.entries} entries</span>
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
            Be First!
          </button>
        </div>
      </div>
    </div>
  );
}