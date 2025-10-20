'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  DollarSign, 
  Gift, 
  Dice6, 
  TrendingUp, 
  Users, 
  Shield,
  Zap
} from 'lucide-react';

const features = [
  {
    name: 'Marketplace',
    description: 'Trade cryptocurrencies and digital assets securely',
    icon: ShoppingCart,
    href: '/marketplace',
    color: 'bg-blue-500'
  },
  {
    name: 'Fundraise',
    description: 'Launch and invest in innovative crypto projects',
    icon: DollarSign,
    href: '/fundraise',
    color: 'bg-green-500'
  },
  {
    name: 'Giveaways',
    description: 'Participate in community rewards and airdrops',
    icon: Gift,
    href: '/giveaways',
    color: 'bg-purple-500'
  },
  {
    name: 'Raffles',
    description: 'Join exciting crypto raffles and win prizes',
    icon: Dice6,
    href: '/raffles',
    color: 'bg-orange-500'
  }
];

const stats = [
  { name: 'Total Volume', value: '$2.4M', icon: TrendingUp },
  { name: 'Active Users', value: '12.5K', icon: Users },
  { name: 'Security Score', value: '99.9%', icon: Shield },
  { name: 'Transactions', value: '45.2K', icon: Zap }
];

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                ONAGUI
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate crypto platform for trading, fundraising, giveaways, and raffles. 
              Join thousands of users in the future of decentralized finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Trading
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Our Platform
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover all the features that make ONAGUI the best crypto platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.name}
              href={feature.href}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-8">
                <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join the ONAGUI community and start your crypto journey today
            </p>
            <Link
              href="/signup"
              className="inline-flex px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition-colors"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}