import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Giveaways() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>ONAGUI - Giveaways</title>
        <meta name="description" content="Discover exciting giveaways on ONAGUI" />
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
            <Link href="/giveaways" className="flex items-center text-white border-b-2 border-pink-500 pb-1">
              <span className="mr-1">🎟️</span> Giveaways
            </Link>
            <Link href="/raffles" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span className="mr-1">🎯</span> Raffles
            </Link>
            <Link href="/marketplace" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span className="mr-1">🛒</span> Marketplace
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-28 pb-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Latest Giveaways
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Enter community giveaways and win exclusive rewards. New drops weekly.
        </p>
      </header>

      {/* Giveaways Grid */}
      <main className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Creator Bundle',
              description: 'Mic, headphones, and audio interface for content creators.',
              cta: 'Enter Giveaway',
            },
            {
              title: 'Art Pack',
              description: 'Digital drawing tablet and pro brushes set.',
              cta: 'Enter Giveaway',
            },
            {
              title: 'Streamer Kit',
              description: 'HD webcam, ring light, and green screen.',
              cta: 'Enter Giveaway',
            },
          ].map((g, i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all"
            >
              <div className="h-40 bg-gradient-to-r from-purple-900 to-indigo-900" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{g.title}</h3>
                <p className="text-gray-400 mb-4">{g.description}</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-md transition-colors">
                  {g.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 md:mb-0">
              ONAGUI
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-500 text-sm">© 2025 ONAGUI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}