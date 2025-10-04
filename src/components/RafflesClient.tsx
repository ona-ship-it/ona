'use client';

import { useState } from 'react';
import Navigation from './Navigation';
import PageTitle from './PageTitle';

export default function RafflesClient() {
  return (
    <main className="min-h-screen bg-[#1a0033] text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <PageTitle className="text-3xl md:text-4xl" gradient={true}>
            Active Raffles
          </PageTitle>
          <button className="flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            + create my ruffle
          </button>
        </div>
        
        {/* Most Popular Raffles Section */}
        <MostPopularRaffles />
        
        {/* Weekly Raffles Section */}
        <WeeklyRaffles />
        
        {/* Limited Time Raffles Section */}
        <LimitedTimeRaffles />
        
        {/* New Raffles Section */}
        <NewRaffles />
      </div>
    </main>
  );
}

// Most Popular Raffles Section with horizontal scrolling
function MostPopularRaffles() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('popular-raffles-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('popular-raffles-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const popularRaffles = [
    {
      id: 1,
      title: "Weekly Cash Raffle",
      prize: "$500",
      entries: "45K",
      image: "💰",
      organizer: "Onagui",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      id: 2,
      title: "Gaming PC Bundle",
      prize: "$2,000",
      entries: "78K",
      image: "🖥️",
      organizer: "TechRaffle",
      gradient: "from-red-600 to-pink-600"
    },
    {
      id: 3,
      title: "Luxury Vacation Package",
      prize: "$5,000",
      entries: "32K",
      image: "✈️",
      organizer: "TravelWin",
      gradient: "from-green-600 to-teal-600"
    },
    {
      id: 4,
      title: "Apple Product Bundle",
      prize: "$3,000",
      entries: "65K",
      image: "📱",
      organizer: "TechDraw",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 5,
      title: "Crypto Giveaway",
      prize: "2 ETH",
      entries: "28K",
      image: "🪙",
      organizer: "CryptoWin",
      gradient: "from-yellow-600 to-orange-600"
    }
  ];

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">VIP Raffles</h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={scrollLeft}
            className="text-white bg-gray-800 hover:bg-gray-700 p-1 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={scrollRight}
            className="text-white bg-gray-800 hover:bg-gray-700 p-1 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        id="popular-raffles-scroll"
        className="flex overflow-x-auto space-x-6 pb-6 pt-2 px-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {popularRaffles.map((raffle, index) => {
  return (
    <RaffleCard 
      key={raffle.id} 
      raffle={raffle} 
      index={index} 
    />
  );
})}
      </div>
    </div>
  );
}

// Raffle Card Component
interface Raffle {
  id: number;
  title: string;
  price: string;
  entries: string;
  image: string;
  timeLeft: string;
  gradient: string;
  organizer: string;
  prize: string;
}

interface RaffleCardProps {
  raffle: Raffle;
  index: number;
}

