'use client';

import React from 'react';
import Link from 'next/link';

// Featured content component that shows the first row from each main page
export default function FeaturedContent() {
  // Sample data from each page (first row)
  const featuredRaffles = [
    {
      id: 1,
      title: "Weekly Jackpot",
      price: "$500",
      image: "🎮",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 2,
      title: "Tech Bundle",
      price: "$250",
      image: "💻",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      id: 3,
      title: "Gaming Console",
      price: "$350",
      image: "🎮",
      gradient: "from-green-600 to-emerald-600"
    }
  ];

  const featuredFundraise = [
    {
      id: 1,
      title: "Community Garden",
      goal: "$5,000",
      raised: "$3,200",
      image: "🌱",
      gradient: "from-green-600 to-teal-600"
    },
    {
      id: 2,
      title: "Education Fund",
      goal: "$10,000",
      raised: "$7,500",
      image: "📚",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      id: 3,
      title: "Animal Shelter",
      goal: "$8,000",
      raised: "$4,200",
      image: "🐾",
      gradient: "from-orange-600 to-amber-600"
    }
  ];

  const featuredMarketplace = [
    {
      id: 1,
      title: "Premium Headphones",
      price: "$199.99",
      rating: "4.9",
      image: "🎧",
      seller: "Audio Pro",
      gradient: "from-purple-600 to-indigo-600"
    },
    {
      id: 2,
      title: "Smart Watch",
      price: "$149.99",
      rating: "4.7",
      image: "⌚",
      seller: "Tech Gear",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      id: 3,
      title: "Wireless Earbuds",
      price: "$89.99",
      rating: "4.8",
      image: "🎧",
      seller: "Sound Wave",
      gradient: "from-green-600 to-teal-600"
    }
  ];

  const featuredGiveaways = [
    {
      id: 1,
      title: "Gaming PC",
      entries: "2,500",
      endDate: "3 days left",
      image: "💻",
      gradient: "from-red-600 to-orange-600"
    },
    {
      id: 2,
      title: "iPhone 15 Pro",
      entries: "5,200",
      endDate: "5 days left",
      image: "📱",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 3,
      title: "VR Headset",
      entries: "1,800",
      endDate: "2 days left",
      image: "🥽",
      gradient: "from-purple-600 to-pink-600"
    }
  ];

  // Generic card component for displaying items
  const Card = ({ item, type }) => {
    let details;
    let link;

    switch (type) {
      case 'raffle':
        details = <p className="text-gray-300">Price: {item.price}</p>;
        link = '/raffles';
        break;
      case 'fundraise':
        details = (
          <div>
            <p className="text-gray-300">Goal: {item.goal}</p>
            <p className="text-green-400">Raised: {item.raised}</p>
          </div>
        );
        link = '/fundraise';
        break;
      case 'marketplace':
        details = (
          <div>
            <p className="text-gray-300">Price: {item.price}</p>
            <p className="text-gray-300">Seller: {item.seller}</p>
          </div>
        );
        link = '/marketplace';
        break;
      case 'giveaway':
        details = (
          <div>
            <p className="text-gray-300">Entries: {item.entries}</p>
            <p className="text-yellow-400">{item.endDate}</p>
          </div>
        );
        link = '/giveaways';
        break;
      default:
        details = null;
        link = '/';
    }

    return (
      <div className={`bg-gradient-to-br ${item.gradient} p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full`}>
        <div className="text-4xl mb-2">{item.image}</div>
        <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
        {details}
        <div className="mt-auto pt-2">
          <Link href={link} className="text-white hover:text-gray-200 text-sm underline">
            View more
          </Link>
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">Featured Content</h2>
      
      <div className="space-y-12">
        {/* Raffles */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">Raffles</h3>
            <Link href="/raffles" className="text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredRaffles.map(raffle => (
              <Card key={raffle.id} item={raffle} type="raffle" />
            ))}
          </div>
        </div>
        
        {/* Fundraise */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">Fundraise</h3>
            <Link href="/fundraise" className="text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredFundraise.map(fundraise => (
              <Card key={fundraise.id} item={fundraise} type="fundraise" />
            ))}
          </div>
        </div>
        
        {/* Marketplace */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">Marketplace</h3>
            <Link href="/marketplace" className="text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredMarketplace.map(product => (
              <Card key={product.id} item={product} type="marketplace" />
            ))}
          </div>
        </div>
        
        {/* Giveaways */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">Giveaways</h3>
            <Link href="/giveaways" className="text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredGiveaways.map(giveaway => (
              <Card key={giveaway.id} item={giveaway} type="giveaway" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}