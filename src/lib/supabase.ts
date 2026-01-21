import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Profile = {
  id: string
  email: string
  phone?: string
  username?: string
  display_name?: string
  avatar_url?: string
  bio?: string
  wallet_address?: string
  created_at: string
  updated_at: string
}

export type Wallet = {
  id: string
  user_id: string
  balance_usdc: number
  balance_eth: number
  balance_matic: number
  blockchain_address?: string
  created_at: string
  updated_at: string
}

export type Giveaway = {
  id: string
  creator_id: string
  title: string
  description: string
  prize_description: string
  prize_value?: number
  prize_image_url?: string
  total_tickets: number
  free_tickets: number
  paid_tickets: number
  ticket_price_usdc?: number
  ticket_price_eth?: number
  ticket_price_matic?: number
  status: 'draft' | 'active' | 'ended' | 'cancelled'
  start_date: string
  end_date: string
  winner_id?: string
  winning_ticket_id?: string
  winner_selected_at?: string
  supported_chains: string[]
  created_at: string
  updated_at: string
}

export type Ticket = {
  id: string
  giveaway_id: string
  user_id: string
  ticket_number: string
  ticket_type: 'free' | 'paid'
  payment_amount?: number
  payment_token?: string
  payment_blockchain?: string
  payment_tx_hash?: string
  payment_status: 'pending' | 'confirmed' | 'failed'
  is_winner: boolean
  claimed_at?: string
  created_at: string
}
