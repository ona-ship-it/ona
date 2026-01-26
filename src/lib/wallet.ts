// Wallet Integration for USDC Payments
import { ethers } from 'ethers'

// USDC Contract Address (Polygon Mainnet)
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

// USDC ABI (minimal for transfer)
const USDC_ABI = [
  'function transfer(address to, address recipient, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

// Platform wallet address (where payments go)
const PLATFORM_WALLET = '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428' // Polygon/Ethereum/Base/BNB

export async function connectWallet(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    alert('Please install MetaMask or another Web3 wallet')
    return null
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    return accounts[0]
  } catch (error) {
    console.error('Error connecting wallet:', error)
    return null
  }
}

export async function getUSDCBalance(walletAddress: string): Promise<number> {
  if (typeof window === 'undefined' || !window.ethereum) return 0

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider)
    
    const balance = await usdcContract.balanceOf(walletAddress)
    const decimals = await usdcContract.decimals()
    
    return Number(ethers.formatUnits(balance, decimals))
  } catch (error) {
    console.error('Error getting USDC balance:', error)
    return 0
  }
}

export async function payWithUSDC(
  amount: number,
  recipient: string = PLATFORM_WALLET
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return { success: false, error: 'No wallet detected' }
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer)

    // USDC has 6 decimals
    const amountInWei = ethers.parseUnits(amount.toString(), 6)

    // Send USDC
    const tx = await usdcContract.transfer(recipient, amountInWei)
    
    // Wait for confirmation
    await tx.wait()

    return {
      success: true,
      txHash: tx.hash,
    }
  } catch (error: any) {
    console.error('Payment error:', error)
    return {
      success: false,
      error: error.message || 'Payment failed',
    }
  }
}

export async function switchToPolygon(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) return false

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }], // Polygon Mainnet
    })
    return true
  } catch (error: any) {
    // Chain not added, try to add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
          ],
        })
        return true
      } catch (addError) {
        console.error('Error adding Polygon network:', addError)
        return false
      }
    }
    return false
  }
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
