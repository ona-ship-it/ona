'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '../../components/Navigation';
import PageTitle from '@/components/PageTitle';
import { useTheme } from '@/components/ThemeContext';

export default function MyAccount() {
  const { isDarker } = useTheme();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'subscription', 'wallet', 'activity'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Mock user data - in a real app, this would come from an API or auth provider
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joined: 'January 15, 2023',
    subscription: {
      plan: 'Premium',
      status: 'Active',
      nextBilling: 'February 15, 2024',
      price: '$19.99/month'
    },
    wallet: {
      crypto: [
        { id: 1, currency: 'Bitcoin', symbol: 'BTC', amount: '0.025', value: '$1,245.67' },
        { id: 2, currency: 'Ethereum', symbol: 'ETH', amount: '1.45', value: '$3,267.89' },
        { id: 3, currency: 'Solana', symbol: 'SOL', amount: '12.5', value: '$1,125.50' }
      ],
      fiat: [
        { id: 1, currency: 'US Dollar', symbol: 'USD', amount: '2,450.00' },
        { id: 2, currency: 'Euro', symbol: 'EUR', amount: '1,200.00' }
      ]
    },
    activity: [
      { id: 1, type: 'Raffle Entry', name: 'Weekend Getaway', date: 'Jan 10, 2024' },
      { id: 2, type: 'Giveaway Entry', name: 'Tech Bundle', date: 'Jan 5, 2024' },
      { id: 3, type: 'Fundraiser Donation', name: 'Community Center', date: 'Dec 28, 2023' }
    ]
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageTitle className="text-3xl md:text-4xl mb-6" gradient={true}>
          My Account
        </PageTitle>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-8">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium ${activeTab === 'profile' 
              ? 'text-white border-b-2 border-purple-600' 
              : 'text-gray-400 hover:text-white'}`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 font-medium ${activeTab === 'subscription' 
              ? 'text-white border-b-2 border-purple-600' 
              : 'text-gray-400 hover:text-white'}`}
          >
            Subscription
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 font-medium ${activeTab === 'wallet' 
              ? 'text-white border-b-2 border-purple-600' 
              : 'text-gray-400 hover:text-white'}`}
          >
            My Wallet
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 font-medium ${activeTab === 'activity' 
              ? 'text-white border-b-2 border-purple-600' 
              : 'text-gray-400 hover:text-white'}`}
          >
            Activity
          </button>
        </div>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={userData.name} 
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full text-white"
                    readOnly
                  />
                  <button className="ml-2 text-purple-500 hover:text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <div className="flex items-center">
                  <input 
                    type="email" 
                    value={userData.email} 
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full text-white"
                    readOnly
                  />
                  <button className="ml-2 text-purple-500 hover:text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Account Security</h3>
              <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                Change Password
              </button>
              <button className="ml-4 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                Enable Two-Factor Authentication
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-400">Member since: {userData.joined}</p>
            </div>
          </div>
        )}
        
        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Subscription Details</h2>
              <span className="px-3 py-1 bg-green-900 text-green-400 rounded-full text-sm font-medium">
                {userData.subscription.status}
              </span>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 mb-6 border border-purple-800/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {userData.subscription.plan}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {userData.subscription.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Next billing date</p>
                  <p className="font-medium">{userData.subscription.nextBilling}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                  <div className="bg-gray-700 rounded p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-gray-400">Expires 12/25</p>
                  </div>
                </div>
                <button className="mt-4 text-purple-500 hover:text-purple-400 text-sm font-medium">
                  Update payment method
                </button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Subscription Management</h3>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 mb-3">
                  Upgrade Plan
                </button>
                <button className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-6">My Wallet</h2>
            
            {/* Crypto Currency Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-purple-400">Cryptocurrency</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Currency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Value</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.wallet.crypto.map(coin => (
                      <tr key={coin.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                              <span className="font-bold text-xs">{coin.symbol}</span>
                            </div>
                            <span>{coin.currency}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">{coin.amount} {coin.symbol}</td>
                        <td className="py-4 px-4 text-right">{coin.value}</td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-purple-500 hover:text-purple-400 mr-3">
                            Send
                          </button>
                          <button className="text-purple-500 hover:text-purple-400">
                            Receive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Fiat Currency Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-purple-400">Fiat Currency</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Currency</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.wallet.fiat.map(currency => (
                      <tr key={currency.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                              <span className="font-bold text-xs">{currency.symbol}</span>
                            </div>
                            <span>{currency.currency}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">{currency.symbol} {currency.amount}</td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-purple-500 hover:text-purple-400 mr-3">
                            Deposit
                          </button>
                          <button className="text-purple-500 hover:text-purple-400">
                            Withdraw
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.activity.map(item => (
                    <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4">{item.type}</td>
                      <td className="py-4 px-4">{item.name}</td>
                      <td className="py-4 px-4">{item.date}</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-purple-500 hover:text-purple-400">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 text-center">
              <button className="text-purple-500 hover:text-purple-400 font-medium">
                View All Activity
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}