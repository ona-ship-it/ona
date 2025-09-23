import GiveawaysClient from '../../components/GiveawaysClient';

export default function GiveawaysPage() {
  return <GiveawaysClient />;
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
          Most Popular Influencers
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2">
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
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
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
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
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
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
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
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
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
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
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
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
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
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
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
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
function GiveawayCard({ giveaway, index }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-32 bg-gradient-to-r ${giveaway.gradient} flex items-center justify-center`}>
        <span className="text-5xl">{giveaway.image}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-purple-900 text-purple-100 text-xs px-2 py-1 rounded-full">
            {giveaway.influencer}
          </span>
          <span className="text-gray-300 text-sm">{giveaway.entries} entries</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{giveaway.title}</h3>
        <p className="text-gray-300 mb-3">Prize: <span className="text-purple-400 font-semibold">{giveaway.prize}</span></p>
        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
          Enter
        </button>
      </div>
    </div>
  );
}

// Favorite Card Component
function FavoriteCard({ giveaway, index }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-32 bg-gradient-to-r ${giveaway.gradient} flex items-center justify-center`}>
        <span className="text-5xl">{giveaway.image}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-yellow-900 text-yellow-100 text-xs px-2 py-1 rounded-full">
            {giveaway.influencer}
          </span>
          <span className="text-gray-300 text-sm">{giveaway.entries} entries</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{giveaway.title}</h3>
        <p className="text-gray-300 mb-3">Prize: <span className="text-yellow-400 font-semibold">{giveaway.prize}</span></p>
        <button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
          Join
        </button>
      </div>
    </div>
  );
}

// Last Chance Card Component
function LastChanceCard({ giveaway, index }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
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
function RecentCard({ giveaway, index }) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
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