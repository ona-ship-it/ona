export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: string
          assigned_at: string
        }
        Insert: {
          user_id: string
          role_id: string
          assigned_at?: string
        }
        Update: {
          user_id?: string
          role_id?: string
          assigned_at?: string
        }
      }
      ranks: {
        Row: {
          code: string
          name: string
          description: string | null
          requirements: Json | null
          badge_icon: string | null
        }
        Insert: {
          code: string
          name: string
          description?: string | null
          requirements?: Json | null
          badge_icon?: string | null
        }
        Update: {
          code?: string
          name?: string
          description?: string | null
          requirements?: Json | null
          badge_icon?: string | null
        }
      }
      app_users: {
        Row: {
          id: string
          email: string | null
          username: string | null
          profile_image: string | null
          current_rank: string
          reputation_points: number
          created_at: string
          last_active_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          username?: string | null
          profile_image?: string | null
          current_rank?: string
          reputation_points?: number
          created_at?: string
          last_active_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          profile_image?: string | null
          current_rank?: string
          reputation_points?: number
          created_at?: string
          last_active_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          icon_url: string | null
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          icon_url?: string | null
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          points?: number
          created_at?: string
        }
      }
      onagui_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          onagui_type: Database['public']['Enums']['onagui_user_type']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          onagui_type?: Database['public']['Enums']['onagui_user_type']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          onagui_type?: Database['public']['Enums']['onagui_user_type']
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      user_verifications: {
        Row: {
          id: string
          user_id: string
          type: string
          status: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          status?: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          status?: string
          verified_at?: string | null
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_code: string
          name: string
          icon: string | null
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_code: string
          name: string
          icon?: string | null
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_code?: string
          name?: string
          icon?: string | null
          earned_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          currency: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          currency?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          currency?: string
          status?: string
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          action: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      user_rank_history: {
        Row: {
          id: string
          user_id: string
          old_rank: string | null
          new_rank: string | null
          changed_at: string
          reason: string | null
        }
        Insert: {
          id?: string
          user_id: string
          old_rank?: string | null
          new_rank?: string | null
          changed_at?: string
          reason?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          old_rank?: string | null
          new_rank?: string | null
          changed_at?: string
          reason?: string | null
        }
      }
      wallets: {
        Row: {
          user_id: string
          balance_tickets: number
          balance_fiat: number
          created_at: string
        }
        Insert: {
          user_id: string
          balance_tickets?: number
          balance_fiat?: number
          created_at?: string
        }
        Update: {
          user_id?: string
          balance_tickets?: number
          balance_fiat?: number
          created_at?: string
        }
      }
      giveaways: {
        Row: {
          id: string
          creator_id: string | null
          title: string | null
          description: string | null
          prize_amount: number
          prize_pool_usdt: number | null
          ticket_price: number | null
          photo_url: string | null
          media_url: string | null
          ends_at: string | null
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          is_active: boolean | null
          escrow_amount: number | null
          tickets_count: number | null
          winner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id?: string | null
          title?: string | null
          description?: string | null
          prize_amount: number
          prize_pool_usdt?: number | null
          ticket_price?: number | null
          photo_url?: string | null
          media_url?: string | null
          ends_at?: string | null
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          is_active?: boolean | null
          escrow_amount?: number | null
          tickets_count?: number | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string | null
          title?: string | null
          description?: string | null
          prize_amount?: number
          prize_pool_usdt?: number | null
          ticket_price?: number | null
          photo_url?: string | null
          media_url?: string | null
          ends_at?: string | null
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          is_active?: boolean | null
          escrow_amount?: number | null
          tickets_count?: number | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          raffle_id: string | null
          giveaway_id: string | null
          ticket_number: number | null
          purchase_transaction_id: string | null
          status: 'pending' | 'completed' | 'refunded'
          is_free: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          raffle_id?: string | null
          giveaway_id?: string | null
          ticket_number?: number | null
          purchase_transaction_id?: string | null
          status?: 'pending' | 'completed' | 'refunded'
          is_free?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          raffle_id?: string | null
          giveaway_id?: string | null
          ticket_number?: number | null
          purchase_transaction_id?: string | null
          status?: 'pending' | 'completed' | 'refunded'
          is_free?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      onagui_user_type: 'new_user' | 'subscriber' | 'onagui_user' | 'powered' | 'vip' | 'admin'
    }
  }
}