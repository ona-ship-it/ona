'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import Image from 'next/image'

type Network = 'ethereum' | 'polygon' | 'solana' | 'base'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletType: 'metamask' | 'phantom', network: Network) => void
  requiredNetwork?: Network
}

export default function WalletModal({ isOpen, onClose, onConnect, requiredNetwork }: WalletModalProps) {
  const { connectMetaMask, connectPhantom, connecting, error } = useWallet()
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(requiredNetwork || 'ethereum')
  const [step, setStep] = useState<'wallet' | 'network'>('wallet')

  if (!isOpen) return null

  const handleMetaMaskClick = () => {
    if (requiredNetwork) {
      // If network is required, connect directly
      handleConnect('metamask', requiredNetwork)
    } else {
      // Otherwise show network selection
      setStep('network')
    }
  }

  const handlePhantomClick = () => {
    handleConnect('phantom', 'solana')
  }

  const handleConnect = async (wallet: 'metamask' | 'phantom', network: Network) => {
    try {
      if (wallet === 'metamask') {
        await connectMetaMask(network)
      } else {
        await connectPhantom()
      }
      onConnect(wallet, network)
      onClose()
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {step === 'wallet' ? 'Connect Wallet' : 'Select Network'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Choose Wallet */}
        {step === 'wallet' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-6">
              Choose your preferred wallet to connect and participate in giveaways
            </p>

            {/* MetaMask */}
            <button
              onClick={handleMetaMaskClick}
              disabled={connecting}
              className="w-full group"
            >
              <div className="p-6 bg-gradient-to-r from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 border-2 border-orange-500/30 hover:border-orange-500/50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-orange-500/50">
                    🦊
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      MetaMask
                    </h3>
                    <p className="text-sm text-slate-400">
                      Ethereum, Polygon, Base
                    </p>
                  </div>
                  <div className="text-slate-600 group-hover:text-orange-500 transition-colors text-2xl">
                    →
                  </div>
                </div>
              </div>
            </button>

            {/* Phantom */}
            <button
              onClick={handlePhantomClick}
              disabled={connecting}
              className="w-full group"
            >
              <div className="p-6 bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border-2 border-purple-500/30 hover:border-purple-500/50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-purple-500/50">
                    👻
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      Phantom
                    </h3>
                    <p className="text-sm text-slate-400">
                      Solana Network
                    </p>
                  </div>
                  <div className="text-slate-600 group-hover:text-purple-500 transition-colors text-2xl">
                    →
                  </div>
                </div>
              </div>
            </button>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-slate-400">
                💡 <span className="text-blue-400 font-semibold">New to crypto?</span> Install{' '}
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 underline"
                >
                  MetaMask
                </a>{' '}
                or{' '}
                <a
                  href="https://phantom.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Phantom
                </a>{' '}
                to get started
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Choose Network (MetaMask only) */}
        {step === 'network' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('wallet')}
              className="text-slate-400 hover:text-white text-sm flex items-center gap-2 mb-4"
            >
              ← Back
            </button>

            <p className="text-slate-400 text-sm mb-6">
              Select the blockchain network you want to use
            </p>

            {/* Ethereum */}
            <button
              onClick={() => handleConnect('metamask', 'ethereum')}
              disabled={connecting}
              className="w-full p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⟠</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    Ethereum
                  </h4>
                  <p className="text-sm text-slate-400">ETH, USDC</p>
                </div>
              </div>
            </button>

            {/* Polygon */}
            <button
              onClick={() => handleConnect('metamask', 'polygon')}
              disabled={connecting}
              className="w-full p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔷</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                    Polygon
                  </h4>
                  <p className="text-sm text-slate-400">MATIC, USDC (Lower fees)</p>
                </div>
              </div>
            </button>

            {/* Base */}
            <button
              onClick={() => handleConnect('metamask', 'base')}
              disabled={connecting}
              className="w-full p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔵</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    Base
                  </h4>
                  <p className="text-sm text-slate-400">ETH, USDC (Low fees)</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Loading State */}
        {connecting && (
          <div className="mt-6 flex items-center justify-center gap-3 text-blue-400">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Connecting...</span>
          </div>
        )}

        {/* Cancel Button */}
        {!connecting && (
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
