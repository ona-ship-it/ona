'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { IconX, IconWallet, IconCheck, IconChevronDown } from '@tabler/icons-react';
import { ethers } from 'ethers';
import { SUPPORTED_CRYPTOS, getCryptoById, ERC20_ABI, type CryptoNetwork } from '@/lib/cryptoConfig';
import { connectPhantomWallet, sendSolanaTransaction, getSolanaExplorerUrl } from '@/lib/solanaWallet';
import { connectUnisatWallet, btcToSatoshis, getBitcoinExplorerUrl } from '@/lib/bitcoinWallet';

interface DonationModalProps {
  fundraiser: {
    id: string;
    title: string;
    wallet_address: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

// Calculate platform fee: 2.9% + $0.30 (like GoFundMe)
function calculatePlatformFee(amount: number): number {
  return (amount * 0.029) + 0.30;
}

function calculateNetAmount(amount: number): number {
  return amount - calculatePlatformFee(amount);
}

export default function DonationModal({ fundraiser, onClose, onSuccess }: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'crypto' | 'amount' | 'details' | 'payment' | 'success'>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoNetwork>(SUPPORTED_CRYPTOS[3]); // Default to Polygon USDC
  const [txHash, setTxHash] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const presetAmounts = [10, 25, 50, 100, 250, 500];
  
  const donationAmount = parseFloat(amount) || 0;
  const platformFee = donationAmount > 0 ? calculatePlatformFee(donationAmount) : 0;
  const netToFundraiser = donationAmount > 0 ? calculateNetAmount(donationAmount) : 0;

  useEffect(() => {
    checkWalletConnection();
  }, []);

  async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to donate with crypto!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Switch to Polygon network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }], // 137 in hex
        });
      } catch (switchError: any) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/']
            }]
          });
        }
      }

      setWalletConnected(true);
      setWalletAddress(accounts[0]);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDonate() {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    try {
      setLoading(true);
      setStep('payment');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

      // Validate platform wallet is configured
      if (!selectedCrypto.platformWallet) {
        alert('Platform wallet not configured for ' + selectedCrypto.name);
        throw new Error('Platform wallet not configured');
      }

      // EVM-based cryptocurrencies (Ethereum, Polygon, Base, BNB)
      if (selectedCrypto.chainId) {
        // Switch to correct network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: selectedCrypto.chainId }],
          });
        } catch (switchError: any) {
          // If chain doesn't exist, add it
          if (switchError.code === 4902 && selectedCrypto.rpcUrl) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: selectedCrypto.chainId,
                chainName: selectedCrypto.name,
                nativeCurrency: {
                  name: selectedCrypto.symbol,
                  symbol: selectedCrypto.symbol,
                  decimals: selectedCrypto.decimals
                },
                rpcUrls: [selectedCrypto.rpcUrl],
                blockExplorerUrls: [selectedCrypto.explorerUrl]
              }]
            });
          }
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        let tx;
        if (selectedCrypto.tokenAddress) {
          // It's a token (like USDC)
          const tokenContract = new ethers.Contract(selectedCrypto.tokenAddress, ERC20_ABI, signer);
          const amountInToken = ethers.utils.parseUnits(amount, selectedCrypto.decimals);
          tx = await tokenContract.transfer(selectedCrypto.platformWallet, amountInToken);
        } else {
          // It's native currency (ETH, MATIC, BNB)
          const amountInWei = ethers.utils.parseUnits(amount, selectedCrypto.decimals);
          tx = await signer.sendTransaction({
            to: selectedCrypto.platformWallet,
            value: amountInWei,
          });
        }

        const receipt = await tx.wait();
        setTxHash(receipt.transactionHash);

        // Save to database
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        const donationAmount = parseFloat(amount);
        const platformFee = calculatePlatformFee(donationAmount);
        const netAmount = calculateNetAmount(donationAmount);
        
        await supabase.from('donations').insert([
          {
            fundraiser_id: fundraiser.id,
            user_id: user?.id || null,
            amount: donationAmount,
            platform_fee: platformFee,
            net_amount: netAmount,
            currency: selectedCrypto.symbol,
            donor_name: isAnonymous ? null : (donorName || 'Anonymous'),
            message: message || null,
            is_anonymous: isAnonymous,
            transaction_hash: receipt.transactionHash,
            wallet_address: walletAddress,
            blockchain: selectedCrypto.id,
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          },
        ]);
      } else {
        // Bitcoin and Solana - different wallet connectors
        if (selectedCrypto.id === 'solana') {
          const wallet = await connectPhantomWallet();
          if (!wallet) throw new Error('Failed to connect Phantom wallet');

          const signature = await sendSolanaTransaction(
            wallet,
            selectedCrypto.platformWallet,
            parseFloat(amount)
          );
          
          setTxHash(signature);

          // Save to database
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          const donationAmount = parseFloat(amount);
          const platformFee = calculatePlatformFee(donationAmount);
          const netAmount = calculateNetAmount(donationAmount);
          
          await supabase.from('donations').insert([
            {
              fundraiser_id: fundraiser.id,
              user_id: user?.id || null,
              amount: donationAmount,
              platform_fee: platformFee,
              net_amount: netAmount,
              currency: 'SOL',
              donor_name: isAnonymous ? null : (donorName || 'Anonymous'),
              message: message || null,
              is_anonymous: isAnonymous,
              transaction_hash: signature,
              wallet_address: wallet.publicKey?.toString() || '',
              blockchain: 'solana',
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
            },
          ]);
        } else if (selectedCrypto.id === 'bitcoin') {
          const wallet = await connectUnisatWallet();
          if (!wallet) throw new Error('Failed to connect Bitcoin wallet');

          const amountSats = btcToSatoshis(parseFloat(amount));
          const txid = await wallet.sendBitcoin(selectedCrypto.platformWallet, amountSats);
          
          setTxHash(txid);

          // Save to database
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          const donationAmount = parseFloat(amount);
          const platformFee = calculatePlatformFee(donationAmount);
          const netAmount = calculateNetAmount(donationAmount);
          
          await supabase.from('donations').insert([
            {
              fundraiser_id: fundraiser.id,
              user_id: user?.id || null,
              amount: donationAmount,
              platform_fee: platformFee,
              net_amount: netAmount,
              currency: 'BTC',
              donor_name: isAnonymous ? null : (donorName || 'Anonymous'),
              message: message || null,
              is_anonymous: isAnonymous,
              transaction_hash: txid,
              wallet_address: wallet.address,
              blockchain: 'bitcoin',
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
            },
          ]);
        }
      }

      // Save donation to database with fee tracking
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('donations').insert([
        {
          fundraiser_id: fundraiser.id,
          user_id: user?.id || null,
          amount: donationAmount,
          platform_fee: platformFee,
          net_amount: netAmount,
          currency: 'USDC',
          donor_name: isAnonymous ? null : (donorName || 'Anonymous'),
          message: message || null,
          is_anonymous: isAnonymous,
          transaction_hash: receipt.transactionHash,
          wallet_address: walletAddress,
          blockchain: 'polygon',
          status: 'confirmed',
          escrow_status: 'held',
          confirmed_at: new Date().toISOString(),
        },
      ]);

      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error: any) {
      console.error('Error processing donation:', error);
      alert('Donation failed: ' + (error.message || 'Unknown error'));
      setStep('details');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <IconX size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-2">Make a Donation</h2>
          <p className="text-white/90 text-sm">{fundraiser.title}</p>
        </div>

        <div className="p-6">
          {/* Step 0: Select Cryptocurrency */}
          {step === 'crypto' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  Select Cryptocurrency
                </label>
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {SUPPORTED_CRYPTOS.map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => {
                        setSelectedCrypto(crypto);
                        setStep('amount');
                      }}
                      className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-green-500 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{crypto.logo}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{crypto.name}</div>
                          <div className="text-sm text-gray-500">{crypto.symbol}</div>
                        </div>
                      </div>
                      <IconChevronDown size={20} className="text-gray-400 rotate-[-90deg]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Amount */}
          {step === 'amount' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setStep('crypto')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  ← Change Crypto
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">{selectedCrypto.logo}</span>
                  <span className="font-semibold">{selectedCrypto.symbol}</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  Choose Amount ({selectedCrypto.symbol})
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        amount === preset.toString()
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                    min="1"
                    step="0.01"
                  />
                </div>
                {donationAmount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Amount to fundraiser:</span>
                      <span className="font-bold text-green-600 text-lg">${netToFundraiser.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Your ${donationAmount.toFixed(2)} donation will help make a difference!
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setStep('details')}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-green-700">
                  ${parseFloat(amount).toLocaleString()} {selectedCrypto.symbol}
                </div>
                <div className="text-sm text-green-600 space-y-1">
                  <div>Your generous donation</div>
                  <div className="text-xs font-semibold text-green-700 mt-2">
                    ${netToFundraiser.toFixed(2)} will go to the fundraiser
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    💰 Funds held in secure escrow until KYC verification
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded"
                  />
                  <span className="text-gray-700">Donate anonymously</span>
                </label>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Leave a Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Words of encouragement..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('amount')}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleDonate}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 inline-flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : (
                    <>
                      <IconWallet size={20} />
                      {walletConnected ? 'Donate Now' : 'Connect Wallet'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Processing */}
          {step === 'payment' && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Transaction...</h3>
              <p className="text-gray-600">Please confirm in your wallet</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCheck size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">Your donation was successful</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                <a
                  href={`https://polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-green-600 hover:underline break-all"
                >
                  {txHash}
                </a>
              </div>
              <p className="text-sm text-gray-500">Closing in 3 seconds...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
