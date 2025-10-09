'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import PageTitle from '@/components/PageTitle';
import { useTheme } from '@/components/ThemeContext';

export default function FundraisePage() {
  const { isDarker } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarker ? 'bg-gray-900' : 'bg-white'}`}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <PageTitle className="text-3xl md:text-4xl" gradient={true}>
            Fundraise
          </PageTitle>
          <button className="flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            + create my fundraise
          </button>
        </div>
        
        {/* Featured Fundraise Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Featured Fundraisers</h2>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Clean Ocean Initiative</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Ocean Foundation</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Help us remove 10 tons of plastic from the ocean this year.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-blue-600">$65,000 raised</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $100,000 goal</span>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-green-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Reforestation Project</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Green Earth</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Plant 50,000 trees in deforested areas around the world.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-green-600">$41,000 raised</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $50,000 goal</span>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Education for All</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Learning Foundation</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Provide education resources to 1,000 underprivileged children.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-onaguiGreen">$22,500 raised</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $50,000 goal</span>
                </div>
              </div>
            </div>
            
            {/* Card 4 */}
            <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-red-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
              {/* Photo space */}
              <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Medical Relief Fund</h3>
                    <p className={`text-sm ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Health Alliance</p>
                  </div>
                </div>
                <p className={`${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Provide medical supplies to underserved communities worldwide.</p>
                <div className="mb-2">
                  <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-red-600">$30,000 raised</span>
                  <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $100,000 goal</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* All Fundraisers Section */}
         <section>
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-gray-800">All Fundraisers</h2>
             <div className="flex items-center">
               <div className="relative mr-4">
                 <input
                   type="text"
                   placeholder="Search fundraisers..."
                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-onaguiGreen focus:border-transparent"
                 />
                 <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-400">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                 </div>
               </div>
               <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-onaguiGreen focus:border-transparent">
                 <option>All Categories</option>
                 <option>Environment</option>
                 <option>Education</option>
                 <option>Medical</option>
                 <option>Humanitarian</option>
               </select>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             {/* Card 1 */}
             <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border-l-4 border-yellow-500 overflow-hidden hover:shadow-lg transition-all duration-300`}>
               {/* Photo space */}
               <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                 <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                   </svg>
                 </div>
               </div>
               <div className="p-5">
                 <div className="flex items-center mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className={`font-bold ${isDarker ? 'text-gray-100' : 'text-gray-800'}`}>Energy Access Project</h3>
                     <p className={`text-xs ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Energy Alliance</p>
                   </div>
                 </div>
                 <p className={`text-sm ${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Bringing renewable energy to rural communities.</p>
                 <div className="mb-1">
                   <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                     <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" style={{ width: '25%' }}></div>
                   </div>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="font-medium text-yellow-600">$12,500 raised</span>
                   <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $50,000 goal</span>
                 </div>
               </div>
             </div>
             
             {/* Card 2 */}
             <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border-l-4 border-indigo-500 overflow-hidden hover:shadow-lg transition-all duration-300`}>
               {/* Photo space */}
               <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                 <div className="w-full h-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                   </svg>
                 </div>
               </div>
               <div className="p-5">
                 <div className="flex items-center mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className={`font-bold ${isDarker ? 'text-white' : 'text-gray-800'}`}>Tech for Kids</h3>
                     <p className={`text-xs ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Digital Future</p>
                   </div>
                 </div>
                 <p className={`text-sm ${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Providing coding education to underprivileged youth.</p>
                 <div className="mb-1">
                   <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                     <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" style={{ width: '60%' }}></div>
                   </div>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="font-medium text-indigo-600">$18,000 raised</span>
                   <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $30,000 goal</span>
                 </div>
               </div>
             </div>
             
             {/* Card 3 */}
             <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border-l-4 border-pink-500 overflow-hidden hover:shadow-lg transition-all duration-300`}>
               {/* Photo space */}
               <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                 <div className="w-full h-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                   </svg>
                 </div>
               </div>
               <div className="p-5">
                 <div className="flex items-center mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className={`font-bold ${isDarker ? 'text-white' : 'text-gray-800'}`}>Women&#39;s Health Initiative</h3>
                     <p className={`text-xs ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Health Forward</p>
                   </div>
                 </div>
                 <p className={`text-sm ${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Supporting women&#39;s health services in developing regions.</p>
                 <div className="mb-1">
                   <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                     <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full" style={{ width: '75%' }}></div>
                   </div>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="font-medium text-pink-600">$37,500 raised</span>
                   <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $50,000 goal</span>
                 </div>
               </div>
             </div>
             
             {/* Card 4 */}
             <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border-l-4 border-cyan-500 overflow-hidden hover:shadow-lg transition-all duration-300`}>
               {/* Photo space */}
               <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                 <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                   </svg>
                 </div>
               </div>
               <div className="p-5">
                 <div className="flex items-center mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className={`font-bold ${isDarker ? 'text-white' : 'text-gray-800'}`}>Homeless Shelter Project</h3>
                     <p className={`text-xs ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Community Care</p>
                   </div>
                 </div>
                 <p className={`text-sm ${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Building new shelters for homeless individuals in urban areas.</p>
                 <div className="mb-1">
                   <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                     <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" style={{ width: '40%' }}></div>
                   </div>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="font-medium text-cyan-600">$80,000 raised</span>
                   <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $200,000 goal</span>
                 </div>
               </div>
             </div>
             
             {/* Card 5 */}
             <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border-l-4 border-amber-500 overflow-hidden hover:shadow-lg transition-all duration-300`}>
               <div className="p-5">
                 <div className="flex items-center mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className={`font-bold ${isDarker ? 'text-white' : 'text-gray-800'}`}>Arts for Youth</h3>
                     <p className={`text-xs ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Creative Futures</p>
                   </div>
                 </div>
                 <p className={`text-sm ${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Bringing arts education to schools with limited resources.</p>
                 <div className="mb-1">
                   <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                     <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: '55%' }}></div>
                   </div>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="font-medium text-amber-600">$16,500 raised</span>
                   <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $30,000 goal</span>
                 </div>
               </div>
             </div>
             
             {/* Card 6 */}
             <div className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border-l-4 border-emerald-500 overflow-hidden hover:shadow-lg transition-all duration-300`}>
               <div className="p-5">
                 <div className="flex items-center mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className={`font-bold ${isDarker ? 'text-white' : 'text-gray-800'}`}>Disaster Relief Fund</h3>
                     <p className={`text-xs ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by Global Response</p>
                   </div>
                 </div>
                 <p className={`text-sm ${isDarker ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Providing emergency aid to communities affected by natural disasters.</p>
                 <div className="mb-1">
                   <div className={`h-2 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                     <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '90%' }}></div>
                   </div>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="font-medium text-emerald-600">$90,000 raised</span>
                   <span className={`${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>of $100,000 goal</span>
                 </div>
               </div>
             </div>
           </div>
           
           {/* Pagination */}
           <div className="flex justify-center mt-8 mb-4">
             <nav className="flex items-center">
               <button className={`px-3 py-1 rounded-md mr-2 ${isDarker ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={isDarker ? 'white' : 'currentColor'} className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                 </svg>
               </button>
               <button className="px-3 py-1 rounded-md mx-1 bg-[#5AFF7F] text-white">1</button>
                <button className={`px-3 py-1 rounded-md mx-1 ${isDarker ? 'bg-gray-700 hover:bg-[#5AFF7F] text-gray-300' : 'bg-gray-100 hover:bg-[#5AFF7F]'}`}>2</button>
                <button className={`px-3 py-1 rounded-md mx-1 ${isDarker ? 'bg-gray-700 hover:bg-[#5AFF7F] text-gray-300' : 'bg-gray-100 hover:bg-[#5AFF7F]'}`}>3</button>
                <span className="mx-1">...</span>
                <button className={`px-3 py-1 rounded-md mx-1 ${isDarker ? 'bg-gray-700 hover:bg-[#5AFF7F] text-gray-300' : 'bg-gray-100 hover:bg-[#5AFF7F]'}`}>8</button>
               <button className={`px-3 py-1 rounded-md ml-2 ${isDarker ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={isDarker ? 'white' : 'currentColor'} className="w-5 h-5">
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