'use client';

import { useState } from 'react';
import Navigation from './Navigation';
import PageTitle from './PageTitle';

// Client component to handle interactivity
export default function MarketplaceClient() {
  return (
    <main className="min-h-screen bg-[#1f2937] text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <PageTitle className="text-3xl md:text-4xl" gradient={true}>
            Marketplace
          </PageTitle>
          <button className="flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            + create my fundraise
          </button>
        </div>
        
        {/* Onagui's Favorites Section */}
        <FeaturedProducts />
        
        {/* New Arrivals Section */}
        <NewArrivals />
        
        {/* Best Sellers Section */}
        <BestSellers />
      </div>
    </main>
  );
}

// Onagui's Favorites Section with horizontal scrolling
function FeaturedProducts() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('featured-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('featured-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const featuredProducts = [
    {
      id: 1,
      title: "Premium Gaming Headset",
      price: "$129.99",
      rating: "4.8",
      image: "🎧",
      seller: "Tech Gadgets Pro",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      id: 2,
      title: "Mechanical Gaming Keyboard",
      price: "$89.99",
      rating: "4.7",
      image: "⌨️",
      seller: "Gaming Essentials",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      id: 3,
      title: "Ultra HD Gaming Monitor",
      price: "$349.99",
      rating: "4.9",
      image: "🖥️",
      seller: "Display Masters",
      gradient: "from-green-600 to-teal-600"
    },
    {
      id: 4,
      title: "Ergonomic Gaming Chair",
      price: "$199.99",
      rating: "4.6",
      image: "🪑",
      seller: "Comfort Gaming",
      gradient: "from-red-600 to-orange-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          Onagui&apos;s Favorites
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2">
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
        )}
      </div>
      
      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={{
                ...product,
                rating: parseFloat(product.rating) // Convert string rating to number
              }} 
              index={index} 
            />
          ))}
        </div>
      ) : (
        <div 
          id="featured-scroll"
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                rating: parseFloat(product.rating) // Convert string rating to number
              }}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// New Arrivals Section
function NewArrivals() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('new-arrivals-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('new-arrivals-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const newProducts = [
    {
      id: 1,
      title: "Wireless Gaming Mouse",
      price: "$59.99",
      rating: "4.5",
      image: "🖱️",
      seller: "Gaming Accessories",
      gradient: "from-pink-600 to-purple-600"
    },
    {
      id: 2,
      title: "RGB Gaming Mouse Pad",
      price: "$29.99",
      rating: "4.4",
      image: "📋",
      seller: "RGB Essentials",
      gradient: "from-indigo-600 to-blue-600"
    },
    {
      id: 3,
      title: "Gaming Controller Pro",
      price: "$69.99",
      rating: "4.7",
      image: "🎮",
      seller: "Controller Kings",
      gradient: "from-yellow-600 to-amber-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          New Arrivals
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2">
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
        )}
      </div>
      
      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {newProducts.map((product, index) => (
             <ProductCard
                key={product.id}
                product={{
                  ...product,
                  rating: parseFloat(product.rating) // Convert string rating to number
                }}
                index={index}
              />
           ))}
        </div>
      ) : (
        <div 
          id="new-arrivals-scroll"
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {newProducts.map((product, index) => (
             <ProductCard
                key={product.id}
                product={{
                  ...product,
                  rating: parseFloat(product.rating) // Convert string rating to number
                }}
                index={index}
              />
           ))}
        </div>
      )}
    </section>
  );
}

// Best Sellers Section
function BestSellers() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('best-sellers-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('best-sellers-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const bestSellers = [
    {
      id: 1,
      title: "Gaming PC Bundle",
      price: "$1,299.99",
      rating: "4.9",
      image: "💻",
      seller: "Ultimate Gaming",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 2,
      title: "Streaming Microphone",
      price: "$79.99",
      rating: "4.8",
      image: "🎙️",
      seller: "Audio Pro",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      id: 3,
      title: "Gaming Desk",
      price: "$149.99",
      rating: "4.7",
      image: "🪟",
      seller: "Furniture Gaming",
      gradient: "from-green-600 to-emerald-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          Best Sellers
          <span className="ml-2 text-sm">{expanded ? '▼' : '▶'}</span>
        </button>
        
        {!expanded && (
          <div className="flex space-x-2">
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
        )}
      </div>
      
      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bestSellers.map((product, index) => (
             <ProductCard 
               key={product.id} 
               product={{
                 ...product,
                 rating: parseFloat(product.rating) // Convert string rating to number
               }} 
               index={index} 
             />
           ))}
        </div>
      ) : (
        <div 
          id="best-sellers-scroll"
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bestSellers.map((product, index) => (
             <ProductCard 
               key={product.id} 
               product={{
                 ...product,
                 rating: parseFloat(product.rating) // Convert string rating to number
               }} 
               index={index} 
             />
           ))}
        </div>
      )}
    </section>
  );
}

// Product Card Component
interface Product {
  id: number;
  title: string;
  price: string;
  image: string;
  seller: string;
  rating: number;
  gradient: string;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <div 
      className={`flex-shrink-0 w-full sm:w-80 bg-gradient-to-br ${product.gradient} p-0.5 rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="bg-[#1a0033] h-full rounded-lg overflow-hidden p-4">
        <div className="flex items-center mb-3">
          <div className="text-4xl mr-3">{product.image}</div>
          <div>
            <h3 className="font-bold text-lg">{product.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{product.seller}</p>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">{product.price}</span>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{product.rating}</span>
            </div>
          </div>
        </div>
        
        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-300 font-medium">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
