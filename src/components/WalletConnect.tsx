'use client'

import { useState, useEffect } from 'react'
import { connectWallet, getCurrentWallet, switchToPolygon, isOnPolygon } from '@/lib/wallet'

type WalletConnectProps = {
  onConnect?: (address: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    checkWallet()
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange)
      window.ethereum.on('chainChanged', handleNetworkChange)
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange)
        window.ethereum.removeListener('chainChanged', handleNetworkChange)
      }
    }
  }, [])

  async function checkWallet() {
    const address = await getCurrentWallet()
    setWalletAddress(address)
    
    if (address) {
      const onPolygon = await isOnPolygon()
      setIsCorrectNetwork(onPolygon)
    }
  }

  function handleAccountChange(accounts: string[]) {
    if (accounts.length === 0) {
      setWalletAddress(null)
    } else {
      setWalletAddress(accounts[0])
      if (onConnect) onConnect(accounts[0])
    }
  }

  async function handleNetworkChange() {
    const onPolygon = await isOnPolygon()
    setIsCorrectNetwork(onPolygon)
  }

  async function handleConnect() {
    setConnecting(true)
    try {
      const address = await connectWallet()
      if (address) {
        setWalletAddress(address)
        
        // Check if on Polygon
        const onPolygon = await isOnPolygon()
        setIsCorrectNetwork(onPolygon)
        
        if (onConnect) onConnect(address)
      }
    } catch (error) {
      console.error('Connection error:', error)
    } finally {
      setConnecting(false)
    }
  }

  async function handleSwitchNetwork() {
    const switched = await switchToPolygon()
    if (switched) {
      setIsCorrectNetwork(true)
    }
  }

  if (walletAddress) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 mb-1">Connected Wallet</div>
            <div className="text-sm font-mono text-white">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          </div>
        </div>

        {!isCorrectNetwork && (
          <button
            onClick={handleSwitchNetwork}
            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all"
          >
            ⚠️ Switch to Polygon Network
          </button>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed"
    >
      {connecting ? (
        <span className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          Connecting...
        </span>
      ) : (
        '🦊 Connect Wallet'
      )}
    </button>
  )
}
