import React from 'react';
import Link from 'next/link';
import OnaguiSymbol from './OnaguiSymbol';

const Navigation: React.FC = () => {
  return (
    <nav className="flex justify-between items-center w-full py-4 px-6 bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg border border-white border-opacity-20">
      <div className="flex items-center">
        <OnaguiSymbol size="medium" className="mr-6" />
      </div>
      <div className="flex space-x-6">
        <Link href="/" className="text-white font-medium hover:text-pink-300 transition-colors duration-300">Home</Link>
        <Link href="/about" className="text-white font-medium hover:text-pink-300 transition-colors duration-300">About</Link>
        <Link href="/contact" className="text-white font-medium hover:text-pink-300 transition-colors duration-300">Contact</Link>
        <Link href="/giveaways" className="text-white font-medium hover:text-pink-300 transition-colors duration-300">Giveaways</Link>
      </div>
      <div>
        <button className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full text-sm shadow-md hover:bg-opacity-90 transition-all duration-300">
          Connect Wallet
        </button>
      </div>
    </nav>
  );
};

export default Navigation;