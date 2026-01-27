import { ethers } from 'ethers'

// Contract ABI (generated after compilation)
export const RAFFLE_ESCROW_ABI = [
  "function createRaffle(bytes32 raffleId, uint256 prizeValue, uint256 totalTickets, uint256 ticketPrice) external",
  "function purchaseTickets(bytes32 raffleId, uint256 ticketCount) external",
  "function completeRaffle(bytes32 raffleId, address winner) external",
  "function cancelRaffle(bytes32 raffleId) external",
  "function claimRefund(bytes32 raffleId) external",
  "function getRaffle(bytes32 raffleId) external view returns (tuple(address creator, uint256 prizeValue, uint256 totalTickets, uint256 ticketsSold, uint256 ticketPrice, uint256 totalFunds, uint256 cancellationFee, bool isActive, bool isCancelled, bool isCompleted, address winner, uint256 createdAt, uint256 completedAt))",
  "function getContribution(bytes32 raffleId, address buyer) external view returns (uint256)",
  "function platformFeesCollected() external view returns (uint256)",
  "event RaffleCreated(bytes32 indexed raffleId, address indexed creator, uint256 prizeValue, uint256 totalTickets, uint256 ticketPrice)",
  "event TicketsPurchased(bytes32 indexed raffleId, address indexed buyer, uint256 amount, uint256 ticketCount)",
  "event WinnerSelected(bytes32 indexed raffleId, address indexed winner, uint256 prizeAmount)",
  "event RaffleCancelled(bytes32 indexed raffleId, uint256 refundAmount)",
  "event FundsReleased(bytes32 indexed raffleId, address indexed creator, uint256 amount)"
]

// USDC ABI (minimal for approve/transfer)
export const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
]

// Contract addresses
export const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || ''
export const USDC_ADDRESS_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
export const USDC_ADDRESS_MUMBAI = '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23'

/**
 * Get escrow contract instance
 */
export function getEscrowContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, RAFFLE_ESCROW_ABI, signerOrProvider)
}

/**
 * Get USDC contract instance
 */
export function getUSDCContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number = 137) {
  const usdcAddress = chainId === 137 ? USDC_ADDRESS_POLYGON : USDC_ADDRESS_MUMBAI
  return new ethers.Contract(usdcAddress, USDC_ABI, signerOrProvider)
}

/**
 * Convert raffle ID to bytes32
 */
export function raffleIdToBytes32(raffleId: string): string {
  return ethers.id(raffleId)
}

/**
 * Format USDC amount (6 decimals)
 */
export function formatUSDC(amount: bigint): string {
  return ethers.formatUnits(amount, 6)
}

/**
 * Parse USDC amount (6 decimals)
 */
export function parseUSDC(amount: string): bigint {
  return ethers.parseUnits(amount, 6)
}

/**
 * Create raffle on-chain
 */
export async function createRaffleOnChain(
  signer: ethers.Signer,
  raffleId: string,
  prizeValue: number,
  totalTickets: number,
  ticketPrice: number
) {
  const escrow = getEscrowContract(signer)
  const usdc = getUSDCContract(signer)
  
  const raffleIdBytes = raffleIdToBytes32(raffleId)
  const prizeValueWei = parseUSDC(prizeValue.toString())
  const ticketPriceWei = parseUSDC(ticketPrice.toString())
  
  // Calculate cancellation fee (2%)
  const cancellationFee = prizeValueWei * 2n / 100n
  
  // Approve USDC
  const approveTx = await usdc.approve(ESCROW_CONTRACT_ADDRESS, cancellationFee)
  await approveTx.wait()
  
  // Create raffle
  const tx = await escrow.createRaffle(
    raffleIdBytes,
    prizeValueWei,
    totalTickets,
    ticketPriceWei
  )
  
  const receipt = await tx.wait()
  return receipt
}

/**
 * Purchase raffle tickets on-chain
 */
export async function purchaseTicketsOnChain(
  signer: ethers.Signer,
  raffleId: string,
  ticketCount: number,
  ticketPrice: number
) {
  const escrow = getEscrowContract(signer)
  const usdc = getUSDCContract(signer)
  
  const raffleIdBytes = raffleIdToBytes32(raffleId)
  const totalAmount = parseUSDC((ticketCount * ticketPrice).toString())
  
  // Approve USDC
  const approveTx = await usdc.approve(ESCROW_CONTRACT_ADDRESS, totalAmount)
  await approveTx.wait()
  
  // Purchase tickets
  const tx = await escrow.purchaseTickets(raffleIdBytes, ticketCount)
  const receipt = await tx.wait()
  
  return receipt
}

/**
 * Get raffle details from contract
 */
export async function getRaffleFromChain(
  provider: ethers.Provider,
  raffleId: string
) {
  const escrow = getEscrowContract(provider)
  const raffleIdBytes = raffleIdToBytes32(raffleId)
  
  const raffle = await escrow.getRaffle(raffleIdBytes)
  
  return {
    creator: raffle.creator,
    prizeValue: formatUSDC(raffle.prizeValue),
    totalTickets: Number(raffle.totalTickets),
    ticketsSold: Number(raffle.ticketsSold),
    ticketPrice: formatUSDC(raffle.ticketPrice),
    totalFunds: formatUSDC(raffle.totalFunds),
    cancellationFee: formatUSDC(raffle.cancellationFee),
    isActive: raffle.isActive,
    isCancelled: raffle.isCancelled,
    isCompleted: raffle.isCompleted,
    winner: raffle.winner,
    createdAt: Number(raffle.createdAt),
    completedAt: Number(raffle.completedAt)
  }
}

/**
 * Check if user needs to approve USDC
 */
export async function checkUSDCApproval(
  signer: ethers.Signer,
  amount: number
): Promise<boolean> {
  const usdc = getUSDCContract(signer)
  const address = await signer.getAddress()
  const amountWei = parseUSDC(amount.toString())
  
  const allowance = await usdc.allowance(address, ESCROW_CONTRACT_ADDRESS)
  return allowance >= amountWei
}

/**
 * Get user's USDC balance
 */
export async function getUSDCBalance(
  provider: ethers.Provider,
  address: string
): Promise<string> {
  const usdc = getUSDCContract(provider)
  const balance = await usdc.balanceOf(address)
  return formatUSDC(balance)
}
