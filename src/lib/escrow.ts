import { ethers } from 'ethers'

const ESCROW_ABI = [
  "function createRaffle(bytes32 raffleId, uint256 prizeValue, uint256 totalTickets, uint256 ticketPrice) external",
  "function purchaseTickets(bytes32 raffleId, uint256 ticketCount) external",
  "function completeRaffle(bytes32 raffleId, address winner) external",
  "function cancelRaffle(bytes32 raffleId) external",
  "function claimRefund(bytes32 raffleId) external",
  "function getRaffle(bytes32 raffleId) external view returns (tuple(address creator, uint256 prizeValue, uint256 totalTickets, uint256 ticketsSold, uint256 ticketPrice, uint256 totalFunds, uint256 cancellationFee, bool isActive, bool isCancelled, bool isCompleted, address winner, uint256 createdAt, uint256 completedAt))",
  "function getContribution(bytes32 raffleId, address buyer) external view returns (uint256)"
]

const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS!
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

// Get contract instance
export function getEscrowContract(signer?: ethers.Signer) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Web3 provider')
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const contractSigner = signer || provider.getSigner()
  
  return new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, contractSigner)
}

// Create raffle with escrow
export async function createRaffleEscrow(
  raffleId: string,
  prizeValue: number,
  totalTickets: number,
  ticketPrice: number
) {
  try {
    const contract = getEscrowContract()
    
    // Convert raffle ID to bytes32
    const raffleIdBytes = ethers.utils.formatBytes32String(raffleId)
    
    // Convert amounts to proper units (USDC has 6 decimals)
    const prizeValueWei = ethers.utils.parseUnits(prizeValue.toString(), 6)
    const ticketPriceWei = ethers.utils.parseUnits(ticketPrice.toString(), 6)
    
    // First approve cancellation fee
    const cancellationFee = prizeValueWei.mul(200).div(10000) // 2%
    
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ['function approve(address spender, uint256 amount) external returns (bool)'],
      contract.signer
    )
    
    const approveTx = await usdcContract.approve(ESCROW_ADDRESS, cancellationFee)
    await approveTx.wait()
    
    // Create raffle
    const tx = await contract.createRaffle(
      raffleIdBytes,
      prizeValueWei,
      totalTickets,
      ticketPriceWei
    )
    
    const receipt = await tx.wait()
    
    return {
      success: true,
      txHash: receipt.transactionHash,
    }
  } catch (error: any) {
    console.error('Escrow create error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Purchase tickets via escrow
export async function purchaseTicketsEscrow(
  raffleId: string,
  ticketCount: number,
  totalAmount: number
) {
  try {
    const contract = getEscrowContract()
    
    const raffleIdBytes = ethers.utils.formatBytes32String(raffleId)
    const amountWei = ethers.utils.parseUnits(totalAmount.toString(), 6)
    
    // Approve USDC spending
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ['function approve(address spender, uint256 amount) external returns (bool)'],
      contract.signer
    )
    
    const approveTx = await usdcContract.approve(ESCROW_ADDRESS, amountWei)
    await approveTx.wait()
    
    // Purchase tickets
    const tx = await contract.purchaseTickets(raffleIdBytes, ticketCount)
    const receipt = await tx.wait()
    
    return {
      success: true,
      txHash: receipt.transactionHash,
    }
  } catch (error: any) {
    console.error('Ticket purchase error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Get raffle details from escrow
export async function getRaffleEscrowDetails(raffleId: string) {
  try {
    const contract = getEscrowContract()
    const raffleIdBytes = ethers.utils.formatBytes32String(raffleId)
    
    const raffle = await contract.getRaffle(raffleIdBytes)
    
    return {
      creator: raffle.creator,
      prizeValue: ethers.utils.formatUnits(raffle.prizeValue, 6),
      totalTickets: raffle.totalTickets.toNumber(),
      ticketsSold: raffle.ticketsSold.toNumber(),
      ticketPrice: ethers.utils.formatUnits(raffle.ticketPrice, 6),
      totalFunds: ethers.utils.formatUnits(raffle.totalFunds, 6),
      isActive: raffle.isActive,
      isCancelled: raffle.isCancelled,
      isCompleted: raffle.isCompleted,
      winner: raffle.winner,
    }
  } catch (error) {
    console.error('Get raffle error:', error)
    return null
  }
}

// Claim refund if raffle cancelled
export async function claimRaffleRefund(raffleId: string) {
  try {
    const contract = getEscrowContract()
    const raffleIdBytes = ethers.utils.formatBytes32String(raffleId)
    
    const tx = await contract.claimRefund(raffleIdBytes)
    const receipt = await tx.wait()
    
    return {
      success: true,
      txHash: receipt.transactionHash,
    }
  } catch (error: any) {
    console.error('Refund claim error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
