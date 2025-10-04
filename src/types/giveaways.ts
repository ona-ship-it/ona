export interface Giveaway {
  id: string;
  creator_id: string;
  description: string;
  prize_amount: number;
  photo_url?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  escrow_amount: number;
  created_at: string;
  updated_at: string;
  winner_id?: string;
  end_date?: string;
}

export interface Ticket {
  id: string;
  giveaway_id: string;
  owner_id: string;
  is_free: boolean;
  created_at: string;
}

export interface GiveawayWithTickets extends Giveaway {
  tickets_count: number;
  user_tickets_count?: number;
}

export interface CreateGiveawayPayload {
  description: string;
  prize_amount: number;
  photo_url?: string;
}

export interface BuyTicketPayload {
  giveaway_id: string;
  quantity: number;
}

export interface DonateToPoolPayload {
  giveaway_id: string;
  amount: number;
}