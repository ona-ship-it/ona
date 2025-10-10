import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Giveaways() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>ONAGUI - Giveaways</title>
        <meta name="description" content="Explore and enter exciting giveaways on ONAGUI" />
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
              <span className="mr-1">🛍️</span> Marketplace
            </Link>
          </div>
        </div>
        <div className="hidden md:flex space-x-4">
          <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all">Sign In</Link>
        </div>
      </nav>

      {/* Page Content */}
      <main className="container mx-auto px-6 pt-28">
        <section className="mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Giveaways</h1>
          <p className="text-gray-300">Discover and participate in giveaways to win exciting prizes.</p>
        </section>

        {/* Placeholder content to be replaced with dynamic giveaways later */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white bg-opacity-10 rounded-xl p-6 shadow-xl border border-white border-opacity-20">
            <h2 className="text-2xl font-bold mb-2 text-white">Sample Giveaway</h2>
            <p className="text-white opacity-80">Stay tuned for live giveaways. This is a placeholder.</p>
            <button className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all">
              Learn More
            </button>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-6 shadow-xl border border-white border-opacity-20">
            <h2 className="text-2xl font-bold mb-2 text-white">Featured Giveaway</h2>
            <p className="text-white opacity-80">Check back soon for featured giveaways.</p>
            <button className="mt-4 bg-white text-pink-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all">
              Explore
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}