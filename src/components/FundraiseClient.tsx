'use client';

import { useState } from 'react';
import Navigation from './Navigation';
import PageTitle from './PageTitle';

// Client component to handle interactivity
export default function FundraiseClient() {
  return (
    <main className="min-h-screen bg-[#1f2937] text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <PageTitle className="text-3xl md:text-4xl" gradient={true}>
            Fundraise
          </PageTitle>
          <button className="flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            + create my fundraise
          </button>
        </div>
        
        {/* Featured Fundraise Section */}
        <FeaturedFundraise />
        
        {/* Charity Fundraise Section */}
        <CharityFundraise />
        
        {/* Community Projects Section */}
        <CommunityProjects />
      </div>
    </main>
  );
}

// Featured Fundraise Section with horizontal scrolling
function FeaturedFundraise() {
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
  
  const featuredFundraise = [
    {
      id: 1,
      title: "Clean Ocean Initiative",
      goal: "$50,000",
      raised: "$32,450",
      image: "🌊",
      organizer: "Ocean Cleanup Foundation",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      id: 2,
      title: "Reforestation Project",
      goal: "$25,000",
      raised: "$18,750",
      image: "🌳",
      organizer: "Green Earth Alliance",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      id: 3,
      title: "Education for All",
      goal: "$100,000",
      raised: "$67,890",
      image: "📚",
      organizer: "Global Education Fund",
      gradient: "from-yellow-600 to-amber-600"
    },
    {
      id: 4,
      title: "Medical Relief Fund",
      goal: "$75,000",
      raised: "$42,300",
      image: "🏥",
      organizer: "Healthcare Without Borders",
      gradient: "from-red-600 to-pink-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          Featured Fundraise
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
          {featuredFundraise.map((fundraise, index) => (
            <FundraiseCard key={fundraise.id} fundraise={fundraise} index={index} />
          ))}
        </div>
      ) : (
        <div 
          id="featured-scroll"
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredFundraise.map((fundraise, index) => (
            <FundraiseCard key={fundraise.id} fundraise={fundraise} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

// Charity Fundraise Section
function CharityFundraise() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('charity-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('charity-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const charityFundraise = [
    {
      id: 1,
      title: "Children's Hospital Fund",
      goal: "$200,000",
      raised: "$145,600",
      image: "👶",
      organizer: "Children First Foundation",
      gradient: "from-pink-600 to-purple-600"
    },
    {
      id: 2,
      title: "Disaster Relief",
      goal: "$150,000",
      raised: "$98,750",
      image: "🏠",
      organizer: "Global Relief Initiative",
      gradient: "from-orange-600 to-red-600"
    },
    {
      id: 3,
      title: "Food Bank Support",
      goal: "$50,000",
      raised: "$37,890",
      image: "🍲",
      organizer: "Community Food Network",
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
          Charity Fundraise
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
          {charityFundraise.map((fundraise, index) => (
            <FundraiseCard key={fundraise.id} fundraise={fundraise} index={index} />
          ))}
        </div>
      ) : (
        <div 
          id="charity-scroll"
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {charityFundraise.map((fundraise, index) => (
            <FundraiseCard key={fundraise.id} fundraise={fundraise} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

// Community Projects Section
function CommunityProjects() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const scrollLeft = () => {
    const container = document.getElementById('community-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = document.getElementById('community-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const communityProjects = [
    {
      id: 1,
      title: "Community Garden",
      goal: "$15,000",
      raised: "$8,750",
      image: "🌱",
      organizer: "Urban Green Spaces",
      gradient: "from-green-600 to-lime-600"
    },
    {
      id: 2,
      title: "Youth Center Renovation",
      goal: "$35,000",
      raised: "$22,450",
      image: "🏫",
      organizer: "Youth Forward Initiative",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 3,
      title: "Public Art Installation",
      goal: "$12,000",
      raised: "$9,870",
      image: "🎨",
      organizer: "Arts for All Collective",
      gradient: "from-purple-600 to-pink-600"
    }
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={toggleExpand}
          className="text-2xl font-bold hover:text-purple-400 transition-colors duration-300 flex items-center"
        >
          Community Projects
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
          {communityProjects.map((fundraise, index) => (
            <FundraiseCard key={fundraise.id} fundraise={fundraise} index={index} />
          ))}
        </div>
      ) : (
        <div 
          id="community-scroll"
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {communityProjects.map((fundraise, index) => (
            <FundraiseCard key={fundraise.id} fundraise={fundraise} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

// Fundraise Card Component
interface Fundraise {
  id: number;
  title: string;
  goal: string;
  raised: string;
  image: string;
  organizer: string;
  gradient: string;
}

function FundraiseCard({ fundraise, index }: { fundraise: Fundraise; index: number }) {
  return (
    <div 
      className={`flex-shrink-0 w-full sm:w-72 h-[280px] p-3 transition-transform duration-300`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div 
        className={`bg-gradient-to-br ${fundraise.gradient} p-0.5 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 h-full`}
      >
        <div className="bg-[#1a0033] h-full rounded-lg overflow-hidden p-4 flex flex-col">
          <div className="flex items-center mb-3">
            <div className="text-4xl mr-3">{fundraise.image}</div>
            <div>
              <h3 className="font-bold text-lg">{fundraise.title}</h3>
              <p className="text-sm text-gray-300">{fundraise.organizer}</p>
            </div>
          </div>
          
          <div className="mb-3 mt-auto">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{fundraise.raised} of {fundraise.goal}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full bg-gradient-to-r ${fundraise.gradient}`} 
                style={{ width: `${(parseInt(fundraise.raised.replace(/[^0-9]/g, '')) / parseInt(fundraise.goal.replace(/[^0-9]/g, ''))) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
