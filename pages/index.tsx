import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  // Use client-side rendering for navigation links
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div>
      <Head>
        <title>ONAGUI - Your Best Chance To Win</title>
        <meta name="description" content="Statistically ONAGUI Is Your Best Chance To Win" />
      </Head>
      
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="logo">ONAGUI</div>
          <div className="nav-links">
            {isClient ? (
              <>
                <Link href="#" className="nav-link">
                  <span>🎁</span> Fundraise
                </Link>
                <Link href="#" className="nav-link">
                  <span>🎉</span> Giveaways
                </Link>
                <Link href="#" className="nav-link">
                  <span>🎯</span> Raffles
                </Link>
                <Link href="#" className="nav-link">
                  <span>🛒</span> Marketplace
                </Link>
              </>
            ) : (
              <>
                <a className="nav-link"><span>🎁</span> Fundraise</a>
                <a className="nav-link"><span>🎉</span> Giveaways</a>
                <a className="nav-link"><span>🎯</span> Raffles</a>
                <a className="nav-link"><span>🛒</span> Marketplace</a>
              </>
            )}
          </div>
          {isClient ? (
            <Link href="#" className="cta-button">
              Create
            </Link>
          ) : (
            <a className="cta-button">Create</a>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-dot hero-dot-1"></div>
          <div className="hero-dot hero-dot-2"></div>
          <div className="hero-dot hero-dot-3"></div>
        </div>
        
        <div className="container">
          <h1 className="hero-logo">ONAGUI</h1>
          <p className="hero-tagline">Statistically Onagui Is Your Best Chance To Win</p>
          {isClient ? (
            <Link href="#" className="cta-button">
              <span>▶</span> Start Playing
            </Link>
          ) : (
            <a className="cta-button"><span>▶</span> Start Playing</a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            {isClient ? (
              <>
                <Link href="#" className="footer-link">About</Link>
                <Link href="#" className="footer-link">Terms</Link>
                <Link href="#" className="footer-link">Privacy</Link>
                <Link href="#" className="footer-link">Contact</Link>
              </>
            ) : (
              <>
                <a className="footer-link">About</a>
                <a className="footer-link">Terms</a>
                <a className="footer-link">Privacy</a>
                <a className="footer-link">Contact</a>
              </>
            )}
          </div>
          <p className="footer-text">© 2023 ONAGUI. All rights reserved.</p>
        </div>
      </footer>

      {/* Marketplace Preview */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Discover Our Marketplace</h2>
            <p className="text-gray-400">
              Browse and purchase unique digital items from creators around the world.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-40 bg-gradient-to-br from-indigo-900 to-purple-900"></div>
                <div className="p-4">
                  <h3 className="text-sm font-medium truncate">Digital Item #{item}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-purple-400">${10 * item}.00</span>
                    <button className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            {isClient ? (
              <Link href="/marketplace" className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                Explore Marketplace
              </Link>
            ) : (
              <a className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                Explore Marketplace
              </a>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-purple-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of creators and participants on the ONAGUI platform today.
          </p>
          <button className="bg-white text-purple-900 font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-gray-100">
            Create Your Account
          </button>
        </div>
      </section>
    </div>
  );
}