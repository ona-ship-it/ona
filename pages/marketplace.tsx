import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>ONAGUI - Marketplace</title>
        <meta name="description" content="Explore the ONAGUI marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Navigation Bar */}
      <nav className="bg-black bg-opacity-90 py-4 px-6 flex justify-between items-center border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <Link href="/">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">ONAGUI</div>
          </Link>
          <div className="ml-10 hidden md:flex space-x-8">
            <Link href="/fundraise" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span className="mr-1">🎁</span> Fundraise
            </Link>
            <Link href="/giveaways" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span className="mr-1">🎟️</span> Giveaways
            </Link>
            <Link href="/raffles" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span className="mr-1">🎯</span> Raffles
            </Link>
            <Link href="/marketplace" className="flex items-center text-white border-b-2 border-pink-500 pb-1">
              <span className="mr-1">🛒</span> Marketplace
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-5">
          <button className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105">Create</button>
          <button className="text-gray-300 hover:text-white transition-colors">Sign in</button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 pb-16 relative">
        {/* Hero Section */}
        <div className="text-center my-20 relative z-10">
          <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">ONAGUI Marketplace</h1>
          <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto">Discover unique digital items, collectibles, and services from creators around the world.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-md transition duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              List an Item
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-md transition duration-300 flex items-center justify-center">
              Browse Categories
            </button>
          </div>
        </div>
        
        {/* Categories Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Digital Art", icon: "🎨", color: "from-purple-500 to-indigo-500" },
              { name: "Collectibles", icon: "🏆", color: "from-pink-500 to-purple-500" },
              { name: "Music", icon: "🎵", color: "from-blue-500 to-indigo-500" },
              { name: "Gaming", icon: "🎮", color: "from-indigo-500 to-blue-500" },
              { name: "Photography", icon: "📸", color: "from-green-500 to-teal-500" },
              { name: "Virtual Worlds", icon: "🌐", color: "from-yellow-500 to-orange-500" },
              { name: "Domain Names", icon: "🔠", color: "from-red-500 to-pink-500" },
              { name: "Services", icon: "🛠️", color: "from-purple-500 to-pink-500" }
            ].map((category, index) => (
              <div key={index} className={`bg-gradient-to-r ${category.color} p-6 rounded-xl hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
        
        {/* Featured Items */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">Featured Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Cosmic Dreams #42",
                creator: "ArtistX",
                price: "0.5 ETH",
                type: "Digital Art",
                image: "from-purple-900 to-indigo-900"
              },
              {
                title: "Melody Fragments",
                creator: "SoundWave",
                price: "0.2 ETH",
                type: "Music",
                image: "from-blue-900 to-indigo-900"
              },
              {
                title: "Virtual Land Plot",
                creator: "MetaBuilder",
                price: "1.2 ETH",
                type: "Virtual Worlds",
                image: "from-green-900 to-teal-900"
              },
              {
                title: "Rare Collectible #7",
                creator: "CollectorPrime",
                price: "0.8 ETH",
                type: "Collectibles",
                image: "from-pink-900 to-purple-900"
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 border border-gray-800 hover:border-purple-500">
                <div className={`h-48 bg-gradient-to-r ${item.image} relative`}></div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{item.type}</div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">by {item.creator}</p>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{item.price}</div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-1 px-3 rounded-md transition-colors">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white py-2 px-6 rounded-md transition-colors">
              View More Items
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 md:mb-0">ONAGUI</div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
              © 2023 ONAGUI. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}