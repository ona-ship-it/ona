import React from 'react';
import Navigation from '@/components/Navigation';
import PageTitle from '@/components/PageTitle';
import OnaguiSymbol from '@/components/OnaguiSymbol';

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mt-10 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white border-opacity-20">
          <div className="flex items-center justify-center mb-8">
            <OnaguiSymbol size="large" />
            <PageTitle title="About Onagui" className="text-white ml-4" />
          </div>
          
          <div className="text-white space-y-6 max-w-4xl mx-auto">
            <p className="text-xl">
              Onagui is a revolutionary blockchain platform designed to connect creators, developers, and enthusiasts in a vibrant ecosystem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <div className="bg-gradient-to-br from-teal-400 to-green-500 p-6 rounded-lg shadow-lg">
                <h3 className="text-white font-bold text-xl mb-3">Our Mission</h3>
                <p className="text-white opacity-90">To democratize blockchain technology and make it accessible to everyone, regardless of technical background.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg">
                <h3 className="text-white font-bold text-xl mb-3">Our Vision</h3>
                <p className="text-white opacity-90">A world where blockchain empowers creators and builds communities around shared digital experiences.</p>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold border-b border-white border-opacity-20 pb-2">Our Team</h3>
            <p>
              Founded in 2023 by a team of blockchain enthusiasts and developers, Onagui has grown into a platform that serves thousands of users worldwide. Our team consists of experts in blockchain technology, web development, and digital art.
            </p>
            
            <h3 className="text-2xl font-bold border-b border-white border-opacity-20 pb-2">Technology</h3>
            <p>
              Onagui is built on cutting-edge blockchain technology, ensuring security, transparency, and efficiency. We support multiple blockchains and are constantly expanding our ecosystem.
            </p>
            
            <div className="mt-8 flex justify-center">
              <button className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 mr-4">
                Join Our Team
              </button>
              <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}