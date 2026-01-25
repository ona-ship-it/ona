// USDC Contract Addresses
export const USDC_ADDRESSES = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
}

// USDC Token ABI (minimal - just what we need)
export const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
]

// Platform wallet address (replace with your actual wallet)
export const PLATFORM_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'

type Network = 'ethereum' | 'polygon' | 'base'

interface PaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}

export class USDCPaymentProcessor {
  private ethereum: any

  constructor() {
    if (typeof window !== 'undefined') {
      this.ethereum = (window as any).ethereum
    }
  }

  /**
   * Get USDC balance for an address
   */
  async getBalance(userAddress: string, network: Network): Promise<number> {
    try {
      const contractAddress = USDC_ADDRESSES[network]
      
      const data = this.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data: this.encodeBalanceOf(userAddress),
          },
          'latest',
        ],
      })

      const balance = await data
      // USDC has 6 decimals
      return parseInt(balance, 16) / 1e6
    } catch (error) {
      console.error('Error getting USDC balance:', error)
      return 0
    }
  }

  /**
   * Check if user has approved USDC spending
   */
  async checkAllowance(
    userAddress: string,
    network: Network
  ): Promise<number> {
    try {
      const contractAddress = USDC_ADDRESSES[network]

      const data = await this.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data: this.encodeAllowance(userAddress, PLATFORM_WALLET),
          },
          'latest',
        ],
      })

      return parseInt(data, 16) / 1e6
    } catch (error) {
      console.error('Error checking allowance:', error)
      return 0
    }
  }

  /**
   * Approve USDC spending
   */
  async approveUSDC(
    userAddress: string,
    amount: number,
    network: Network
  ): Promise<PaymentResult> {
    try {
      const contractAddress = USDC_ADDRESSES[network]
      const amountInSmallestUnit = Math.floor(amount * 1e6)

      const txHash = await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: userAddress,
            to: contractAddress,
            data: this.encodeApprove(PLATFORM_WALLET, amountInSmallestUnit),
          },
        ],
      })

      // Wait for transaction confirmation
      await this.waitForTransaction(txHash)

      return {
        success: true,
        transactionHash: txHash,
      }
    } catch (error: any) {
      console.error('Approval error:', error)
      return {
        success: false,
        error: error.message || 'Failed to approve USDC',
      }
    }
  }

  /**
   * Transfer USDC to platform wallet
   */
  async transferUSDC(
    userAddress: string,
    amount: number,
    network: Network
  ): Promise<PaymentResult> {
    try {
      const contractAddress = USDC_ADDRESSES[network]
      const amountInSmallestUnit = Math.floor(amount * 1e6)

      const txHash = await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: userAddress,
            to: contractAddress,
            data: this.encodeTransfer(PLATFORM_WALLET, amountInSmallestUnit),
          },
        ],
      })

      // Wait for transaction confirmation
      await this.waitForTransaction(txHash)

      return {
        success: true,
        transactionHash: txHash,
      }
    } catch (error: any) {
      console.error('Transfer error:', error)
      return {
        success: false,
        error: error.message || 'Failed to transfer USDC',
      }
    }
  }

  /**
   * Complete payment flow: check balance, approve if needed, transfer
   */
  async processPayment(
    userAddress: string,
    amount: number,
    network: Network,
    onStatusUpdate: (status: string) => void
  ): Promise<PaymentResult> {
    try {
      // Step 1: Check USDC balance
      onStatusUpdate('Checking USDC balance...')
      const balance = await this.getBalance(userAddress, network)

      if (balance < amount) {
        return {
          success: false,
          error: `Insufficient USDC balance. You have ${balance.toFixed(2)} USDC, but need ${amount} USDC.`,
        }
      }

      // Step 2: Check allowance
      onStatusUpdate('Checking token allowance...')
      const allowance = await this.checkAllowance(userAddress, network)

      // Step 3: Approve if needed
      if (allowance < amount) {
        onStatusUpdate('Requesting token approval...')
        const approvalResult = await this.approveUSDC(userAddress, amount, network)

        if (!approvalResult.success) {
          return approvalResult
        }

        onStatusUpdate('Approval confirmed!')
      }

      // Step 4: Transfer USDC
      onStatusUpdate('Processing payment...')
      const transferResult = await this.transferUSDC(userAddress, amount, network)

      if (transferResult.success) {
        onStatusUpdate('Payment successful!')
      }

      return transferResult
    } catch (error: any) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      }
    }
  }

  /**
   * Wait for transaction to be mined
   */
  private async waitForTransaction(txHash: string): Promise<void> {
    let attempts = 0
    const maxAttempts = 60 // 60 attempts = ~1 minute

    while (attempts < maxAttempts) {
      try {
        const receipt = await this.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })

        if (receipt && receipt.status === '0x1') {
          return
        }

        if (receipt && receipt.status === '0x0') {
          throw new Error('Transaction failed')
        }
      } catch (error) {
        // Transaction not yet mined, continue waiting
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }

    throw new Error('Transaction confirmation timeout')
  }

  // Encoding helpers
  private encodeBalanceOf(address: string): string {
    const methodId = '0x70a08231' // balanceOf(address)
    const paddedAddress = address.slice(2).padStart(64, '0')
    return methodId + paddedAddress
  }

  private encodeAllowance(owner: string, spender: string): string {
    const methodId = '0xdd62ed3e' // allowance(address,address)
    const paddedOwner = owner.slice(2).padStart(64, '0')
    const paddedSpender = spender.slice(2).padStart(64, '0')
    return methodId + paddedOwner + paddedSpender
  }

  private encodeApprove(spender: string, amount: number): string {
    const methodId = '0x095ea7b3' // approve(address,uint256)
    const paddedSpender = spender.slice(2).padStart(64, '0')
    const paddedAmount = amount.toString(16).padStart(64, '0')
    return methodId + paddedSpender + paddedAmount
  }

  private encodeTransfer(to: string, amount: number): string {
    const methodId = '0xa9059cbb' // transfer(address,uint256)
    const paddedTo = to.slice(2).padStart(64, '0')
    const paddedAmount = amount.toString(16).padStart(64, '0')
    return methodId + paddedTo + paddedAmount
  }
}

export const paymentProcessor = new USDCPaymentProcessor()
