export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      giveaways: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          prize_amount: number | null;
          tickets_count: number | null;
          status: string;
          escrow_status: string | null;
          winner_id: string | null;
          temp_winner_id: string | null;
          created_at: string;
          updated_at: string | null;
          ends_at: string | null;
          creator_id: string | null;
        };
        Insert: {
          id?: string;
          title?: string;
          description?: string | null;
          prize_amount?: number | null;
          tickets_count?: number | null;
          status?: string;
          escrow_status?: string | null;
          winner_id?: string | null;
          temp_winner_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          ends_at?: string | null;
          creator_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          prize_amount?: number | null;
          tickets_count?: number | null;
          status?: string;
          escrow_status?: string | null;
          winner_id?: string | null;
          temp_winner_id?: string | null;
          updated_at?: string | null;
          ends_at?: string | null;
          creator_id?: string | null;
        };
      };
      tickets: {
        Row: {
          user_id: string;
          giveaway_id: string;
        };
        Insert: {
          user_id: string;
          giveaway_id: string;
        };
        Update: {
          user_id?: string;
          giveaway_id?: string;
        };
      };
      giveaway_audit: {
        Row: {
          id: string;
          giveaway_id: string;
          action: string;
          actor_id: string | null;
          target_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          giveaway_id: string;
          action: string;
          actor_id?: string | null;
          target_id?: string | null;
          note?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          target_id?: string | null;
          note?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
