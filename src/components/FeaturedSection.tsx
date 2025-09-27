'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';

interface FeaturedSectionProps {
  title: string;
  linkTo: string;
  items: {
    title: string;
    creator: string;
    description: string;
    progress: number;
    entries?: string;
    timeLeft?: string;
    color: string;
  }[];
}

export default function FeaturedSection({ title, linkTo, items }: FeaturedSectionProps) {
  const { isDarker, isWhite } = useTheme();
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isWhite ? 'text-gray-800' : isDarker ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button className={`p-2 rounded-full ${isWhite ? 'bg-gray-100 hover:bg-gray-200' : isDarker ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={isWhite ? 'currentColor' : isDarker ? '#e5e7eb' : 'currentColor'} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className={`p-2 rounded-full ${isWhite ? 'bg-gray-100 hover:bg-gray-200' : isDarker ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={isWhite ? 'currentColor' : isDarker ? '#e5e7eb' : 'currentColor'} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <Link href={linkTo} className={`text-sm font-medium ${isWhite ? 'text-indigo-600 hover:text-indigo-700' : 'text-purple-600 hover:text-purple-700'}`}>
            View all
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <div key={index} className={`${isDarker ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-${item.color}-500 overflow-hidden hover:shadow-xl transition-all duration-300`}>
            {/* Photo space */}
            <div className={`h-48 w-full ${isDarker ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
              <div className={`w-full h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 flex items-center justify-center text-white`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`font-bold ${isWhite ? 'text-gray-800' : isDarker ? 'text-gray-100' : 'text-gray-800'}`}>{item.title}</h3>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : isDarker ? 'text-gray-400' : 'text-gray-500'}`}>by {item.creator}</p>
                </div>
              </div>
              <p className={`${isWhite ? 'text-gray-600' : isDarker ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{item.description}</p>
              <div className="mb-2">
                <div className={`h-2 w-full ${isWhite ? 'bg-gray-200' : isDarker ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 rounded-full`} style={{ width: `${item.progress}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                {item.entries && <span className={`font-medium ${isWhite ? 'text-indigo-600' : `text-${item.color}-600`}`}>{item.entries} entries</span>}
                {item.timeLeft && <span className={`${isWhite ? 'text-gray-500' : isDarker ? 'text-gray-400' : 'text-gray-500'}`}>{item.timeLeft}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}