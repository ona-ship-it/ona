// src/lib/giveaway-revenue.ts
// Revenue calculation and distribution logic for paid ticket giveaways

import { PaidTicketGiveaway, RevenueDistribution, TicketPurchase } from '@/types/giveaway'

/**
 * Calculate revenue distribution when tickets are sold
 */
export function calculateRevenueDistribution(
  giveaway: PaidTicketGiveaway,
  totalTicketsSold: number,
  ticketPrice: number
): RevenueDistribution {
  // Total revenue from ticket sales
  const totalTicketRevenue = totalTicketsSold * ticketPrice

  // Revenue split:
  // 50% to ONAGUI platform
  const onaguiAmount = totalTicketRevenue * 0.5

  // 40% to additional winners pool
  const additionalWinnersPool = totalTicketRevenue * 0.4

  // 10% to creator as commission (ONAGUI subs)
  const creatorCommission = totalTicketRevenue * 0.1

  // Calculate prize per additional winner (if any)
  let winnersCount = giveaway.additional_winners_count || 0
  let prizePerWinner = 0

  if (winnersCount > 0 && giveaway.additional_winners_distribution === 'multiple') {
    prizePerWinner = additionalWinnersPool / winnersCount
  } else if (winnersCount === 1 && giveaway.additional_winners_distribution === 'single') {
    prizePerWinner = additionalWinnersPool
  }

  return {
    giveaway_id: giveaway.id,
    total_ticket_revenue: totalTicketRevenue,
    onagui_amount: onaguiAmount,
    onagui_status: 'pending',
    additional_winners_pool: additionalWinnersPool,
    winners_count: winnersCount,
    prize_per_winner: prizePerWinner,
    winners_status: 'pending',
    creator_commission: creatorCommission,
    creator_commission_status: 'pending',
    calculated_at: new Date(),
  }
}

/**
 * Update giveaway prize pool after ticket purchase
 */
export function updateGiveawayPrizePool(
  giveaway: PaidTicketGiveaway,
  ticketsPurchased: number
): PaidTicketGiveaway {
  const ticketRevenue = ticketsPurchased * giveaway.ticket_price
  const newTicketRevenue = giveaway.ticket_revenue + ticketRevenue
  const newTicketsSold = giveaway.tickets_sold + ticketsPurchased

  // Calculate new distribution
  const distribution = calculateRevenueDistribution(
    giveaway,
    newTicketsSold,
    giveaway.ticket_price
  )

  return {
    ...giveaway,
    tickets_sold: newTicketsSold,
    ticket_revenue: newTicketRevenue,
    current_prize: giveaway.initial_prize + newTicketRevenue,
    onagui_share: distribution.onagui_amount,
    additional_winners_pool: distribution.additional_winners_pool,
    creator_commission: distribution.creator_commission,
    updated_at: new Date(),
  }
}

/**
 * Calculate prize breakdown for display
 */
export interface PrizeBreakdown {
  // Initial winner (guaranteed)
  initialWinnerPrize: number

  // Additional winners from ticket revenue
  additionalWinnersPool: number
  additionalWinnersCount: number
  prizePerAdditionalWinner: number

  // Platform and creator
  onaguiPlatformShare: number
  creatorCommission: number

  // Total
  totalPrizePool: number
  totalTicketRevenue: number
}

export function getPrizeBreakdown(giveaway: PaidTicketGiveaway): PrizeBreakdown {
  const distribution = calculateRevenueDistribution(
    giveaway,
    giveaway.tickets_sold,
    giveaway.ticket_price
  )

  return {
    initialWinnerPrize: giveaway.initial_prize,
    additionalWinnersPool: distribution.additional_winners_pool,
    additionalWinnersCount: distribution.winners_count,
    prizePerAdditionalWinner: distribution.prize_per_winner,
    onaguiPlatformShare: distribution.onagui_amount,
    creatorCommission: distribution.creator_commission,
    totalPrizePool: giveaway.current_prize,
    totalTicketRevenue: giveaway.ticket_revenue,
  }
}

/**
 * Validate giveaway can be created
 */
export function validateGiveawayCreation(
  initialPrize: number,
  escrowBalance: number,
  ticketPrice: number
): { valid: boolean; error?: string } {
  if (initialPrize <= 0) {
    return { valid: false, error: 'Initial prize must be greater than 0' }
  }

  if (escrowBalance < initialPrize) {
    return { valid: false, error: 'Insufficient escrow balance' }
  }

  if (ticketPrice <= 0) {
    return { valid: false, error: 'Ticket price must be greater than 0' }
  }

  // Minimum ticket price should be reasonable (e.g., 1 USDC)
  if (ticketPrice < 1) {
    return { valid: false, error: 'Ticket price must be at least 1 USDC' }
  }

  return { valid: true }
}

/**
 * Calculate creator's total ONAGUI subs (commission from all giveaways)
 */
export function calculateCreatorTotalSubs(
  completedGiveaways: PaidTicketGiveaway[]
): number {
  return completedGiveaways.reduce((total, giveaway) => {
    return total + giveaway.creator_commission
  }, 0)
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(amount: number): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC`
}

/**
 * Calculate expected revenue if all tickets sell
 */
export function calculateMaxRevenue(
  ticketPrice: number,
  maxTickets: number
): {
  maxRevenue: number
  onaguiShare: number
  additionalWinnersPool: number
  creatorCommission: number
} {
  const maxRevenue = ticketPrice * maxTickets

  return {
    maxRevenue,
    onaguiShare: maxRevenue * 0.5,
    additionalWinnersPool: maxRevenue * 0.4,
    creatorCommission: maxRevenue * 0.1,
  }
}
