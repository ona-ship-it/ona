export type AdditionalWinnersDistribution = 'single' | 'multiple'

export type PaidTicketGiveaway = {
  id: string
  ticket_price: number
  tickets_sold: number
  ticket_revenue: number
  initial_prize: number
  current_prize: number
  onagui_share: number
  additional_winners_pool: number
  creator_commission: number
  additional_winners_count?: number
  additional_winners_distribution?: AdditionalWinnersDistribution
  updated_at?: Date
}

export type RevenueDistribution = {
  giveaway_id: string
  total_ticket_revenue: number
  onagui_amount: number
  onagui_status: 'pending' | 'completed'
  additional_winners_pool: number
  winners_count: number
  prize_per_winner: number
  winners_status: 'pending' | 'completed'
  creator_commission: number
  creator_commission_status: 'pending' | 'completed'
  calculated_at: Date
}

export type TicketPurchase = {
  giveaway_id: string
  user_id: string
  quantity: number
  price: number
  currency: string
  created_at: Date
}
