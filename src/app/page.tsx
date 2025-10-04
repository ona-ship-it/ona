"use client";

import Image from 'next/image';
import Link from "next/link";
import Navigation from '../components/Navigation';
import SideNavbar from '../components/SideNavbar';
import PageTitle from '@/components/PageTitle';
import FeaturedSection from '@/components/FeaturedSection';
import GoogleSignIn from '@/components/GoogleSignIn';

import { useTheme } from '@/components/ThemeContext';

export default function Home() {
  const { isDarker, isWhite } = useTheme();
  
  return (
    <main className={`min-h-screen ${isWhite ? 'bg-gray-50 text-gray-900' : 'bg-gradient-to-b from-[#1f2937] to-[#000000] text-white'}`}>
      <Navigation />
      <SideNavbar />
      <GoogleSignIn />
      
      {/* Main content with padding for side navbar */}
      <div className="pl-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-green-500 opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-blue-500 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 rounded-full bg-cyan-500 opacity-30 animate-pulse"></div>
        <div className="absolute top-60 left-1/3 w-3 h-3 rounded-full bg-purple-500 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-40 right-1/4 w-3 h-3 rounded-full bg-green-500 opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex justify-end mb-2">
            <Link href="/wallet" className="flex items-center rounded-full bg-green-500 hover:bg-green-600 px-3 py-1 text-xs font-medium text-white transition-all duration-300">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Wallet / Deposit <span className="ml-1 font-bold">$0.00</span>
            </Link>
          </div>
          <div className="text-center">
            <PageTitle className="text-3xl md:text-4xl mb-2" gradient={false}>
            ON<span style={{ display: 'inline-block', transform: 'rotate(180deg) scaleX(-1)', verticalAlign: 'baseline' }}>V</span>GUI
          </PageTitle>
            <p className="text-sm md:text-base text-white mb-3">
              Statistically Onagui Is Your Best Chance To Win
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 relative">
              <div className="group">
                <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-4 text-sm rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 flex items-center justify-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Create
                </button>
                
                {/* Hover Cards Container */}
                <div className="fixed z-[9999] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] grid grid-cols-2 gap-4">
                  {/* Giveaways Card */}
                  <Link href="/giveaways" className="bg-gradient-to-br from-green-500/60 to-green-700/60 backdrop-blur-md p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-green-400/30">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🎁</span>
                      <h3 className="text-white font-bold">Giveaways</h3>
                    </div>
                    <p className="text-white/90 text-sm">Create exciting giveaways with customizable entry methods and automated winner selection.</p>
                  </Link>
                  
                  {/* Fundraise Card */}
                  <Link href="/fundraise" className="bg-gradient-to-br from-purple-500/60 to-purple-700/60 backdrop-blur-md p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-onaguiGreen-light/30">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🎯</span>
                      <h3 className="text-white font-bold">Fundraise</h3>
                    </div>
                    <p className="text-white/90 text-sm">Launch fundraising campaigns with goals, progress tracking, and supporter recognition.</p>
                  </Link>
                  
                  {/* Raffles Card */}
                  <Link href="/raffles" className="bg-gradient-to-br from-blue-500/60 to-blue-700/60 backdrop-blur-md p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-blue-400/30">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🎟️</span>
                      <h3 className="text-white font-bold">Raffles</h3>
                    </div>
                    <p className="text-white/90 text-sm">Set up raffles with ticket sales, prize tiers, and transparent drawing mechanisms.</p>
                  </Link>
                  
                  {/* Marketplace Card */}
                  <Link href="/marketplace" className="bg-gradient-to-br from-amber-500/60 to-amber-700/60 backdrop-blur-md p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-amber-400/30">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🛒</span>
                      <h3 className="text-white font-bold">Marketplace</h3>
                    </div>
                    <p className="text-white/90 text-sm">Sell digital or physical products with secure payments and delivery tracking.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Sections from all pages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Giveaways Section */}
        <FeaturedSection 
          title="Featured Giveaways"
          linkTo="/giveaways"
          items={[
            {
              title: "Gaming PC Bundle",
              creator: "TechGamer",
              description: "Win a high-end gaming PC with accessories worth $3,000.",
              progress: 75,
              entries: "750K",
              timeLeft: "3 days left",
              color: "purple"
            },
            {
              title: "Luxury Vacation",
              creator: "TravelInfluencer",
              description: "Win a 7-day all-inclusive resort stay for two.",
              progress: 60,
              entries: "450K",
              timeLeft: "5 days left",
              color: "pink"
            },
            {
              title: "iPhone 15 Pro",
              creator: "TechReviewer",
              description: "Latest iPhone model with 1TB storage and accessories.",
              progress: 85,
              entries: "1.2M",
              timeLeft: "1 day left",
              color: "blue"
            },
            {
              title: "Crypto Giveaway",
              creator: "CryptoExpert",
              description: "Win $5,000 in Bitcoin, Ethereum, and other cryptocurrencies.",
              progress: 45,
              entries: "320K",
              timeLeft: "7 days left",
              color: "green"
            }
          ]}
        />
        
        {/* Raffles Section */}
        <FeaturedSection 
          title="Hot Raffles"
          linkTo="/raffles"
          items={[
            {
              title: "Rare Collectible",
              creator: "CollectiblesHub",
              description: "Limited edition signed collectible, only 100 made worldwide.",
              progress: 80,
              entries: "12K",
              timeLeft: "2 days left",
              color: "indigo"
            },
            {
              title: "Gaming Console",
              creator: "GamersUnite",
              description: "Next-gen console with 5 games and extra controller.",
              progress: 65,
              entries: "45K",
              timeLeft: "4 days left",
              color: "blue"
            },
            {
              title: "Designer Handbag",
              creator: "FashionInsider",
              description: "Authentic luxury designer handbag from latest collection.",
              progress: 90,
              entries: "32K",
              timeLeft: "12 hours left",
              color: "pink"
            },
            {
              title: "Smart Home Bundle",
              creator: "TechHome",
              description: "Complete smart home setup with speakers, displays, and more.",
              progress: 50,
              entries: "18K",
              timeLeft: "6 days left",
              color: "cyan"
            }
          ]}
        />
        
        {/* Fundraise Section */}
        <FeaturedSection 
          title="Active Fundraisers"
          linkTo="/fundraise"
          items={[
            {
              title: "Animal Shelter",
              creator: "PetRescue",
              description: "Help us build a new shelter for abandoned pets in our community.",
              progress: 70,
              entries: "$35K raised",
              timeLeft: "15 days left",
              color: "amber"
            },
            {
              title: "Clean Water Project",
              creator: "EarthHelpers",
              description: "Bringing clean water to communities in developing regions.",
              progress: 45,
              entries: "$22K raised",
              timeLeft: "30 days left",
              color: "blue"
            },
            {
              title: "Education Fund",
              creator: "LearnForAll",
              description: "Providing scholarships for underprivileged students.",
              progress: 60,
              entries: "$45K raised",
              timeLeft: "20 days left",
              color: "green"
            },
            {
              title: "Medical Research",
              creator: "HealthFoundation",
              description: "Supporting breakthrough research for rare diseases.",
              progress: 85,
              entries: "$120K raised",
              timeLeft: "10 days left",
              color: "red"
            }
          ]}
        />
        
        {/* Marketplace Section */}
        <FeaturedSection 
          title="Marketplace Highlights"
          linkTo="/marketplace"
          items={[
            {
              title: "Digital Art Collection",
              creator: "DigitalArtist",
              description: "Limited edition digital art pieces with certificate of authenticity.",
              progress: 40,
              entries: "8 items",
              timeLeft: "Trending",
              color: "violet"
            },
            {
              title: "Vintage Collectibles",
              creator: "RetroCollector",
              description: "Rare vintage items from the 70s and 80s in mint condition.",
              progress: 65,
              entries: "12 items",
              timeLeft: "Popular",
              color: "amber"
            },
            {
              title: "Handcrafted Jewelry",
              creator: "ArtisanCrafter",
              description: "One-of-a-kind handmade jewelry pieces using sustainable materials.",
              progress: 75,
              entries: "15 items",
              timeLeft: "New",
              color: "rose"
            },
            {
              title: "Limited Sneakers",
              creator: "SneakerHead",
              description: "Exclusive limited edition sneakers from top designers.",
              progress: 90,
              entries: "5 items",
              timeLeft: "Almost gone",
              color: "blue"
            }
          ]}
        />
      </section>
      </div>
      
      {/* Simple Footer */}
      <footer className={`${isWhite ? 'bg-gray-50 text-gray-600' : 'bg-gray-900 text-gray-400'} py-12 px-4 sm:px-6 lg:px-8 pl-16`}>
        <div className="max-w-7xl mx-auto text-center">
          <p>© {new Date().getFullYear()} Onagui. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

