'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import PageTitle from '@/components/PageTitle';
import { useTheme } from '@/components/ThemeContext';

export default function RafflesPage() {
  const { isDarker } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarker ? 'bg-gray-900' : 'bg-white'}`}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <PageTitle className="text-3xl md:text-4xl" gradient={true}>
            Raffles
          </PageTitle>
          <button className="flex items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-700 transition-all duration-300">
            + create my raffle
          </button>
        </div>
        
        {/* Featured Raffles Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Featured Raffles</h2>
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
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-blue-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Luxury Watch Raffle</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by WatchCollector</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Win a limited edition Rolex Submariner worth $15,000.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-blue-600">850 tickets sold</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>150 tickets left</span>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-cyan-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Exotic Car Weekend</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by LuxuryExperiences</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Win a weekend driving a Ferrari 488 Spider in Monaco.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-cyan-600">650 tickets sold</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>350 tickets left</span>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-teal-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>$10,000 Cash Raffle</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by BigWinners</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Win $10,000 cash with only 500 tickets available.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-teal-600">475 tickets sold</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>25 tickets left</span>
                </div>
              </div>
            </div>
            
            {/* Card 4 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-sky-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-sky-400 to-sky-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>MacBook Pro Bundle</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by TechRaffles</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Win a MacBook Pro with accessories worth $3,500.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-sky-600">200 tickets sold</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>300 tickets left</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* All Raffles Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>All Raffles</h2>
            <div className="flex items-center space-x-4">
              <div className={`relative ${isDarker ? 'text-gray-300' : 'text-gray-600'}`}>
                <input
                  type="text"
                  placeholder="Search raffles..."
                  className={`pl-10 pr-4 py-2 rounded-full ${isDarker ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-100 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64`}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select className={`rounded-full px-4 py-2 ${isDarker ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-100 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                <option>All Categories</option>
                <option>Luxury Items</option>
                <option>Electronics</option>
                <option>Cash Prizes</option>
                <option>Experiences</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-emerald-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Designer Handbag</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by FashionRaffles</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Win a limited edition Louis Vuitton handbag worth $4,000.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-emerald-600">350 tickets sold</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>150 tickets left</span>
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
              <button className={`w-10 h-10 rounded-full ${isDarker ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}>1</button>
              <button className={`w-10 h-10 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>2</button>
              <button className={`w-10 h-10 rounded-full ${isDarker ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>3</button>
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