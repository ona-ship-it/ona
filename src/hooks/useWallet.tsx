'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from './useAuth'

// Ethereum Networks
const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrls: ['https://eth.llamarpc.com'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://etherscan.io'],
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    rpcUrls: ['https://polygon-rpc.com'],
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  base: {
    chainId: '0x2105',
    chainName: 'Base',
    rpcUrls: ['https://mainnet.base.org'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://basescan.org'],
  },
}

type WalletType = 'metamask' | 'phantom' | null
type Network = 'ethereum' | 'polygon' | 'solana' | 'base'

interface WalletContextType {
  // Connection state
  isConnected: boolean
  walletType: WalletType
  address: string | null
  network: Network | null
  balance: string | null
  
  // Actions
  connectMetaMask: (network?: Network) => Promise<void>
  connectPhantom: () => Promise<void>
  disconnect: () => void
  switchNetwork: (network: Network) => Promise<void>
  
  // Loading & errors
  connecting: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  const [isConnected, setIsConnected] = useState(false)
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<Network | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallets are installed
  const hasMetaMask = typeof window !== 'undefined' && 'ethereum' in window
  const hasPhantom = typeof window !== 'undefined' && 'solana' in window

  // Connect MetaMask
  const connectMetaMask = async (targetNetwork: Network = 'ethereum') => {
    if (!hasMetaMask) {
      setError('MetaMask not installed. Please install MetaMask extension.')
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      const ethereum = (window as any).ethereum

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]

      // Switch to target network
      if (targetNetwork !== 'solana') {
        await switchToNetwork(targetNetwork)
      }

      // Get balance
      const balanceWei = await ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      })
      const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4)

      setAddress(account)
      setWalletType('metamask')
      setNetwork(targetNetwork)
      setBalance(balanceEth)
      setIsConnected(true)

      // Listen for account changes
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)

    } catch (err: any) {
      console.error('MetaMask connection error:', err)
      setError(err.message || 'Failed to connect MetaMask')
    } finally {
      setConnecting(false)
    }
  }

  // Connect Phantom (Solana)
  const connectPhantom = async () => {
    if (!hasPhantom) {
      setError('Phantom wallet not installed. Please install Phantom extension.')
      window.open('https://phantom.app/', '_blank')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      const phantom = (window as any).solana

      if (!phantom.isPhantom) {
        throw new Error('Phantom wallet not found')
      }

      const response = await phantom.connect()
      const publicKey = response.publicKey.toString()

      // Get SOL balance
      const connection = new (window as any).solanaWeb3.Connection(
        'https://api.mainnet-beta.solana.com'
      )
      const balanceLamports = await connection.getBalance(response.publicKey)
      const balanceSOL = (balanceLamports / 1e9).toFixed(4)

      setAddress(publicKey)
      setWalletType('phantom')
      setNetwork('solana')
      setBalance(balanceSOL)
      setIsConnected(true)

      // Listen for disconnection
      phantom.on('disconnect', () => {
        disconnect()
      })

    } catch (err: any) {
      console.error('Phantom connection error:', err)
      setError(err.message || 'Failed to connect Phantom')
    } finally {
      setConnecting(false)
    }
  }

  // Switch network (MetaMask only)
  const switchNetwork = async (targetNetwork: Network) => {
    if (walletType !== 'metamask') return

    try {
      const ethereum = (window as any).ethereum
      const networkConfig = NETWORKS[targetNetwork as keyof typeof NETWORKS]

      if (!networkConfig) {
        throw new Error('Network not supported')
      }

      try {
        // Try to switch to the network
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainId }],
        })
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          })
        } else {
          throw switchError
        }
      }

      setNetwork(targetNetwork)

      // Update balance
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts[0]) {
        const balanceWei = await ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        })
        const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4)
        setBalance(balanceEth)
      }

    } catch (err: any) {
      console.error('Network switch error:', err)
      setError(err.message || 'Failed to switch network')
    }
  }

  // Helper function to switch to specific network
  const switchToNetwork = async (targetNetwork: Network) => {
    const networkConfig = NETWORKS[targetNetwork as keyof typeof NETWORKS]
    if (!networkConfig) return

    const ethereum = (window as any).ethereum

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        })
      }
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    if (walletType === 'phantom') {
      const phantom = (window as any).solana
      if (phantom) {
        phantom.disconnect()
      }
    }

    setIsConnected(false)
    setWalletType(null)
    setAddress(null)
    setNetwork(null)
    setBalance(null)
    setError(null)
  }

  // Handle MetaMask account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAddress(accounts[0])
      // Refresh balance
      connectMetaMask(network || 'ethereum')
    }
  }

  // Handle MetaMask network changes
  const handleChainChanged = () => {
    // Reload to avoid state issues
    window.location.reload()
  }

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (hasMetaMask) {
        const ethereum = (window as any).ethereum
        ethereum?.removeListener('accountsChanged', handleAccountsChanged)
        ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const value: WalletContextType = {
    isConnected,
    walletType,
    address,
    network,
    balance,
    connectMetaMask,
    connectPhantom,
    disconnect,
    switchNetwork,
    connecting,
    error,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
