"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-black/98 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Onagui
              </Link>
            </div>
            
            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/campaigns"
                className="flex items-center gap-2 text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Fundraise
              </Link>
              <Link
                href="/giveaways"
                className="flex items-center gap-2 text-gray-300 hover:text-orange-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Giveaways
              </Link>
              <Link
                href="/raffles"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Raffles
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Marketplace
              </Link>
            </div>

            {/* Search and Auth */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative group">
                <div className="flex items-center">
                  <div className="absolute left-3 z-10 text-gray-400 group-hover:text-purple-400 transition-colors duration-300">
                    🔍
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-10 h-10 group-hover:w-64 bg-gray-800/50 border border-gray-600 rounded-full group-hover:rounded-lg pl-10 pr-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:w-64 focus:rounded-lg transition-all duration-300 ease-in-out backdrop-blur-sm"
                  />
                </div>
              </div>
              <button 
                onClick={() => setShowSignUpModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Main Logo/Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-wider leading-tight py-2">
              Onagui
            </h1>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <p className="text-xl md:text-2xl text-cyan-400 font-semibold tracking-wide">
              Statistically Onagui Is Your Best Chance To Win
            </p>
          </div>

          {/* Start Playing Button */}
          <div className="mb-20">
            <Link
              href="/giveaways"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl transform hover:scale-105"
            >
              Start Playing
            </Link>
          </div>

          {/* Stats or Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="text-2xl font-bold text-purple-400 mb-1">$50K+</div>
              <div className="text-gray-400">Total Prizes Won</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">10K+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-1">95%</div>
              <div className="text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>
      </main>

      {/* Activer Windows */}
      <div className="fixed bottom-4 right-4 text-gray-400 text-sm">
        Activer Windows
      </div>

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 rounded-2xl border border-purple-500/30 max-w-md w-full relative">
            {/* Close Button */}
            <button 
              onClick={() => setShowSignUpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Join Onagui
              </h2>
              <p className="text-cyan-400">Start your winning journey today</p>
            </div>

            {/* Sign Up Form */}
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input 
                  type="email"
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input 
                  type="password"
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input 
                  type="password"
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-purple-500 bg-black/30 border-purple-500/30 rounded focus:ring-purple-400"
                />
                <label className="text-sm text-gray-300">
                  I agree to the <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Terms of Service</span> and <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
              >
                🎮 Create Account
              </button>

              {/* Social Login */}
              <div className="text-center">
                <p className="text-gray-400 mb-4">Or sign up with</p>
                <div className="flex gap-4 justify-center">
                  <button className="bg-black/30 border border-purple-500/30 p-3 rounded-lg hover:border-purple-400 transition-colors">
                    <span className="text-xl">🎮</span>
                  </button>
                  <button className="bg-black/30 border border-purple-500/30 p-3 rounded-lg hover:border-purple-400 transition-colors">
                    <span className="text-xl">📧</span>
                  </button>
                  <button className="bg-black/30 border border-purple-500/30 p-3 rounded-lg hover:border-purple-400 transition-colors">
                    <span className="text-xl">🔗</span>
                  </button>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-gray-400">
                  Already have an account? <span className="text-purple-400 hover:text-purple-300 cursor-pointer font-semibold">Sign In</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
