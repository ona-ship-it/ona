export const dynamic = 'force-dynamic';
export const revalidate = 0;

import FundraiserDetailClient from './FundraiserDetailClient';

export default function FundraisePage({ params }: { params: { id: string } }) {
  return <FundraiserDetailClient fundraiserId={params.id} />;
}
  const [donationAmount, setDonationAmount] = useState(25)

  const tiers = [
    { amount: 10, title: 'Supporter', perks: ['Thank you message', 'Name on supporters list'], backers: 127 },
    { amount: 50, title: 'Bronze Backer', perks: ['All previous perks', 'Exclusive updates', 'Discord access'], backers: 84 },
    { amount: 100, title: 'Silver Patron', perks: ['All previous perks', 'Early access', 'Personalized thank you'], backers: 42 },
    { amount: 250, title: 'Gold Sponsor', perks: ['All previous perks', 'Video call with team', 'Limited merch'], backers: 15 },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      {/* Header */}
      <header className="bg-[#0f0f23]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            ONAGUI FUNDRAISE
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-2xl overflow-hidden border border-blue-500/30">
              <div className="aspect-video bg-gradient-to-br from-blue-950/80 to-blue-900/80 flex items-center justify-center">
                <div className="text-9xl">💚</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold">
                    🌱 Active Campaign
                  </div>
                  <div className="text-gray-400 text-sm">Created 12 days ago</div>
                </div>
                <h1 className="text-4xl font-bold mb-4">Help Build the Community Center</h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center font-bold">
                      C
                    </div>
                    <div>
                      <div className="font-semibold">Community Foundation</div>
                      <div className="text-sm text-gray-400">Verified Creator ✓</div>
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold text-green-400">$45,230</div>
                    <div className="text-sm text-gray-400">raised of $75,000</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400">268</div>
                    <div className="text-sm text-gray-400">backers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400">18</div>
                    <div className="text-sm text-gray-400">days left</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Campaign Progress</span>
                    <span>60.3%</span>
                  </div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{width: '60.3%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Story */}
            <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Our Story</h2>
              <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
                <p>We're building a community center that will serve over 5,000 families in our neighborhood. This space will provide educational programs, health services, and recreational activities for all ages.</p>
                
                <h3 className="text-white font-semibold text-xl mt-6 mb-3">What We'll Build:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Multi-purpose community hall (500 capacity)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Computer lab with 30 workstations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Children's library and reading room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Health clinic and counseling center</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Outdoor sports and recreation area</span>
                  </li>
                </ul>

                <h3 className="text-white font-semibold text-xl mt-6 mb-3">Impact Goals:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-blue-400 mb-1">5,000+</div>
                    <div className="text-sm text-gray-400">Families Served</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-green-400 mb-1">50+</div>
                    <div className="text-sm text-gray-400">Weekly Programs</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-orange-400 mb-1">1,200+</div>
                    <div className="text-sm text-gray-400">Youth Impacted</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-purple-400 mb-1">365</div>
                    <div className="text-sm text-gray-400">Days Open/Year</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Budget Breakdown</h2>
              <div className="space-y-4">
                {[
                  { category: 'Construction', amount: 45000, percent: 60 },
                  { category: 'Equipment & Furniture', amount: 15000, percent: 20 },
                  { category: 'Technology', amount: 10000, percent: 13 },
                  { category: 'Operating Fund', amount: 5000, percent: 7 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{item.category}</span>
                      <span className="text-white font-semibold">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full"
                        style={{width: `${item.percent}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Updates */}
            <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Campaign Updates</h2>
              <div className="space-y-6">
                {[
                  { date: '2 days ago', title: 'Construction permits approved!', content: 'Great news! We\'ve received all necessary permits and can begin construction next month.' },
                  { date: '5 days ago', title: 'Reached 50% funding milestone', content: 'Thank you to all our amazing backers! We\'re halfway to our goal.' },
                  { date: '8 days ago', title: 'New reward tier added', content: 'Added Gold Sponsor tier with exclusive perks. Check it out!' },
                ].map((update, i) => (
                  <div key={i} className="border-l-2 border-blue-500 pl-4">
                    <div className="text-sm text-gray-400 mb-1">{update.date}</div>
                    <h3 className="font-bold mb-2">{update.title}</h3>
                    <p className="text-gray-300 text-sm">{update.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/60 rounded-2xl p-6 border border-blue-500/30 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Support This Campaign</h3>

              {/* Amount Selector */}
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-3">Select Amount</div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[10, 25, 50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonationAmount(amount)}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        donationAmount === amount
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">$</span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500/50"
                    placeholder="Custom amount"
                  />
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg py-4 font-bold transition-all shadow-lg shadow-blue-500/25 mb-4">
                Donate ${donationAmount}
              </button>

              <div className="text-xs text-gray-400 text-center mb-6">
                🔒 Secure payment • Tax-deductible
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Instant receipt for tax purposes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% goes to the project</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Regular campaign updates</span>
                </div>
              </div>
            </div>

            {/* Reward Tiers */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Reward Tiers</h3>
              <div className="space-y-3">
                {tiers.map((tier, i) => (
                  <button
                    key={i}
                    onClick={() => setDonationAmount(tier.amount)}
                    className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold group-hover:text-blue-400 transition-colors">{tier.title}</div>
                        <div className="text-sm text-gray-400">{tier.backers} backers</div>
                      </div>
                      <div className="text-lg font-bold text-blue-400">${tier.amount}+</div>
                    </div>
                    <ul className="space-y-1 text-xs text-gray-400">
                      {tier.perks.map((perk, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Backers */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Recent Backers</h3>
              <div className="space-y-3">
                {[
                  { name: 'Anonymous', amount: 500, time: '5m ago' },
                  { name: 'John D.', amount: 100, time: '23m ago' },
                  { name: 'Sarah M.', amount: 50, time: '1h ago' },
                  { name: 'Mike R.', amount: 250, time: '2h ago' },
                  { name: 'Emma W.', amount: 25, time: '3h ago' },
                ].map((backer, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center font-bold">
                      {backer.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{backer.name}</div>
                      <div className="text-xs text-gray-500">{backer.time}</div>
                    </div>
                    <div className="text-sm font-semibold text-green-400">${backer.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
