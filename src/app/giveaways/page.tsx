"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { GiveawayCardSkeleton, SearchFilterSkeleton } from "@/components/ui/Skeleton";

// Sample giveaway data organized by sections
const mostPopularInfluencers = [
  { id: 1, title: "$300 Weekend Special", prize: "$300", entries: 1234, timeLeft: "2d 5h", status: "active", host: "ONAGUI" },
  { id: 2, title: "$750 Premium Raffle", prize: "$750", entries: 856, timeLeft: "1d 12h", status: "active", host: "ONAGUI" },
  { id: 3, title: "$50 Starter Raffle", prize: "$50", entries: 2341, timeLeft: "3d 8h", status: "active", host: "ONAGUI" },
  { id: 4, title: "$100 Quick Win Raffle", prize: "$100", entries: 567, timeLeft: "6h 30m", status: "active", host: "ONAGUI" },
  { id: 5, title: "$500 Cash Prize Raffle", prize: "$500", entries: 1890, timeLeft: "4d 2h", status: "active", host: "ONAGUI" },
  { id: 6, title: "$1000 Mega Raffle", prize: "$1000", entries: 3456, timeLeft: "5d 10h", status: "active", host: "ONAGUI" },
];

const favoriteOnaguiPowered = [
  { id: 7, title: "Gaming Setup Giveaway", prize: "Gaming PC", entries: 890, timeLeft: "2d 15h", status: "active", host: "TechGuru", image: "🎮", color: "from-purple-500 to-blue-600" },
  { id: 8, title: "iPhone 15 Pro Max", prize: "iPhone", entries: 2340, timeLeft: "1d 8h", status: "active", host: "MobileReviews", image: "📱", color: "from-blue-500 to-cyan-500" },
  { id: 9, title: "PlayStation 5 Bundle", prize: "PS5", entries: 1567, timeLeft: "3d 12h", status: "active", host: "GameZone", image: "🎮", color: "from-red-500 to-pink-500" },
  { id: 10, title: "MacBook Air M3", prize: "MacBook", entries: 987, timeLeft: "4d 6h", status: "active", host: "AppleFan", image: "💻", color: "from-gray-500 to-slate-600" },
];

const lastChanceGiveaways = [
  { id: 11, title: "Emergency Cash Drop", prize: "$200", entries: 456, timeLeft: "2h 30m", status: "ending", host: "CashKing", image: "💰", color: "from-red-600 to-pink-600" },
  { id: 12, title: "Last Minute Laptop", prize: "Laptop", entries: 234, timeLeft: "4h 15m", status: "ending", host: "TechDeals", image: "💻", color: "from-purple-600 to-blue-600" },
  { id: 13, title: "Final Call AirPods", prize: "AirPods", entries: 678, timeLeft: "1h 45m", status: "ending", host: "AudioPro", image: "🎧", color: "from-green-600 to-teal-600" },
  { id: 14, title: "Urgent Gift Card", prize: "$150", entries: 123, timeLeft: "3h 20m", status: "ending", host: "ShopMaster", image: "🎁", color: "from-yellow-600 to-orange-600" },
];

const recentlyAddedGiveaways = [
  { id: 15, title: "Brand New Tesla Model 3", prize: "Tesla", entries: 45, timeLeft: "7d 0h", status: "new", host: "ElectricCars", image: "🚗", color: "from-blue-600 to-purple-600" },
  { id: 16, title: "Fresh $1000 Cash", prize: "$1000", entries: 23, timeLeft: "6d 18h", status: "new", host: "MoneyMaker", image: "💰", color: "from-green-600 to-teal-600" },
  { id: 17, title: "New iPad Pro 2024", prize: "iPad", entries: 67, timeLeft: "6d 12h", status: "new", host: "TabletReview", image: "📱", color: "from-pink-600 to-rose-600" },
  { id: 18, title: "Latest Samsung Galaxy", prize: "Galaxy S24", entries: 89, timeLeft: "6d 20h", status: "new", host: "AndroidWorld", image: "📱", color: "from-cyan-600 to-blue-600" },
];

