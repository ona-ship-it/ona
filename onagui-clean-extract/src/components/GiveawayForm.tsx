import React from 'react';

const GiveawayForm: React.FC = () => {
  return (
    <form className="mt-4 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
        <input 
          type="email" 
          id="email" 
          className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-70 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label htmlFor="wallet" className="block text-sm font-medium text-white">Wallet Address</label>
        <input 
          type="text" 
          id="wallet" 
          className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-70 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          placeholder="0x..."
        />
      </div>
      <div>
        <label htmlFor="giveaway" className="block text-sm font-medium text-white">Select Giveaway</label>
        <select 
          id="giveaway" 
          className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="nft">Exclusive NFT Collection</option>
          <option value="tokens">1000 ONA Tokens</option>
          <option value="vip">VIP Platform Access</option>
        </select>
      </div>
      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        Enter Giveaway
      </button>
    </form>
  );
};

export default GiveawayForm;