'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Users, Gift, Trophy, Store, Wallet, Target } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  const features = [
    {
      name: 'Giveaways',
      description: 'Create and participate in exciting giveaways',
      icon: Gift,
      href: '/giveaways',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Raffles',
      description: 'Enter daily raffles and win big prizes',
      icon: Trophy,
      href: '/raffles',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Marketplace',
      description: 'Buy and sell items with other players',
      icon: Store,
      href: '/marketplace',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Fundraise',
      description: 'Support projects and campaigns',
      icon: Target,
      href: '/fundraise',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Wallet',
      description: 'Manage your balance and transactions',
      icon: Wallet,
      href: '/wallet',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Community',
      description: 'Connect with other players',
      icon: Users,
      href: '/profile',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ONAGUI
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/giveaways" className="text-gray-300 hover:text-white transition-colors">
                Giveaways
              </Link>
              <Link href="/raffles" className="text-gray-300 hover:text-white transition-colors">
                Raffles
              </Link>
              <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/fundraise" className="text-gray-300 hover:text-white transition-colors">
                Fundraise
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {!loading && (
                <>
                  {user ? (
                    <Link 
                      href="/wallet"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Wallet
                    </Link>
                  ) : (
                    <Link 
                      href="/login"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <h1 className="text-7xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              ONAGUI
            </span>
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate gaming platform for giveaways, raffles, and community
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link 
                href="/giveaways"
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Explore Now
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative overflow-hidden rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className={`inline-block p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 text-center py-20 border-y border-gray-800">
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
            <div className="text-gray-400">Active Players</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">$500K+</div>
            <div className="text-gray-400">Prizes Distributed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
            <div className="text-gray-400">Live Events</div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Join?</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of players winning prizes every day
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <Link 
                href="/wallet"
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                View Wallet
              </Link>
              <Link 
                href="/profile"
                className="border border-gray-600 px-8 py-3 rounded-lg font-bold hover:border-gray-400 transition-colors"
              >
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/login"
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="border border-gray-600 px-8 py-3 rounded-lg font-bold hover:border-gray-400 transition-colors"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/giveaways" className="hover:text-white transition-colors">Giveaways</Link></li>
                <li><Link href="/raffles" className="hover:text-white transition-colors">Raffles</Link></li>
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/profile" className="hover:text-white transition-colors">Profiles</Link></li>
                <li><Link href="/fundraise" className="hover:text-white transition-colors">Fundraise</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/wallet" className="hover:text-white transition-colors">Wallet</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">Profile Settings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 pt-8 text-center text-gray-400">
            <p>© 2026 ONAGUI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
