'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import PageTitle from '@/components/PageTitle';
import { useTheme } from '@/components/ThemeContext';

export default function MarketplacePage() {
  const { isDarker } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarker ? 'bg-gray-900' : 'bg-white'}`}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <PageTitle className="text-3xl md:text-4xl" gradient={true}>
            Marketplace
          </PageTitle>
          <button className="flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            + list my item
          </button>
        </div>
        
        {/* Featured Items Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Featured Items</h2>
            <div className="flex space-x-2">
              <button className={`p-2 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={isDarker ? '#e5e7eb' : 'currentColor'} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className={`p-2 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={isDarker ? '#e5e7eb' : 'currentColor'} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-purple-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Limited Edition Sneakers</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by SneakerHead</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Brand new Nike Air Jordan 1 Retro High OG &quot;Chicago&quot; - Size 10.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl text-onaguiGreen">$899</span>
                  <button className={`px-4 py-2 rounded-full ${isDarker ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-sm font-medium`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-indigo-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Gaming Laptop</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by TechDeals</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>ASUS ROG Strix G15, RTX 3080, 32GB RAM, 1TB SSD.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl text-indigo-600">$1,899</span>
                  <button className={`px-4 py-2 rounded-full ${isDarker ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-sm font-medium`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-violet-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-violet-400 to-violet-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-400 to-violet-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Digital Art Collection</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by DigitalArtist</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Set of 5 limited edition digital art pieces with certificate of authenticity.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl text-violet-600">$499</span>
                  <button className={`px-4 py-2 rounded-full ${isDarker ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-sm font-medium`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* Card 4 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-fuchsia-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-fuchsia-400 to-fuchsia-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-fuchsia-400 to-fuchsia-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Vintage Camera</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by VintageCollector</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Leica M3 (1954) in excellent condition with original leather case.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl text-fuchsia-600">$2,499</span>
                  <button className={`px-4 py-2 rounded-full ${isDarker ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-sm font-medium`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* All Items Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>All Items</h2>
            <div className="flex items-center space-x-4">
              <div className={`relative ${isDarker ? 'text-gray-300' : 'text-gray-600'}`}>
                <input
                  type="text"
                  placeholder="Search items..."
                  className={`pl-10 pr-4 py-2 rounded-full ${isDarker ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-100 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-onaguiGreen w-64`}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select className={`rounded-full px-4 py-2 ${isDarker ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-100 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-onaguiGreen`}>
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Collectibles</option>
                <option>Home & Garden</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-pink-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Mechanical Keyboard</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by TechGear</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Custom mechanical keyboard with Cherry MX switches and RGB lighting.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl text-pink-600">$199</span>
                  <button className={`px-4 py-2 rounded-full ${isDarker ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-sm font-medium`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* More cards would go here */}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button className={`p-2 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className={`w-10 h-10 rounded-full bg-[#5AFF7F] text-white`}>1</button>
                <button className={`w-10 h-10 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-[#5AFF7F] text-gray-300' : 'bg-gray-100 hover:bg-[#5AFF7F] text-gray-600'}`}>2</button>
                <button className={`w-10 h-10 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-[#5AFF7F] text-gray-300' : 'bg-gray-100 hover:bg-[#5AFF7F] text-gray-600'}`}>3</button>
              <button className={`p-2 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}