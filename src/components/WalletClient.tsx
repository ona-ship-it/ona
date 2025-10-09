'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserWallet, addToCryptoBalance, addToFiatBalance } from '../utils/walletUtils';

interface Wallet {
  currency: string;
  name: string;
  description: string;
  address: string;
  balance: number;
  icon: string;
  color: string;
  type: 'ticket' | 'fiat' | 'crypto';
}

//

// Tooltip component for educational explanations
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 w-64">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};



export default function WalletClient() {
  const supabase = createClientComponentClient();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  // Removed unused transactions state
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [showDepositModal, setShowDepositModal] = useState(false);
  // Removed unused withdraw modal state
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // Generate a deterministic wallet address based on currency and user ID
  // Removed unused generateWalletAddress helper

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Get the user's wallet from Supabase
        const wallet = await getUserWallet(supabase, user.id);
        
        if (!wallet) {
          setLoading(false);
          return;
        }
        
        const cryptoBalances = wallet.crypto_balances || {};
        
        // Create wallet objects for UI with more user-friendly information
        const walletData: Wallet[] = [
          {
            currency: 'USD',
            name: 'US Dollar',
            description: 'Regular currency you can use for purchases and withdrawals',
            address: '-',
            balance: wallet.fiat_balance || 0,
            icon: '💵',
            color: 'from-green-500 to-emerald-700',
            type: 'fiat'
          },
          {
            currency: 'SOL',
            name: 'Solana',
            description: 'Fast blockchain with low transaction fees',
            address: '0xSOL...1234',
            balance: cryptoBalances.SOL || 0,
            icon: '◎',
            color: 'from-purple-500 to-indigo-600',
            type: 'crypto'
          },
          {
            currency: 'BTC',
            name: 'Bitcoin',
            description: 'The original and most valuable cryptocurrency',
            address: 'bc1q...xyz',
            balance: cryptoBalances.BTC || 0,
            icon: '₿',
            color: 'from-orange-500 to-amber-700',
            type: 'crypto'
          },
          {
            currency: 'ETH',
            name: 'Ethereum',
            description: 'Popular cryptocurrency that powers many applications',
            address: '0xETH...5678',
            balance: cryptoBalances.ETH || 0,
            icon: 'Ξ',
            color: 'from-blue-500 to-cyan-700',
            type: 'crypto'
          },
          {
            currency: 'TICKET',
            name: 'Raffle Tickets',
            description: 'Tickets used to enter raffles',
            address: '-',
            balance: 10, // Default ticket balance
            icon: '🎟️',
            color: 'from-blue-500 to-cyan-700',
            type: 'ticket'
          }
        ];
        
        setWallets(walletData);
        
        // Calculate total portfolio value (simplified - would use real exchange rates in production)
        const total = walletData.reduce((sum, wallet) => {
          let value = wallet.balance;
          if (wallet.currency === 'BTC') value *= 30000; // Example BTC value in USD
          if (wallet.currency === 'ETH') value *= 2000;  // Example ETH value in USD
          if (wallet.currency === 'SOL') value *= 100;   // Example SOL value in USD
          return sum + value;
        }, 0);
        
        setTotalValue(total);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallets:', error);
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [supabase]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  // Handle deposit (add funds)
  const handleDeposit = async (currency: string, amount: number) => {
    if (!userId) return;
    
    try {
      if (currency === 'USD') {
        await addToFiatBalance(supabase, userId, amount);
      } else {
        await addToCryptoBalance(supabase, userId, currency, amount);
      }
      
      // Refresh wallet data
      const walletData = await getUserWallet(supabase, userId);
      if (walletData) {
        const updatedWallets = wallets.map(wallet => {
          if (wallet.currency === 'USD') {
            return { ...wallet, balance: walletData.fiat_balance };
          } else if (walletData.crypto_balances && walletData.crypto_balances[wallet.currency]) {
            return { ...wallet, balance: walletData.crypto_balances[wallet.currency] || 0 };
          }
          return wallet;
        });
        
        // Recalculate total value
        let total = walletData.fiat_balance || 0;
        const cryptoBalances = walletData.crypto_balances || {};
        total += (cryptoBalances.BTC || 0) * 30000;
        total += (cryptoBalances.ETH || 0) * 2000;
        total += (cryptoBalances.SOL || 0) * 100;
        
        setTotalValue(total);
        setWallets(updatedWallets);
        
        // Close the deposit modal and reset form
        setShowDepositModal(false);
        setDepositAmount('');
      }
    } catch (error) {
      console.error('Error depositing funds:', error);
    }
  };
  
  // Handle withdrawal (remove funds)
  const handleWithdraw = async (currency: string, amount: number) => {
    if (!userId) return;
    
    try {
      // Find the wallet
      const wallet = wallets.find(w => w.currency === currency);
      if (!wallet || wallet.balance < amount) {
        alert('Insufficient funds');
        return;
      }
      
      // Process withdrawal (negative amount for withdrawal)
      if (currency === 'USD') {
        await addToFiatBalance(supabase, userId, -amount);
      } else {
        await addToCryptoBalance(supabase, userId, currency, -amount);
      }
      
      // Refresh wallet data
      const walletData = await getUserWallet(supabase, userId);
      if (walletData) {
        const updatedWallets = wallets.map(wallet => {
          if (wallet.currency === 'USD') {
            return { ...wallet, balance: walletData.fiat_balance };
          } else if (walletData.crypto_balances && walletData.crypto_balances[wallet.currency]) {
            return { ...wallet, balance: walletData.crypto_balances[wallet.currency] || 0 };
          }
          return wallet;
        });
        
        // Recalculate total value
        let total = walletData.fiat_balance || 0;
        const cryptoBalances = walletData.crypto_balances || {};
        total += (cryptoBalances.BTC || 0) * 30000;
        total += (cryptoBalances.ETH || 0) * 2000;
        total += (cryptoBalances.SOL || 0) * 100;
        
        setTotalValue(total);
        setWallets(updatedWallets);
        
        // Reset form
        setDepositAmount('');
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Portfolio Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Total Value</p>
                <p className="text-3xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Your Wallets</p>
                <div className="flex space-x-2">
                  {wallets.map(wallet => (
                    <div key={`icon-${wallet.currency}`} className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${wallet.color} text-white font-bold text-lg shadow-md`}>
                      {wallet.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Wallets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {wallets.map((wallet) => {
              // Calculate estimated USD value for crypto
              let usdValue = wallet.balance;
              if (wallet.currency === 'BTC') usdValue *= 30000;
              if (wallet.currency === 'ETH') usdValue *= 2000;
              if (wallet.currency === 'SOL') usdValue *= 100;
              
              return (
                <div key={wallet.currency} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${wallet.color}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${wallet.color} text-white font-bold text-lg shadow-md`}>
                          {wallet.icon}
                        </div>
                        <div className="ml-3">
                          <h2 className="text-xl font-semibold">{wallet.name}</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{wallet.currency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {wallet.balance.toFixed(wallet.currency === 'USD' ? 2 : 6)} {wallet.currency}
                        </div>
                        {wallet.currency !== 'USD' && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {wallet.description}
                    </p>
                    
                    <div className="mb-4">
                      <Tooltip text="This is your unique wallet address. You can share it with others to receive funds.">
                        <div className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded flex items-center">
                          <span className="truncate flex-1">{wallet.address}</span>
                          <button 
                            onClick={() => copyToClipboard(wallet.address)}
                            className="ml-2 text-blue-500 hover:text-blue-700 p-1"
                            aria-label="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      </Tooltip>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => {
                          setActiveWallet(wallet);
                          setShowDepositModal(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
                      >
                        <span className="mr-1">+</span> Receive
                      </button>
                      <button
                        onClick={() => {
                          setActiveWallet(wallet);
                          setShowSendModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                      >
                        <span className="mr-1">→</span> Send
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Crypto Basics Help Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Crypto Basics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">What is a wallet?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A crypto wallet is like a digital bank account that stores your cryptocurrencies. 
                  Each wallet has a unique address for receiving funds.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">What is a blockchain?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A blockchain is a digital ledger that records all transactions. It&#39;s secure, 
                  transparent, and not controlled by any single entity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">How do I send crypto?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Click the &quot;Send&quot; button, enter the recipient&#39;s wallet address and the amount 
                  you want to send, then confirm the transaction.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">How do I receive crypto?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Click the &quot;Receive&quot; button and share your wallet address with the sender. 
                  Once they send the funds, they&#39;ll appear in your wallet.
                </p>
              </div>
            </div>
          </div>
          
          {/* Deposit Modal */}
          {showDepositModal && activeWallet && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Receive {activeWallet.name}</h2>
                <p className="mb-4">Share this address to receive {activeWallet.currency}:</p>
                
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-6">
                  <p className="font-mono break-all">{activeWallet.address}</p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(activeWallet.address)}
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    Copy Address
                  </button>
                </div>
                
                <p className="mb-4">For demo purposes, you can add funds directly:</p>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount to add:</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={`Enter amount in ${activeWallet.currency}`}
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const amount = parseFloat(depositAmount);
                      if (!isNaN(amount) && amount > 0) {
                        handleDeposit(activeWallet.currency, amount);
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    disabled={!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0}
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Send Modal */}
          {showSendModal && activeWallet && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Send {activeWallet.name}</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Recipient Address:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder={`Enter ${activeWallet.currency} address`}
                  />
                    <p className="text-sm text-gray-500 mt-1">
                      Make sure you&#39;re sending to the correct address type for {activeWallet.currency}
                    </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount:</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder={`Enter amount in ${activeWallet.currency}`}
                    />
                    <span className="ml-2">{activeWallet.currency}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Available: {activeWallet.balance.toFixed(activeWallet.currency === 'USD' ? 2 : 6)} {activeWallet.currency}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const amount = parseFloat(depositAmount);
                      if (!isNaN(amount) && amount > 0 && amount <= activeWallet.balance) {
                        handleWithdraw(activeWallet.currency, amount);
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={
                      !depositAmount || 
                      isNaN(parseFloat(depositAmount)) || 
                      parseFloat(depositAmount) <= 0 ||
                      parseFloat(depositAmount) > activeWallet.balance
                    }
                  >
                    Send {activeWallet.currency}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}