"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

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

  const scrollLeft = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="bg-black/98 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Onagui Giveaways
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-300"
              >
                🏠 Home
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Create my giveaway
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Most Popular Influencers Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleSection('mostPopular')}
            >
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                Most Popular
              </h2>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {expandedSection === 'mostPopular' ? '▼' : '▶'}
              </span>
            </div>
            
            {/* Scroll Controls */}
            {expandedSection !== 'mostPopular' && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollLeft('mostPopular-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-purple-400" />
                </button>
                <button
                  onClick={() => scrollRight('mostPopular-scroll')}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 border border-purple-500/30 hover:border-purple-400"
                >
                  <ChevronRightIcon className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            )}
          </div>
          
          {expandedSection === 'mostPopular' ? (
            // Vertical Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mostPopularInfluencers.map((giveaway, index) => (
                <div
                  key={giveaway.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 group"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-3xl">💎</div>
                    <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {giveaway.prize}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">{giveaway.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">by {giveaway.host}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">{giveaway.entries} entries</span>
                    <span className="text-cyan-400 text-sm font-medium">{giveaway.timeLeft}</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30">
                    Enter
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Horizontal Scroll View
            <div 
              id="mostPopular-scroll"
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4" 
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {mostPopularInfluencers.map((giveaway, index) => (
                <div
                  key={giveaway.id}
                  className="min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 group"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-3xl">💎</div>
                    <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {giveaway.prize}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">{giveaway.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">by {giveaway.host}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">{giveaway.entries} entries</span>
                    <span className="text-cyan-400 text-sm font-medium">{giveaway.timeLeft}</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30">
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
              <span className="text-2xl">⭐</span>
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                Favorites Onagui Powered Giveaway
              </h2>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteOnaguiPowered.map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-yellow-500/50 group cursor-pointer"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`h-24 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-3xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-yellow-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-yellow-400 font-bold text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-3 py-1 rounded-full hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
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
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {favoriteOnaguiPowered.map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-yellow-500/50 group cursor-pointer"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`h-24 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-3xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-yellow-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-yellow-400 font-bold text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-3 py-1 rounded-full hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
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
              <span className="ml-3 text-sm text-red-400 animate-pulse">Closing Today!</span>
              <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lastChanceGiveaways.map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-red-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-red-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {giveaway.timeLeft}
                  </div>
                  <div className={`h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/30"></div>
                    <span className="text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-red-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-red-400 font-bold text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 font-semibold animate-pulse">
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
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {lastChanceGiveaways.map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-red-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-red-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {giveaway.timeLeft}
                  </div>
                  <div className={`h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/30"></div>
                    <span className="text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-red-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-red-400 font-bold text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 font-semibold animate-pulse">
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
              <span className="ml-3 text-sm text-green-400">Fresh!</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentlyAddedGiveaways.map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-green-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-green-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 250}ms` }}
                >
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </div>
                  <div className={`h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-green-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-green-400 font-bold text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-green-500 to-cyan-500 text-white text-xs px-3 py-1 rounded-full hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
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
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {recentlyAddedGiveaways.map((giveaway, index) => (
                <div 
                  key={giveaway.id}
                  className="min-w-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-green-500/30 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-green-400/70 group cursor-pointer relative"
                  style={{ animationDelay: `${index * 250}ms` }}
                >
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </div>
                  <div className={`h-28 bg-gradient-to-br ${giveaway.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-4xl relative z-10">{giveaway.image}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-green-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <div className="text-green-400 font-bold text-sm mb-2">{giveaway.prize}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{giveaway.entries.toLocaleString()} entries</span>
                      <button className="bg-gradient-to-r from-green-500 to-cyan-500 text-white text-xs px-3 py-1 rounded-full hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
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