function RaffleCard({ raffle, index }: RaffleCardProps) {
  return (
    <div 
      className="flex-shrink-0 w-72 bg-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 mb-2 mx-1"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-40 bg-gradient-to-r ${raffle.gradient} flex items-center justify-center`}>
        <span className="text-6xl">{raffle.image}</span>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-purple-900 text-purple-100 text-xs px-2 py-1 rounded-full">
            {raffle.organizer}
          </span>
          <span className="text-gray-300 text-sm">{raffle.entries} entries</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{raffle.title}</h3>
        <p className="text-gray-300 mb-3">Prize: <span className="text-purple-400 font-semibold">{raffle.prize}</span></p>
      </div>
    </div>
  );
}

// Weekly Raffles Section
function WeeklyRaffles() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('weekly-raffles-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('weekly-raffles-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const weeklyRaffles = [
    {
      id: 1,
      title: "Monday Cash Draw",
      prize: "$100",
      entries: "12K",
      image: "💵",
      organizer: "WeeklyWin",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      id: 2,
      title: "Wednesday Electronics",
      prize: "Headphones",
      entries: "8K",
      image: "🎧",
      organizer: "TechWeek",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 3,
      title: "Friday Gift Card",
      prize: "$50 Amazon",
      entries: "15K",
      image: "🎁",
      organizer: "GiftRaffle",
      gradient: "from-red-600 to-orange-600"
    },
    {
      id: 4,
      title: "Weekend Surprise",
      prize: "Mystery Box",
      entries: "7K",
      image: "🎲",
      organizer: "SurpriseWin",
      gradient: "from-purple-600 to-pink-600"
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Weekly Raffles</h2>
        
        <div className="flex space-x-2 items-center">
          <button 
            onClick={scrollLeft}
            className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        id="weekly-raffles-scroll"
        className="flex overflow-x-auto space-x-8 pb-8 pt-4 px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {weeklyRaffles.map((raffle, index) => {
  return (
    <RaffleCard 
      key={raffle.id} 
      raffle={raffle} 
      index={index} 
    />
  );
})}
      </div>
    </section>
  );
}

// Limited Time Raffles Section
function LimitedTimeRaffles() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('limited-raffles-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('limited-raffles-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const limitedRaffles = [
    {
      id: 1,
      title: "24-Hour Flash Raffle",
      prize: "$250",
      entries: "5K",
      image: "⚡",
      organizer: "FlashWin",
      gradient: "from-yellow-600 to-amber-600"
    },
    {
      id: 2,
      title: "Weekend Special",
      prize: "Gaming Console",
      entries: "18K",
      image: "🎮",
      organizer: "GameRaffle",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      id: 3,
      title: "Holiday Exclusive",
      prize: "$1,000",
      entries: "22K",
      image: "🎄",
      organizer: "HolidayWin",
      gradient: "from-red-600 to-rose-600"
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Limited Time Raffles</h2>
        
        <div className="flex space-x-2 items-center">
          <button 
            onClick={scrollLeft}
            className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        id="limited-raffles-scroll"
        className="flex overflow-x-auto space-x-6 pb-6 pt-2 px-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {limitedRaffles.map((raffle, index) => (
          <RaffleCard 
  key={raffle.id} 
  raffle={raffle} 
  index={index} 
/>
        ))}
      </div>
    </section>
  );
}

// New Raffles Section
function NewRaffles() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('new-raffles-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('new-raffles-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const newRaffles = [
    {
      id: 1,
      title: "Just Added: Tech Bundle",
      prize: "Smart Home Kit",
      entries: "3K",
      image: "🏠",
      organizer: "SmartRaffle",
      gradient: "from-indigo-600 to-violet-600"
    },
    {
      id: 2,
      title: "New: Luxury Watch",
      prize: "Designer Watch",
      entries: "4K",
      image: "⌚",
      organizer: "LuxuryWin",
      gradient: "from-amber-600 to-yellow-600"
    },
    {
      id: 3,
      title: "Fresh: Fitness Package",
      prize: "Home Gym",
      entries: "2K",
      image: "💪",
      organizer: "FitRaffle",
      gradient: "from-emerald-600 to-green-600"
    },
    {
      id: 4,
      title: "New: Travel Voucher",
      prize: "$1,000 Travel",
      entries: "6K",
      image: "🌴",
      organizer: "TravelRaffle",
      gradient: "from-sky-600 to-blue-600"
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">New Raffles</h2>
        
        <div className="flex space-x-2 items-center">
          <button 
            onClick={scrollLeft}
            className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 rounded-full bg-purple-800/50 hover:bg-onaguiGreen-dark transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        id="new-raffles-scroll"
        className="flex overflow-x-auto space-x-8 pb-8 pt-4 px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {newRaffles.map((raffle, index) => {
  return (
    <RaffleCard 
      key={raffle.id} 
      raffle={raffle} 
      index={index} 
    />
  );
})}
      </div>
    </section>
  );
}
