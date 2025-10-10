import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>ONAGUI - Digital Fundraising Platform</title>
        <meta name="description" content="Create, discover, and participate in fundraisers, giveaways, and raffles" />
      </Head>
      {/* Navigation Bar */}
      <nav className="bg-black bg-opacity-90 py-4 px-6 flex justify-between items-center border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            ONAGUI
          </Link>
          <div className="ml-10 hidden md:flex space-x-8">
            <Link href="/fundraise" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span className="mr-1">🎁</span> Fundraise
            </Link>
            <Link href="/giveaways" className="flex items-center text-gray-300 hover:text-white transition-colors">
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
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">ONAGUI</div>
              <p className="text-gray-400 max-w-md">The future of fundraising, giveaways, and digital marketplace all in one platform.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><Link href="/fundraise" className="text-gray-400 hover:text-white transition-colors">Fundraise</Link></li>
                  <li><Link href="/giveaways" className="text-gray-400 hover:text-white transition-colors">Giveaways</Link></li>
                  <li><Link href="/raffles" className="text-gray-400 hover:text-white transition-colors">Raffles</Link></li>
                  <li><Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Marketplace</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">© 2023 ONAGUI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}