import React from 'react';
import GiveawayForm from './GiveawayForm';

const GiveawaysClient: React.FC = () => {
  const giveaways = [
    {
      id: 1,
      title: "Exclusive NFT Collection",
      description: "Win one of 10 limited edition NFTs from our exclusive collection.",
      endDate: "2023-12-31",
      prize: "Limited Edition NFT",
      entries: 1289
    },
    {
      id: 2,
      title: "1000 ONA Tokens",
      description: "Enter for a chance to win 1000 ONA tokens to use on our platform.",
      endDate: "2023-12-15",
      prize: "1000 ONA Tokens",
      entries: 2547
    },
    {
      id: 3,
      title: "VIP Platform Access",
      description: "Win lifetime VIP access to all premium features on our platform.",
      endDate: "2023-12-20",
      prize: "Lifetime VIP Access",
      entries: 987
    }
  ];

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white border-opacity-20">
          <h2 className="text-2xl font-bold mb-4 text-white">Current Giveaways</h2>
          <div className="space-y-4">
            {giveaways.map(giveaway => (
              <div key={giveaway.id} className="bg-gradient-to-br from-purple-600 to-indigo-700 p-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-bold text-white">{giveaway.title}</h3>
                <p className="text-white opacity-90 mb-2">{giveaway.description}</p>
                <div className="flex justify-between text-sm text-white opacity-80">
                  <span>Ends: {giveaway.endDate}</span>
                  <span>{giveaway.entries} entries</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-white font-semibold">Prize: {giveaway.prize}</span>
                  <button className="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all">
                    Enter Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white border-opacity-20">
          <h2 className="text-2xl font-bold mb-4 text-white">Participate in Giveaways</h2>
          <p className="text-white mb-6">Fill out the form below to participate in our latest giveaways and get a chance to win amazing prizes!</p>
          <GiveawayForm />
        </div>
      </div>
    </div>
  );
};

export default GiveawaysClient;