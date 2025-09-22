'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import OnaguiSymbol from '../components/OnaguiSymbol';
import PageTitle from '@/components/PageTitle';
import { useState } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-10 left-5 w-2 h-2 rounded-full bg-green-500 opacity-30 animate-pulse"></div>
        <div className="absolute top-20 right-10 w-2 h-2 rounded-full bg-blue-500 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 w-2 h-2 rounded-full bg-cyan-500 opacity-30 animate-pulse"></div>
        <div className="absolute top-30 left-1/3 w-2 h-2 rounded-full bg-purple-500 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-2 h-2 rounded-full bg-green-500 opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="text-center">
            <PageTitle className="text-4xl md:text-6xl mb-3" gradient={true}>
              <span style={{ letterSpacing: '0.2em' }}>ON<span style={{ display: 'inline-block', transform: 'rotate(180deg) scaleX(-1)', verticalAlign: 'baseline' }}>V</span>GUI</span>
            </PageTitle>
            <p className="text-lg md:text-xl text-white mb-5">
              Statistically Onagui Is Your Best Chance To Win
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <div className="relative group">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Create My ONAGUI
                </button>
                
                {/* Cards that appear on hover */}
                <div className="fixed left-1/2 transform -translate-x-1/2 top-[120px] w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))', pointerEvents: 'auto' }}>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Fundraise Card */}
                    <Link href="/fundraise" className="bg-gray-900 border border-purple-500 rounded-lg p-4 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">💰</span>
                        <h3 className="text-lg font-bold text-white">Fundraise</h3>
                      </div>
                      <p className="text-gray-300 text-sm">Create campaigns to raise funds for your projects, causes, or events.</p>
                    </Link>
                    
                    {/* Giveaways Card */}
                    <Link href="/giveaways" className="bg-gray-900 border border-blue-500 rounded-lg p-4 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🎁</span>
                        <h3 className="text-lg font-bold text-white">Giveaways</h3>
                      </div>
                      <p className="text-gray-300 text-sm">Host giveaways to engage your audience and reward your community.</p>
                    </Link>
                    
                    {/* Raffles Card */}
                    <Link href="/raffles" className="bg-gray-900 border border-indigo-500 rounded-lg p-4 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🎲</span>
                        <h3 className="text-lg font-bold text-white">Raffles</h3>
                      </div>
                      <p className="text-gray-300 text-sm">Run exciting raffles with transparent odds and fair distribution.</p>
                    </Link>
                    
                    {/* Marketplace Card */}
                    <Link href="/marketplace" className="bg-gray-900 border border-cyan-500 rounded-lg p-4 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🛒</span>
                        <h3 className="text-lg font-bold text-white">Marketplace</h3>
                      </div>
                      <p className="text-gray-300 text-sm">Buy and sell products or services in our community marketplace.</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Giveaways Row - Styled like hovering menu cards */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Giveaways</h2>
          <div className="flex space-x-2 items-center">
            <button 
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
              onClick={() => {
                const container = document.getElementById('giveaways-scroll');
                if (container) {
                  container.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
              onClick={() => {
                const container = document.getElementById('giveaways-scroll');
                if (container) {
                  container.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        <div id="giveaways-scroll" className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* MrBeast Giveaway Card */}
          <Link href="/giveaways" className="bg-gray-900 border border-purple-500 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 min-w-[280px] flex flex-col h-[400px] mt-6">
            {/* Photo space (50% of card) */}
            <div className="h-[200px] bg-gray-800 rounded-t-lg flex items-center justify-center overflow-hidden">
              <div className="flex items-center justify-center w-full h-full">
                <OnaguiSymbol size={120} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
            </div>
            {/* Content space (50% of card) */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🎮</span>
                <h3 className="text-lg font-bold text-white">MrBeast $10,000 Cash</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">Win $10,000 cash prize from the famous YouTuber MrBeast.</p>
              <div className="flex justify-between items-center text-sm mt-auto">
                <span className="text-white">MrBeast</span>
                <span className="text-purple-300">1.2M entries</span>
              </div>
            </div>
          </Link>
          
          {/* PewDiePie Giveaway Card */}
          <Link href="/giveaways" className="bg-gray-900 border border-blue-500 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 min-w-[280px] flex flex-col h-[400px] mt-6">
            {/* Photo space (50% of card) */}
            <div className="h-[200px] bg-gray-800 rounded-t-lg flex items-center justify-center overflow-hidden">
              <div className="flex items-center justify-center w-full h-full">
                <OnaguiSymbol size={120} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
            </div>
            {/* Content space (50% of card) */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🎧</span>
                <h3 className="text-lg font-bold text-white">PewDiePie Gaming Setup</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">Win a complete gaming setup worth $5,000 from PewDiePie.</p>
              <div className="flex justify-between items-center text-sm mt-auto">
                <span className="text-white">PewDiePie</span>
                <span className="text-blue-300">845K entries</span>
              </div>
            </div>
          </Link>
          
          {/* Ninja Giveaway Card */}
          <Link href="/giveaways" className="bg-gray-900 border border-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 min-w-[280px] flex flex-col h-[400px] mt-6">
            {/* Photo space (50% of card) */}
            <div className="h-[200px] bg-gray-800 rounded-t-lg flex items-center justify-center overflow-hidden">
              <div className="flex items-center justify-center w-full h-full">
                <OnaguiSymbol size={120} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
            </div>
            {/* Content space (50% of card) */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🎯</span>
                <h3 className="text-lg font-bold text-white">Ninja Fortnite V-Bucks</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">Win 50,000 V-Bucks for Fortnite from Ninja himself.</p>
              <div className="flex justify-between items-center text-sm mt-auto">
                <span className="text-white">Ninja</span>
                <span className="text-indigo-300">732K entries</span>
              </div>
            </div>
          </Link>
          
          {/* Pokimane Giveaway Card */}
          <Link href="/giveaways" className="bg-gray-900 border border-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 min-w-[280px] flex flex-col h-[400px] mt-6">
            {/* Photo space (50% of card) */}
            <div className="h-[200px] bg-gray-800 rounded-t-lg flex items-center justify-center overflow-hidden">
              <div className="flex items-center justify-center w-full h-full">
                <OnaguiSymbol size={120} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
            </div>
            {/* Content space (50% of card) */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">📱</span>
                <h3 className="text-lg font-bold text-white">Pokimane Streaming Bundle</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">Win a complete streaming setup worth $3,000 from Pokimane.</p>
              <div className="flex justify-between items-center text-sm mt-auto">
                <span className="text-white">Pokimane</span>
                <span className="text-cyan-300">621K entries</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Raffles Row - Copied from RafflesClient.tsx */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-950">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Hot Raffles</h2>
          <div className="flex space-x-2 items-center">
            <button 
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
              onClick={() => {
                const container = document.getElementById('raffles-scroll');
                if (container) {
                  container.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
              onClick={() => {
                const container = document.getElementById('raffles-scroll');
                if (container) {
                  container.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        <div 
          id="raffles-scroll" 
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
            <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
              <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
            </div>
            <h3 className="font-medium text-white mb-1">Tesla Model 3 Raffle</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span>$25/ticket</span>
              <span>Ends in 3 days</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
            <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
              <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
            </div>
            <h3 className="font-medium text-white mb-1">MacBook Pro Raffle</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span>$10/ticket</span>
              <span>Ends in 5 days</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
            <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
              <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
            </div>
            <h3 className="font-medium text-white mb-1">Luxury Condo Raffle</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span>$100/ticket</span>
              <span>Ends in 30 days</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
            <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
              <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
            </div>
            <h3 className="font-medium text-white mb-1">$50,000 Cash Raffle</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span>$50/ticket</span>
              <span>Ends in 14 days</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
            <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
              <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
            </div>
            <h3 className="font-medium text-white mb-1">iPhone 15 Pro Raffle</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span>$5/ticket</span>
              <span>Ends in 2 days</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
            <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
              <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
            </div>
            <h3 className="font-medium text-white mb-1">PS5 Console Raffle</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span>$8/ticket</span>
              <span>Ends in 7 days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Fundraise Row */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Fundraisers</h2>
          <div className="flex space-x-2 items-center">
            <button 
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
              onClick={() => {
                const container = document.getElementById('fundraisers-scroll');
                if (container) {
                  container.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
              onClick={() => {
                const container = document.getElementById('fundraisers-scroll');
                if (container) {
                  container.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        <div id="fundraisers-scroll" className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg min-w-[280px]">
            <div className="h-40 bg-blue-900 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <OnaguiSymbol size={120} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Medical Relief Fund</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-300 mb-4">
                <span>$75,000 raised</span>
                <span>$100,000 goal</span>
              </div>
              <Link href="/fundraise" className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                Donate Now
              </Link>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg min-w-[280px]">
            <div className="h-40 bg-green-900 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <OnaguiSymbol size={120} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Reforestation Project</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-300 mb-4">
                <span>$22,500 raised</span>
                <span>$50,000 goal</span>
              </div>
              <Link href="/fundraise" className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">
                Donate Now
              </Link>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg min-w-[280px]">
            <div className="h-40 bg-purple-900 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <OnaguiSymbol size={120} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Education Scholarship</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-300 mb-4">
                <span>$30,000 raised</span>
                <span>$50,000 goal</span>
              </div>
              <Link href="/fundraise" className="block text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium">
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Row */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Trending Products</h2>
            <div className="flex space-x-2 items-center">
              <button 
                className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
                onClick={() => {
                  const container = document.getElementById('marketplace-scroll');
                  if (container) {
                    container.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button 
                className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700 transition-colors duration-300"
                onClick={() => {
                  const container = document.getElementById('marketplace-scroll');
                  if (container) {
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
          <div id="marketplace-scroll" className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
              <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
                <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
              <h3 className="font-medium text-white mb-1">Limited Edition T-Shirt</h3>
              <div className="flex justify-between text-sm text-gray-300">
                <span>$29.99</span>
                <span>⭐⭐⭐⭐⭐</span>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
              <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
                <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
              <h3 className="font-medium text-white mb-1">Gaming Mouse</h3>
              <div className="flex justify-between text-sm text-gray-300">
                <span>$59.99</span>
                <span>⭐⭐⭐⭐</span>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
              <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
                <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
              <h3 className="font-medium text-white mb-1">Wireless Headphones</h3>
              <div className="flex justify-between text-sm text-gray-300">
                <span>$129.99</span>
                <span>⭐⭐⭐⭐⭐</span>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors min-w-[280px]">
              <div className="aspect-w-16 aspect-h-9 bg-gray-600 rounded mb-3 flex items-center justify-center">
                <OnaguiSymbol size={80} primaryColor="#4c1d95" secondaryColor="#2e1065" />
              </div>
              <h3 className="font-medium text-white mb-1">Phone Case</h3>
              <div className="flex justify-between text-sm text-gray-300">
                <span>$19.99</span>
                <span>⭐⭐⭐⭐</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Onagui</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Building the future of web applications.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Documentation</Link></li>
              <li><Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Blog</Link></li>
              <li><Link href="/support" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Careers</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Onagui. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
