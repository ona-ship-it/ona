// Basic giveaway type definitions
export interface Ticket {
  id: string;
  user_id: string;
  giveaway_id: string;
  created_at: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  winner_id?: string;
  created_at: string;
}

export interface GiveawayWithTickets extends Giveaway {
  tickets: Ticket[];
}