export default function GiveawaysPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate search loading
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Filter options
  const filterOptions = [
    { id: 'active', label: 'Active', emoji: '🟢' },
    { id: 'ending-soon', label: 'Ending Soon', emoji: '⏰' },
    { id: 'high-value', label: 'High Value', emoji: '💎' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' },
    { id: 'tech', label: 'Tech', emoji: '💻' },
    { id: 'fashion', label: 'Fashion', emoji: '👗' },
    { id: 'crypto', label: 'Crypto', emoji: '₿' },
    { id: 'nft', label: 'NFT', emoji: '🖼️' }
  ];

  // Add animation states for micro-interactions
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [pulsingButtons, setPulsingButtons] = useState<Set<string>>(new Set());

  // Enhanced animation functions
  const handleCardClick = (giveawayId: string) => {
    setAnimatingCards(prev => new Set(prev).add(giveawayId));
    setPulsingButtons(prev => new Set(prev).add(giveawayId));
    
    // Remove animation state after animation completes
    setTimeout(() => {
      setAnimatingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(giveawayId);
        return newSet;
      });
      setPulsingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(giveawayId);
        return newSet;
      });
    }, 600);
  };

  const handleCardHover = (giveawayId: string | null) => {
    setHoveredCard(giveawayId);
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchQuery('');
  };

  // Filter giveaways based on search and filters
  const filterGiveaways = (giveaways: Array<{
    id: number;
    title: string;
    host: string;
    prize: string;
    status: string;
    timeLeft: string;
    entries: number;
    image?: string;
    color?: string;
  }>) => {
    let filtered = giveaways;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(giveaway => 
        giveaway.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        giveaway.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        giveaway.prize.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filters (simplified logic for demo)
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(giveaway => {
        return selectedFilters.some(filterId => {
          switch(filterId) {
            case 'active':
              return giveaway.status === 'active';
            case 'ending-soon':
              return giveaway.timeLeft.includes('hour') || giveaway.timeLeft.includes('min');
            case 'high-value':
              return giveaway.prize.includes('$') && parseInt(giveaway.prize.replace(/[^0-9]/g, '')) >= 500;
            case 'gaming':
              return giveaway.title.toLowerCase().includes('gaming') || 
                     giveaway.title.toLowerCase().includes('ps5') ||
                     giveaway.title.toLowerCase().includes('xbox');
            case 'tech':
              return giveaway.title.toLowerCase().includes('iphone') || 
                     giveaway.title.toLowerCase().includes('laptop') ||
                     giveaway.title.toLowerCase().includes('airpods') ||
                     giveaway.title.toLowerCase().includes('macbook') ||
                     giveaway.title.toLowerCase().includes('ipad');
            case 'fashion':
              return giveaway.title.toLowerCase().includes('fashion') ||
                     giveaway.title.toLowerCase().includes('clothing');
            case 'crypto':
              return giveaway.title.toLowerCase().includes('crypto') || 
                     giveaway.title.toLowerCase().includes('bitcoin') ||
                     giveaway.title.toLowerCase().includes('eth');
            case 'nft':
              return giveaway.title.toLowerCase().includes('nft');
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  };

  // Show loading skeletons if loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 text-white">
        {/* Navigation */}
        <nav className="bg-black/98 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Onagui Giveaways
                </h1>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 text-gray-300 rounded-lg text-sm sm:text-base">
                  <span className="hidden sm:inline">🏠 Home</span>
                  <span className="sm:hidden">🏠</span>
                </button>
                <button className="px-3 py-1.5 sm:px-6 sm:py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                  <span className="text-base sm:text-lg">+</span>
                  <span className="hidden sm:inline">Create my giveaway</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <SearchFilterSkeleton />
          
          {/* Loading Sections */}
          {[1, 2, 3, 4].map((section) => (
            <div key={section} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-48 h-8 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map((card) => (
                  <GiveawayCardSkeleton key={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced scroll functions with smooth animations
  const scrollLeft = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ 
        left: -300, 
        behavior: 'smooth' 
      });
      
      // Add visual feedback
      const scrollButton = container.parentElement?.querySelector('.scroll-left');
      if (scrollButton) {
        scrollButton.classList.add('animate-pulse');
        setTimeout(() => scrollButton.classList.remove('animate-pulse'), 300);
      }
    }
  };

  const scrollRight = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ 
        left: 300, 
        behavior: 'smooth' 
      });
      
      // Add visual feedback
      const scrollButton = container.parentElement?.querySelector('.scroll-right');
      if (scrollButton) {
        scrollButton.classList.add('animate-pulse');
        setTimeout(() => scrollButton.classList.remove('animate-pulse'), 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 text-white">
      {/* Navigation with enhanced animations */}
      <nav className="bg-black/98 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all duration-300">
                Onagui Giveaways
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-300 text-sm sm:text-base transform hover:scale-105 active:scale-95"
              >
                <span className="hidden sm:inline">🏠 Home</span>
                <span className="sm:hidden">🏠</span>
              </button>
              <button
                className="px-3 py-1.5 sm:px-6 sm:py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-1 sm:gap-2 text-sm sm:text-base active:scale-95"
              >
                <span className="text-base sm:text-lg">+</span>
                <span className="hidden sm:inline">Create my giveaway</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Enhanced Search and Filter Section */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Enhanced Search Bar */}
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search giveaways..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base hover:border-gray-600"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Enhanced Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base transform hover:scale-105 active:scale-95 ${
                showFilters || selectedFilters.length > 0
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600'
              }`}
            >
              <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Filters
              {selectedFilters.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 sm:py-1 rounded-full text-xs animate-pulse">
                  {selectedFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedFilters.includes(filter.id)
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600'
                    }`}
                  >
                    <span className="sm:hidden">{filter.emoji}</span>
                    <span className="hidden sm:inline">{filter.emoji} {filter.label}</span>
                  </button>
                ))}
              </div>

              {/* Active Filters & Clear */}
              {(selectedFilters.length > 0 || searchQuery) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 border-t border-gray-700 space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {searchQuery && (
                      <span className="bg-blue-600/20 text-blue-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 animate-in fade-in duration-300">
                        <span className="hidden sm:inline">Search: &quot;</span>&quot;{searchQuery}&quot;
                        <button
                          onClick={() => setSearchQuery('')}
                          className="hover:bg-blue-600/30 rounded-full p-0.5 transition-all duration-200 active:scale-90"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedFilters.map((filterId) => {
                      const filter = filterOptions.find(f => f.id === filterId);
                      return (
                        <span
                          key={filterId}
                          className="bg-purple-600/20 text-purple-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 animate-in fade-in duration-300"
                        >
                          <span className="sm:hidden">{filter?.emoji}</span>
                          <span className="hidden sm:inline">{filter?.label}</span>
                          <span className="sm:hidden">{filter?.label}</span>
                          <button
                            onClick={() => toggleFilter(filterId)}
                            className="hover:bg-purple-600/30 rounded-full p-0.5 transition-all duration-200 active:scale-90"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors duration-300 transform hover:scale-105 active:scale-95 self-start sm:self-auto"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Count */}
          {(searchQuery || selectedFilters.length > 0) && (
            <div className="text-gray-400 text-xs sm:text-sm animate-in fade-in duration-300">
              Showing {filterGiveaways([...mostPopularInfluencers, ...favoriteOnaguiPowered, ...lastChanceGiveaways, ...recentlyAddedGiveaways]).length} results
            </div>
          )}
        </div>

        {/* Most Popular Influencers Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleSection('mostPopular')}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🔥</span>
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                Most Popular
              </h2>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                {expandedSection === 'mostPopular' ? '▼' : '▶'}
              </span>
            </div>
            
            {/* Enhanced Scroll Controls */}
            {expandedSection !== 'mostPopular' && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollLeft('mostPopular-scroll')}
                  className="scroll-left p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400 transform hover:scale-110 active:scale-95"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-purple-400" />
                </button>
                <button
                  onClick={() => scrollRight('mostPopular-scroll')}
                  className="scroll-right p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400 transform hover:scale-110 active:scale-95"
                >
                  <ChevronRightIcon className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            )}
          </div>
          
          {expandedSection === 'mostPopular' ? (
            // Vertical Grid View with enhanced animations
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterGiveaways(mostPopularInfluencers).map((giveaway, index) => (
                <div
                  key={giveaway.id}
                  className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer ${
                    animatingCards.has(giveaway.id.toString()) ? 'animate-pulse scale-105' : 'hover:scale-105'
                  } ${hoveredCard === giveaway.id.toString() ? 'ring-2 ring-purple-500/50' : ''}`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onClick={() => handleCardClick(giveaway.id.toString())}
                  onMouseEnter={() => handleCardHover(giveaway.id.toString())}
                  onMouseLeave={() => handleCardHover(null)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">💎</div>
                    <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm font-bold group-hover:bg-cyan-400 transition-colors duration-300">
                      {giveaway.prize}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">{giveaway.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 group-hover:text-gray-200 transition-colors duration-300">by {giveaway.host}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">{giveaway.entries} entries</span>
                    <span className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors duration-300">{giveaway.timeLeft}</span>
                  </div>
                  
                  <button className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 ${
                    pulsingButtons.has(giveaway.id.toString()) ? 'animate-pulse' : ''
                  }`}>
                    Enter
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Horizontal Scroll View with enhanced animations
            <div 
              id="mostPopular-scroll"
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4" 
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {filterGiveaways(mostPopularInfluencers).map((giveaway, index) => (
                <div
                  key={giveaway.id}
                  className={`min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer ${
                    animatingCards.has(giveaway.id.toString()) ? 'animate-pulse scale-105' : 'hover:scale-105'
                  } ${hoveredCard === giveaway.id.toString() ? 'ring-2 ring-purple-500/50' : ''}`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onClick={() => handleCardClick(giveaway.id.toString())}
                  onMouseEnter={() => handleCardHover(giveaway.id.toString())}
                  onMouseLeave={() => handleCardHover(null)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">💎</div>
                    <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm font-bold group-hover:bg-cyan-400 transition-colors duration-300">
                      {giveaway.prize}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">{giveaway.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 group-hover:text-gray-200 transition-colors duration-300">by {giveaway.host}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">{giveaway.entries} entries</span>
                    <span className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors duration-300">{giveaway.timeLeft}</span>
                  </div>
                  
                  <button className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 ${
                    pulsingButtons.has(giveaway.id.toString()) ? 'animate-pulse' : ''
                  }`}>
                    Enter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites Onagui Powered Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleSection('favorites')}
            >
              <span className="text-xl sm:text-2xl">⭐</span>
              <h2 className="text-lg sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                <span className="hidden sm:inline">Favorites Onagui Powered Giveaway</span>
                <span className="sm:hidden">Favorites</span>
              </h2>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm sm:text-base">
                {expandedSection === 'favorites' ? '▼' : '▶'}
              </span>
            </div>
            
            {/* Scroll Controls */}
            {expandedSection !== 'favorites' && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollLeft('favorites-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-purple-400" />
                </button>
                <button
                  onClick={() => scrollRight('favorites-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronRightIcon className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            )}
          </div>
          
          {expandedSection === 'favorites' ? (
            // Vertical Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filterGiveaways(favoriteOnaguiPowered).map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-yellow-500/50 group cursor-pointer"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`h-20 sm:h-24 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-2xl sm:text-3xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 group-hover:text-yellow-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-yellow-400 font-bold text-xs sm:text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-2 sm:px-3 py-1 rounded-full hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Horizontal Scroll View
            <div 
              id="favorites-scroll"
              className="flex overflow-x-auto scrollbar-hide gap-3 sm:gap-4 pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {filterGiveaways(favoriteOnaguiPowered).map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="min-w-[240px] sm:min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-yellow-500/50 group cursor-pointer"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`h-20 sm:h-24 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-2xl sm:text-3xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 group-hover:text-yellow-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-yellow-400 font-bold text-xs sm:text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-2 sm:px-3 py-1 rounded-full hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Chance Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleSection('lastChance')}
            >
              <span className="text-2xl">⚡</span>
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                Last Chance
              </h2>
              <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-red-400 animate-pulse">Closing Today!</span>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm sm:text-base">
                {expandedSection === 'lastChance' ? '▼' : '▶'}
              </span>
            </div>
            
            {/* Scroll Controls */}
            {expandedSection !== 'lastChance' && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollLeft('lastChance-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-purple-400" />
                </button>
                <button
                  onClick={() => scrollRight('lastChance-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronRightIcon className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            )}
          </div>
          
          {expandedSection === 'lastChance' ? (
            // Vertical Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filterGiveaways(lastChanceGiveaways).map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-red-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-red-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                    {giveaway.timeLeft}
                  </div>
                  <div className={`h-24 sm:h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/30"></div>
                    <span className="text-3xl sm:text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 group-hover:text-red-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-red-400 font-bold text-xs sm:text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 font-semibold animate-pulse">
                        Enter Now!
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Horizontal Scroll View
            <div 
              id="lastChance-scroll"
              className="flex overflow-x-auto scrollbar-hide gap-3 sm:gap-4 pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {filterGiveaways(lastChanceGiveaways).map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="min-w-[240px] sm:min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-red-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-red-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                    {giveaway.timeLeft}
                  </div>
                  <div className={`h-24 sm:h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/30"></div>
                    <span className="text-3xl sm:text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 group-hover:text-red-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-red-400 font-bold text-xs sm:text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 font-semibold animate-pulse">
                        Enter Now!
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Added Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleSection('recentlyAdded')}
            >
              <span className="text-2xl">✨</span>
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                Recently Added Giveaways
              </h2>
              <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-green-400">Fresh!</span>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {expandedSection === 'recentlyAdded' ? '▼' : '▶'}
              </span>
            </div>
            
            {/* Scroll Controls */}
            {expandedSection !== 'recentlyAdded' && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollLeft('recentlyAdded-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-purple-400" />
                </button>
                <button
                  onClick={() => scrollRight('recentlyAdded-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronRightIcon className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            )}
          </div>
          
          {expandedSection === 'recentlyAdded' ? (
            // Vertical Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filterGiveaways(recentlyAddedGiveaways).map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-green-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-green-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 250}ms` }}
                >
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    NEW
                  </div>
                  <div className={`h-24 sm:h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-3xl sm:text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 group-hover:text-green-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-green-400 font-bold text-xs sm:text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-green-500 to-cyan-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
                        Be First!
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Horizontal Scroll View
            <div 
              id="recentlyAdded-scroll"
              className="flex overflow-x-auto scrollbar-hide gap-3 sm:gap-4 pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {filterGiveaways(recentlyAddedGiveaways).map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="min-w-[240px] sm:min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-green-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-green-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 250}ms` }}
                >
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    NEW
                  </div>
                  <div className={`h-24 sm:h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-3xl sm:text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 group-hover:text-green-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-green-400 font-bold text-xs sm:text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-green-500 to-cyan-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
                        Be First!
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}