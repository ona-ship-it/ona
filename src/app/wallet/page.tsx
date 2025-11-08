"use client"; 

import { useEffect, useState } from "react"; 
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { toast } from 'sonner';

interface Transaction { 
  id: string; 
  type: "deposit" | "withdrawal" | "ticket" | "payout" | "earn" | "convert" | "claim"; 
  amount: number; 
  currency: string; 
  status: string; 
  created_at: string; 
  description?: string;
} 

interface FreeTicket {
  id: string;
  event: string;
  amount: number;
  expires_at: string;
  claimed: boolean;
}

interface BestPractice {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export default function WalletPage() { 
  const supabase = createClientComponentClient(); 
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); 
  const [balances, setBalances] = useState<any>(null); 
  const [transactions, setTransactions] = useState<Transaction[]>([]); 
  const [activeTab, setActiveTab] = useState("overview");
  const [cryptoType, setCryptoType] = useState("USDT");
  const [freeTickets, setFreeTickets] = useState<FreeTicket[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Past 30 days");
  const [typeFilter, setTypeFilter] = useState("All");
  const [depositType, setDepositType] = useState<"crypto" | "fiat">("fiat");
  const [depositAmount, setDepositAmount] = useState("");
  
  const handleStripePayment = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount) * 100, // Convert to cents
          currency: 'usd',
          metadata: {
            userId: user?.id,
            type: 'wallet_deposit'
          }
        }),
      });

      if (response.ok) {
        const { clientSecret } = await response.json();
        // Redirect to Stripe payment page
        window.location.href = `/wallet/pay?client_secret=${clientSecret}&amount=${depositAmount}`;
      } else {
        toast.error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Error processing payment');
    }
  };
  
  // Add a class to the body element for the dark background
  useEffect(() => {
    document.body.className = "min-h-screen bg-gradient-to-b from-[#1f2937] to-[#000000] text-white";
    return () => {
      document.body.className = "";
    };
  }, []);

  // Fetch user data
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  // Mock data for best practices
  const bestPractices: BestPractice[] = [
    {
      id: "1",
      title: "Enable 2FA",
      description: "Secure your account with two-factor authentication for extra protection.",
      icon: "🔒"
    },
    {
      id: "2",
      title: "Regular Withdrawals",
      description: "Don&amp;#39;t keep large amounts in your wallet. Withdraw regularly to your secure wallet.",
      icon: "💰"
    },
    {
      id: "3",
      title: "Check Transaction History",
      description: "Regularly review your transaction history to monitor account activity.",
      icon: "📊"
    }
  ];

  // Mock data for free tickets
  const mockFreeTickets: FreeTicket[] = [
    {
      id: "1",
      event: "Welcome Bonus",
      amount: 5,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      claimed: false
    },
    {
      id: "2",
      event: "Weekly Giveaway",
      amount: 2,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      claimed: false
    }
  ];

  useEffect(() => { 
    const fetchWalletData = async () => { 
      setLoading(true); 

      try {
        // Fetch unified balances from the updated API
        const response = await fetch('/api/wallet/balance');
        const balanceData = await response.json();

        // fetch transactions 
        const { data: txs } = await supabase 
          .from("transactions") 
          .select("*") 
          .order("created_at", { ascending: false }) 
          .limit(20); 

        setBalances(balanceData || { 
          total_balance_usdt: 0, 
          crypto_balance_usdt: 0, 
          fiat_balance_usdt: 0,
          tickets_balance: 0 
        }); 
        setTransactions(balanceData.transactions || txs || []); 
        setFreeTickets(mockFreeTickets);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setBalances({ 
          total_balance_usdt: 0, 
          crypto_balance_usdt: 0, 
          fiat_balance_usdt: 0,
          tickets_balance: 0 
        });
        setTransactions([]);
      }
      
      setLoading(false); 
    }; 

    fetchWalletData(); 
  }, []); 

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    // Filter by type
    if (typeFilter !== "All") {
      filtered = filtered.filter(tx => tx.type.toLowerCase() === typeFilter.toLowerCase());
    }
    
    // Filter by time
    const now = new Date();
    if (timeFilter === "Past 7 days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(tx => new Date(tx.created_at) >= sevenDaysAgo);
    } else if (timeFilter === "Past 30 days") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(tx => new Date(tx.created_at) >= thirtyDaysAgo);
    } else if (timeFilter === "Past 90 days") {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(tx => new Date(tx.created_at) >= ninetyDaysAgo);
    }
    
    return filtered;
  };

  const claimFreeTicket = async (ticketId: string) => {
    // In a real implementation, this would call an API endpoint
    setFreeTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId ? {...ticket, claimed: true} : ticket
      )
    );
    
    // Update balances
    const ticketAmount = freeTickets.find(t => t.id === ticketId)?.amount || 0;
    setBalances((prev: any) => ({
      ...prev,
      tickets_balance: (prev.tickets_balance || 0) + ticketAmount
    }));
    
    // Add to transactions
    const newTransaction: Transaction = {
      id: `claim-${Date.now()}`,
      type: "claim",
      amount: ticketAmount,
      currency: "TICKET",
      status: "completed",
      created_at: new Date().toISOString(),
      description: "Claimed free tickets"
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  if (loading) { 
    return ( 
      <div className="flex h-[80vh] items-center justify-center"> 
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div> 
    ); 
  } 

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Total Balance - Main Card */}
            <div className="mb-6">
              <div className="rounded-2xl shadow-lg border border-yellow-500 bg-gradient-to-br from-[#1a1500] to-[#2a2000] p-8 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">💰</span>
                  <span className="text-lg font-medium text-yellow-300">Total Wallet Balance</span>
                </div>
                <p className="text-5xl font-bold text-white mb-4">
                  {balances?.total_balance_usdt?.toFixed(2) || "0.00"} USDT
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">💵</span>
                    <span className="text-gray-300">Fiat: {balances?.fiat_balance_usdt?.toFixed(2) || "0.00"} USDT</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">🌐</span>
                    <span className="text-gray-300">Crypto: {balances?.crypto_balance_usdt?.toFixed(2) || "0.00"} USDT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balances Breakdown */} 
            <div className="grid gap-6 md:grid-cols-3"> 
              <div className="rounded-2xl shadow-lg border border-purple-900 bg-gradient-to-br from-[#0a0015] to-[#1a0033] p-6 hover:shadow-[0_0_15px_rgba(128,0,255,0.2)] transition-all duration-300"> 
                <div className="flex items-center justify-between"> 
                  <span className="text-xl text-purple-400">🎟️</span> 
                  <span className="text-sm font-medium text-purple-300">Tickets</span> 
                </div> 
                <p className="mt-4 text-3xl font-bold text-white"> 
                  {balances?.tickets_balance || 0} 
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  Use tickets to enter raffles and giveaways
                </div>
                <span 
                  onClick={() => setActiveTab("tickets")}
                  className="mt-4 text-xs text-purple-400 hover:text-purple-300 flex items-center cursor-pointer"
                >
                  Claim free tickets <span className="ml-1">→</span>
                </span>
              </div>

              <div className="rounded-2xl shadow-lg border border-green-900 bg-gradient-to-br from-[#0a0015] to-[#0a1a00] p-6 hover:shadow-[0_0_15px_rgba(0,128,0,0.2)] transition-all duration-300"> 
                <div className="flex items-center justify-between"> 
                  <span className="text-xl text-green-400">💵</span> 
                  <span className="text-sm font-medium text-green-300">Fiat (USD)</span> 
                </div> 
                <p className="mt-4 text-3xl font-bold text-white"> 
                  {balances?.fiat_balance_usdt?.toFixed(2) || "0.00"} USDT
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  Fiat deposits converted to USDT
                </div>
                <div className="mt-1 text-xs text-green-300">
                  ✓ Stripe payments enabled
                </div>
              </div>

              <div className="rounded-2xl shadow-lg border border-blue-900 bg-gradient-to-br from-[#0a0015] to-[#001a33] p-6 hover:shadow-[0_0_15px_rgba(0,128,255,0.2)] transition-all duration-300"> 
                <div className="flex items-center justify-between"> 
                  <span className="text-xl text-blue-400">🌐</span> 
                  <span className="text-sm font-medium text-blue-300">Crypto</span> 
                </div> 
                <p className="mt-4 text-3xl font-bold text-white"> 
                  {balances?.crypto_balance_usdt?.toFixed(2) || "0.00"} USDT
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  On-chain crypto balance in USDT equivalent
                </div>
                <div className="mt-1 text-xs text-blue-300">
                  ✓ Multi-currency support
                </div>
              </div>
            </div> 

            {/* Actions */} 
            <div className="flex gap-4"> 
              <div 
                onClick={() => setShowDepositModal(true)}
                className="flex-1 bg-onaguiGreen hover:bg-onaguiGreen-dark text-white py-3 px-4 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
              > 
                <span className="mr-2">⬇️</span> Deposit 
              </div>
              <div className="flex-1 bg-onaguiGreen hover:bg-onaguiGreen-dark text-white py-3 px-4 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"> 
                <span className="mr-2">⬆️</span> Withdraw 
              </div>
            </div> 

            {/* Recent Transactions */} 
            <div className="bg-[#0a0015] rounded-2xl shadow-md p-6 border border-purple-900"> 
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                <span className="text-sm text-blue-400 cursor-pointer hover:text-blue-300" onClick={() => setActiveTab("history")}>
                  View All →
                </span>
              </div>
              {transactions.length === 0 ? ( 
                <p className="text-gray-400"> 
                  No transactions yet. Start by depositing or buying a ticket! 
                </p> 
              ) : ( 
                <div className="space-y-4"> 
                  {transactions.slice(0, 5).map((tx) => ( 
                    <div key={tx.id} className="border border-gray-800 bg-[#12071f] rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-[0_0_10px_rgba(128,0,255,0.15)] transition-all duration-300"> 
                      <div> 
                        <p className="font-medium capitalize text-white">{tx.type}</p> 
                        <p className="text-sm text-gray-400"> 
                          {new Date(tx.created_at).toLocaleString()} 
                        </p> 
                      </div> 
                      <div className="text-right"> 
                        <p 
                          className={`text-lg font-bold ${ 
                            tx.type === "deposit" || tx.type === "earn" || tx.type === "claim"
                              ? "text-green-400" 
                              : tx.type === "withdrawal" 
                              ? "text-red-400" 
                              : "text-blue-400" 
                          }`} 
                        > 
                          {tx.type === "withdrawal" ? "-" : "+"} {tx.amount}{" "} 
                          {tx.currency} 
                        </p> 
                        <p className="text-sm text-gray-400">{tx.status}</p> 
                      </div> 
                    </div>
                  ))} 
                </div> 
              )} 
            </div>

            {/* Free Tickets */}
            {freeTickets.filter(t => !t.claimed).length > 0 && (
              <div className="bg-gradient-to-r from-[#1a1500] to-[#1a0f00] rounded-2xl shadow-md p-6 border border-yellow-900">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-300">
                  <span className="mr-2">🎁</span> Free Tickets Available
                </h2>
                <div className="space-y-4">
                  {freeTickets.filter(t => !t.claimed).map((ticket) => (
                    <div key={ticket.id} className="bg-[#12071f] rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-800">
                      <div>
                        <p className="font-medium text-white">{ticket.event}</p>
                        <p className="text-sm text-gray-400">
                          Expires: {new Date(ticket.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-amber-400">
                          {ticket.amount} 🎟️
                        </p>
                        <span 
                          onClick={() => claimFreeTicket(ticket.id)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 cursor-pointer"
                        >
                          Claim
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Practices */}
            <div className="bg-[#0a0015] rounded-2xl shadow-md p-6 border border-purple-900">
              <h2 className="text-xl font-semibold mb-4 text-white">Best Practices</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {bestPractices.map((practice) => (
                  <div key={practice.id} className="border border-gray-800 bg-[#12071f] rounded-xl p-4 hover:shadow-[0_0_10px_rgba(128,0,255,0.15)] transition-all duration-300">
                    <div className="text-2xl mb-2">{practice.icon}</div>
                    <h3 className="font-medium text-lg text-white">{practice.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{practice.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      
      case "history":
        return (
          <div className="bg-[#0a0015] rounded-2xl shadow-md p-6 border border-purple-900">
            <h2 className="text-xl font-semibold mb-6 text-white">Transaction History</h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select 
                  className="w-full rounded-lg border border-gray-700 bg-[#12071f] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="ticket">Tickets</option>
                  <option value="payout">Payouts</option>
                  <option value="earn">Earnings</option>
                  <option value="convert">Conversions</option>
                  <option value="claim">Claims</option>
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-1">Time Period</label>
                <select 
                  className="w-full rounded-lg border border-gray-700 bg-[#12071f] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="All Time">All Time</option>
                  <option value="Past 7 days">Past 7 days</option>
                  <option value="Past 30 days">Past 30 days</option>
                  <option value="Past 90 days">Past 90 days</option>
                </select>
              </div>
            </div>
            
            {/* Transactions List */}
            {getFilteredTransactions().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions found for the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredTransactions().map((tx) => (
                  <div key={tx.id} className="border border-gray-800 bg-[#12071f] rounded-xl p-4 flex items-center justify-between hover:shadow-[0_0_10px_rgba(128,0,255,0.15)] transition-all duration-300">
                    <div>
                      <div className="flex items-center">
                        <span className={`mr-2 text-lg ${
                          tx.type === "deposit" || tx.type === "earn" || tx.type === "claim"
                            ? "text-green-500"
                            : tx.type === "withdrawal"
                            ? "text-red-500"
                            : tx.type === "convert"
                            ? "text-purple-500"
                            : "text-blue-500"
                        }`}>
                          {tx.type === "deposit" || tx.type === "earn" || tx.type === "claim" ? "⬇️" : 
                           tx.type === "withdrawal" ? "⬆️" : 
                           tx.type === "convert" ? "🔄" :
                           tx.type === "payout" ? "💰" : "🎟️"}
                        </span>
                        <p className="font-medium capitalize text-white">{tx.type}</p>
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-gray-500 mt-1">{tx.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          tx.type === "deposit" || tx.type === "earn" || tx.type === "claim"
                            ? "text-green-400"
                            : tx.type === "withdrawal"
                            ? "text-red-400"
                            : "text-blue-400"
                        }`}
                      >
                        {tx.type === "withdrawal" ? "-" : "+"} {tx.amount}{" "}
                        {tx.currency}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          tx.status === "completed" ? "bg-green-900 text-green-300" :
                          tx.status === "pending" ? "bg-yellow-900 text-yellow-300" :
                          tx.status === "failed" ? "bg-red-900 text-red-300" :
                          "bg-gray-800 text-gray-300"
                        }`}>
                          {tx.status}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case "rewards":
        return (
          <div className="bg-[#0a0015] rounded-2xl shadow-md p-6 border border-purple-900">
            <h2 className="text-xl font-semibold mb-6 text-white">Rewards Hub</h2>
            
            {/* Earnings Summary */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 mb-6 border border-indigo-700">
              <h3 className="text-lg font-medium mb-2 text-white">Total Earnings</h3>
              <p className="text-3xl font-bold text-indigo-300">
                {transactions.filter(tx => tx.type === "earn").reduce((sum, tx) => sum + tx.amount, 0)} USDT
              </p>
              <p className="text-sm text-gray-300 mt-1">
                From staking, referrals, and promotions
              </p>
            </div>
            
            {/* Available Rewards */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-white">Available Rewards</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-amber-900 rounded-xl p-4 bg-gradient-to-r from-amber-950 to-yellow-950">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">Referral Program</h4>
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Earn 5% of your friends&#39; deposits when they sign up with your code.
                  </p>
                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-300">
                    Get Referral Link
                  </button>
                </div>
                
                <div className="border border-blue-900 rounded-xl p-4 bg-gradient-to-r from-blue-950 to-cyan-950">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">Staking Rewards</h4>
                    <span className="text-2xl">📈</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Stake your crypto and earn up to 12% APY on your holdings.
                  </p>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-300">
                    Start Staking
                  </button>
                </div>
              </div>
            </div>
            
            {/* Earnings History */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Earnings History</h3>
              {transactions.filter(tx => tx.type === "earn").length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No earnings yet. Start referring friends or stake your crypto!
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(tx => tx.type === "earn").map((tx) => (
                    <div key={tx.id} className="border rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tx.description || 'Reward'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        +{tx.amount} {tx.currency}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case "deposit":
        return (
          <div className="bg-white rounded-2xl shadow-md p-6 border">
            <h2 className="text-xl font-semibold mb-6">Deposit</h2>
            
            {/* Crypto/Fiat Tabs */}
            <div className="flex border-b mb-6">
              <button className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
                Crypto
              </button>
              <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
                Fiat
              </button>
            </div>
            
            {/* Crypto Deposit UI */}
            <div>
              {/* Currency Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Currency
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-blue-500 bg-blue-50">
                    <span className="text-xl">🔵</span>
                    <span>ETH</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50">
                    <span className="text-xl">🟠</span>
                    <span>BTC</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50">
                    <span className="text-xl">🟢</span>
                    <span>USDT</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50">
                    <span className="text-xl">🔵</span>
                    <span>USDC</span>
                  </button>
                </div>
              </div>
              
              {/* Network Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Network
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Ethereum (ERC20)</option>
                  <option>Binance Smart Chain (BEP20)</option>
                  <option>Polygon</option>
                  <option>Arbitrum</option>
                </select>
              </div>
              
              {/* Deposit Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Address
                </label>
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-2 rounded-lg border">
                      {/* QR Code placeholder */}
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                        QR Code
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value="0xe31399da2d0D9ef8C78FCCeFc88dFC10BD43E2A" 
                      readOnly
                      className="w-full bg-white rounded-lg border border-gray-300 px-3 py-3 pr-24 font-mono text-sm"
                    />
                    <button className="absolute right-2 top-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <span>⚠️</span> Important
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Send only ETH to this deposit address</li>
                  <li>• Ensure you&amp;#39;re using the Ethereum (ERC20) network</li>
                  <li>• Minimum deposit: 0.01 ETH</li>
                  <li>• Deposits typically confirm within 30 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case "tickets":
        return (
          <div className="bg-white rounded-2xl shadow-md p-6 border">
            <h2 className="text-xl font-semibold mb-6">Free Tickets</h2>
            
            {/* Current Balance */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-2">Current Ticket Balance</h3>
              <p className="text-3xl font-bold text-onaguiGreen">
                {balances?.tickets_balance || 0} 🎟️
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Use tickets to enter raffles and giveaways
              </p>
            </div>
            
            {/* Available Free Tickets */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Available Free Tickets</h3>
              
              {freeTickets.filter(t => !t.claimed).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No free tickets available at the moment.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for new giveaways!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {freeTickets.filter(t => !t.claimed).map((ticket) => (
                    <div key={ticket.id} className="border rounded-xl p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{ticket.event}</h4>
                          <p className="text-sm text-gray-600">
                            Expires: {new Date(ticket.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-amber-600">
                            {ticket.amount} 🎟️
                          </p>
                          <button 
                            onClick={() => claimFreeTicket(ticket.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
                          >
                            Claim Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Claimed Tickets History */}
            <div>
              <h3 className="text-lg font-medium mb-4">Claimed Tickets History</h3>
              
              {freeTickets.filter(t => t.claimed).length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No claimed tickets yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {freeTickets.filter(t => t.claimed).map((ticket) => (
                    <div key={ticket.id} className="border rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ticket.event}</p>
                        <p className="text-xs text-gray-500">
                          Claimed on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        +{ticket.amount} 🎟️
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case "convert":
        return (
          <div className="bg-white rounded-2xl shadow-md p-6 border">
            <h2 className="text-xl font-semibold mb-6">Convert</h2>
            
            {/* Convert Form */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Convert Currency</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <div className="flex">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="flex-1 rounded-l-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select className="rounded-r-lg border border-l-0 border-gray-300 px-3 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>USDT</option>
                      <option>ETH</option>
                      <option>BTC</option>
                      <option>USDC</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    🔄
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <div className="flex">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="flex-1 rounded-l-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                    <select className="rounded-r-lg border border-l-0 border-gray-300 px-3 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>ETH</option>
                      <option>USDT</option>
                      <option>BTC</option>
                      <option>USDC</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Exchange Rate: 1 USDT = 0.000423 ETH</p>
                  <p>Fee: 0.5%</p>
                </div>
                
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors duration-300">
                  Convert Now
                </button>
              </div>
            </div>
            
            {/* Conversion History */}
            <div>
              <h3 className="text-lg font-medium mb-4">Conversion History</h3>
              
              {transactions.filter(tx => tx.type === "convert").length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No conversion history yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Your conversions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(tx => tx.type === "convert").map((tx) => (
                    <div key={tx.id} className="border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {tx.description || "Currency Conversion"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-onaguiGreen">
                          {tx.amount} {tx.currency}
                        </p>
                        <p className="text-xs text-gray-500">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return ( 
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <Navigation />
      {/* Header */} 
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"> 
            <span className="text-primary">💼</span> My Onagui Wallet 
          </h1> 
          <p className="text-gray-500"> 
            Your simple and secure wallet for tickets, crypto, and fiat balances. 
          </p>
        </div>
        
        {/* Buttons removed */}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "overview" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "history" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab("rewards")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "rewards" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Rewards Hub
          </button>
          <button 
            onClick={() => setActiveTab("tickets")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "tickets" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tickets
          </button>
          <button 
            onClick={() => setActiveTab("convert")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "convert" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Convert
          </button>
          <button 
            onClick={() => setActiveTab("deposit")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "deposit" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Deposit
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Deposit Funds</h2>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex border-b mb-4">
                <button 
                  onClick={() => setDepositType("crypto")}
                  className={`px-4 py-2 font-medium ${
                    depositType === "crypto" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Crypto
                </button>
                <button 
                  onClick={() => setDepositType("fiat")}
                  className={`px-4 py-2 font-medium ${
                    depositType === "fiat" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Fiat (Card)
                </button>
              </div>
              
              {depositType === "crypto" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Cryptocurrency
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center gap-2 p-2 rounded-lg border-2 border-blue-500 bg-blue-50">
                        <span className="text-xl">🔵</span>
                        <span>ETH</span>
                      </button>
                      <button className="flex items-center gap-2 p-2 rounded-lg border border-gray-200">
                        <span className="text-xl">🟠</span>
                        <span>BTC</span>
                      </button>
                      <button className="flex items-center gap-2 p-2 rounded-lg border border-gray-200">
                        <span className="text-xl">🟢</span>
                        <span>USDT</span>
                      </button>
                      <button className="flex items-center gap-2 p-2 rounded-lg border border-gray-200">
                        <span className="text-xl">🔵</span>
                        <span>USDC</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Network
                    </label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
                      <option>Ethereum (ERC20)</option>
                      <option>Binance Smart Chain (BEP20)</option>
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-center mb-3">
                      <div className="bg-white p-2 rounded border">
                        {/* QR Code placeholder */}
                        <div className="w-32 h-32 bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value="0xe31399da2d0D9ef8C78FCCeFc88dFC10BD43E2A" 
                        readOnly
                        className="w-full bg-white rounded border border-gray-300 px-2 py-2 pr-16 font-mono text-xs"
                      />
                      <button className="absolute right-1 top-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Send only ETH to this address</li>
                      <li>Minimum deposit: 0.01 ETH</li>
                      <li>Deposits typically confirm in 30 minutes</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        type="number" 
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-300 px-8 py-3 text-lg font-medium"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum deposit: $1.00 • Will be converted to USDT at 1:1 rate
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">💳</span>
                      <span className="font-medium text-blue-900">Secure Card Payment</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your payment will be processed securely through Stripe. 
                      Funds will be instantly added to your wallet as USDT.
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleStripePayment}
                    disabled={!depositAmount || parseFloat(depositAmount) < 1}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors duration-300"
                  >
                    Pay ${depositAmount || "0.00"} with Card
                  </button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    <p>🔒 Secured by Stripe • No fees • Instant deposit</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowDepositModal(false)}
                className="bg-onaguiGreen hover:bg-onaguiGreen-dark text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  ); 
}
