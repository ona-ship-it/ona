import React from 'react';
import Navigation from '@/components/Navigation';
import PageTitle from '@/components/PageTitle';
import OnaguiSymbol from '@/components/OnaguiSymbol';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white border-opacity-20 w-full max-w-4xl">
            <div className="flex items-center justify-center mb-6">
              <OnaguiSymbol size="large" />
              <PageTitle title="Welcome to Onagui" className="text-white ml-4 text-4xl font-bold" />
            </div>
            
            <p className="text-white text-xl mb-8 text-center">
              The next generation blockchain platform for creators and enthusiasts
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-white font-bold text-xl mb-3">NFT Marketplace</h3>
                <p className="text-white opacity-90">Discover and collect unique digital assets from creators around the world.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-white font-bold text-xl mb-3">Giveaways</h3>
                <p className="text-white opacity-90">Participate in exclusive giveaways and win amazing blockchain rewards.</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-400 to-green-500 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-white font-bold text-xl mb-3">Community</h3>
                <p className="text-white opacity-90">Join our vibrant community of blockchain enthusiasts and developers.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 mr-4">
                Get Started
              </button>
              <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}