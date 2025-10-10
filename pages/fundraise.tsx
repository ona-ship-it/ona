import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Fundraise() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ONAGUI - Fundraise</title>
        <meta name="description" content="Create and manage fundraising campaigns on ONAGUI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Navigation Bar */}
      <nav className="bg-white py-4 px-6 flex justify-between items-center border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          {isClient ? (
            <Link href="/">
              <div className="text-2xl font-bold text-gray-800">ONAGUI</div>
            </Link>
          ) : (
            <a href="/">
              <div className="text-2xl font-bold text-gray-800">ONAGUI</div>
            </a>
          )}
          <div className="ml-10 hidden md:flex space-x-8">
            {isClient ? (
              <>
                <Link href="/fundraise" className="flex items-center text-purple-600 font-medium">
                  <span className="mr-1">🎁</span> Fundraise
                </Link>
                <Link href="/giveaways" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="mr-1">🎟️</span> Giveaways
                </Link>
                <Link href="/raffles" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="mr-1">🎯</span> Raffles
                </Link>
                <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="mr-1">🛒</span> Marketplace
                </Link>
              </>
            ) : (
              <>
                <a href="/fundraise" className="flex items-center text-purple-600 font-medium">
                  <span className="mr-1">🎁</span> Fundraise
                </a>
                <a href="/giveaways" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="mr-1">🎟️</span> Giveaways
                </a>
                <a href="/raffles" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="mr-1">🎯</span> Raffles
                </a>
                <a href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="mr-1">🛒</span> Marketplace
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-5">
          <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors">Create</button>
          <div className="flex items-center">
            <span className="text-gray-600 hover:text-gray-900 transition-colors">Sign in</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2 text-purple-700">FUNDRAISE</h1>
          <p className="text-gray-600 max-w-2xl">Support causes you care about or create your own fundraising campaign to make a difference.</p>
        </div>
        
        {/* Create Fundraise Button */}
        <div className="flex justify-end mb-8">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-md transition duration-300 shadow-md">
            + Create my fundraise
          </button>
        </div>
        
        {/* Featured Fundraise Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Featured Fundraise <span className="text-purple-600">▸</span></h2>
            <div className="flex space-x-3">
              <button className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Fundraise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Clean Ocean Initiative */}
            <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span role="img" aria-label="ocean" className="text-xl">🌊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Clean Ocean Initiative</h3>
                    <p className="text-sm text-blue-600">Ocean Cleanup Foundation</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-800">$32,450 of $50,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reforestation Project */}
            <div className="bg-white rounded-xl border border-green-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span role="img" aria-label="tree" className="text-xl">🌳</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Reforestation Project</h3>
                    <p className="text-sm text-green-600">Green Earth Alliance</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-800">$18,750 of $25,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Education for All */}
            <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <span role="img" aria-label="books" className="text-xl">📚</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Education for All</h3>
                    <p className="text-sm text-yellow-600">Global Education Fund</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-800">$67,890 of $100,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medical Relief Fund */}
            <div className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span role="img" aria-label="medical" className="text-xl">🏥</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Medical Relief Fund</h3>
                    <p className="text-sm text-red-600">Healthcare Without Borders</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '57%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-800">$42,300 of $75,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}