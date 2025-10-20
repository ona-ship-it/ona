import React from 'react';
import Navigation from '@/components/Navigation';
import PageTitle from '@/components/PageTitle';
import GiveawaysClient from '@/components/GiveawaysClient';

export default function Giveaways() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mt-10 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white border-opacity-20">
          <PageTitle title="Giveaways" className="text-white text-center" />
          
          <p className="text-white text-xl mb-8 text-center">
            Participate in our exclusive blockchain giveaways and win amazing rewards!
          </p>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white border-opacity-20 pb-2">Current Giveaways</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg">
                <h3 className="text-white font-bold text-xl mb-3">NFT Starter Pack</h3>
                <p className="text-white opacity-90 mb-4">Win a collection of 5 exclusive NFTs to start your digital collection.</p>
                <p className="text-white opacity-80 mb-4">Ends in: 3 days</p>
                <GiveawaysClient />
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-lg shadow-lg">
                <h3 className="text-white font-bold text-xl mb-3">500 ONA Tokens</h3>
                <p className="text-white opacity-90 mb-4">Get a chance to win 500 ONA tokens to use on our platform.</p>
                <p className="text-white opacity-80 mb-4">Ends in: 5 days</p>
                <button className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full shadow-md hover:bg-opacity-90 transition-all duration-300">
                  Enter Giveaway
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white border-opacity-20 pb-2">Past Winners</h2>
            <div className="bg-white bg-opacity-5 rounded-lg p-4">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white border-opacity-20">
                    <th className="py-2 text-left">Giveaway</th>
                    <th className="py-2 text-left">Winner</th>
                    <th className="py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white border-opacity-10">
                    <td className="py-3">1000 ONA Tokens</td>
                    <td className="py-3">0x7a2...3f9b</td>
                    <td className="py-3">June 15, 2023</td>
                  </tr>
                  <tr className="border-b border-white border-opacity-10">
                    <td className="py-3">Exclusive NFT Collection</td>
                    <td className="py-3">0x3d8...9c4e</td>
                    <td className="py-3">May 28, 2023</td>
                  </tr>
                  <tr>
                    <td className="py-3">Community Access Pass</td>
                    <td className="py-3">0x5f1...2a7d</td>
                    <td className="py-3">May 10, 2023</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}