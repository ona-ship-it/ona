import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Raffles() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>ONAGUI - Raffles</title>
        <meta name="description" content="Participate in exciting raffles on ONAGUI" />
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
            <Link href="/raffles" className="flex items-center text-white border-b-2 border-pink-500 pb-1">
              <span className="mr-1">🎯</span> Raffles
            </Link>
            <Link href="/marketplace" className="flex items-center text-gray-300 hover:text-white transition-colors">
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
          <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Win Big with Raffles</h1>
          <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto">Enter raffles for a chance to win amazing prizes. The more tickets you buy, the higher your chances!</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-md transition duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Raffle
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-md transition duration-300 flex items-center justify-center">
              Browse All Raffles
            </button>
          </div>
        </div>
        
        {/* Featured Raffles */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">Featured Raffles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Raffle Cards */}
            {[
              {
                title: "Luxury Watch Raffle",
                description: "Win a premium luxury watch worth over $5,000. Limited tickets available!",
                ticketPrice: "$10",
                ticketsLeft: "245",
                badge: { text: "POPULAR", color: "pink" },
                gradient: "from-purple-900 to-indigo-900"
              },
              {
                title: "Gaming Console Bundle",
                description: "Win the latest gaming console with 5 games and accessories.",
                ticketPrice: "$5",
                ticketsLeft: "478",
                badge: { text: "NEW", color: "green" },
                gradient: "from-indigo-900 to-blue-900"
              },
              {
                title: "Vacation Getaway",
                description: "Win a 7-day vacation package for two to a tropical destination.",
                ticketPrice: "$25",
                ticketsLeft: "120",
                badge: { text: "ENDING SOON", color: "red" },
                gradient: "from-pink-900 to-purple-900"
              }
            ].map((raffle, index) => (
              <div key={index} className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 border border-gray-800 hover:border-purple-500">
                <div className={`h-48 bg-gradient-to-r ${raffle.gradient} relative`}>
                  <div className={`absolute top-4 right-4 bg-${raffle.badge.color}-600 text-white text-xs font-bold px-2 py-1 rounded`}>
                    {raffle.badge.text}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full">
                    Ticket Price: {raffle.ticketPrice}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{raffle.title}</h3>
                  <p className="text-gray-400 mb-4">{raffle.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">{raffle.ticketsLeft} tickets left</div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-md transition-colors">
                      Buy Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}
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