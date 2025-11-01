export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          created_at: string | null
          current_rank: string | null
          email: string | null
          id: string
          last_active_at: string | null
          profile_image: string | null
          reputation_points: number | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          current_rank?: string | null
          email?: string | null
          id?: string
          last_active_at?: string | null
          profile_image?: string | null
          reputation_points?: number | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          current_rank?: string | null
          email?: string | null
          id?: string
          last_active_at?: string | null
          profile_image?: string | null
          reputation_points?: number | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_current_rank_fkey"
            columns: ["current_rank"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["code"]
          },
        ]
      }
      giveaways: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          ends_at: string | null
          escrow_amount: number | null
          escrow_status: string | null
          id: string
          is_active: boolean | null
          media_url: string | null
          photo_url: string | null
          prize_amount: number
          prize_pool_usdt: number | null
          status: string
          ticket_price: number | null
          tickets_count: number | null
          title: string | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          ends_at?: string | null
          escrow_amount?: number | null
          escrow_status?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string | null
          photo_url?: string | null
          prize_amount: number
          prize_pool_usdt?: number | null
          status: string
          ticket_price?: number | null
          tickets_count?: number | null
          title?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          ends_at?: string | null
          escrow_amount?: number | null
          escrow_status?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string | null
          photo_url?: string | null
          prize_amount?: number
          prize_pool_usdt?: number | null
          status?: string
          ticket_price?: number | null
          tickets_count?: number | null
          title?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: []
      }
      onagui_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean
          onagui_type: Database["public"]["Enums"]["onagui_user_type"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean
          onagui_type?: Database["public"]["Enums"]["onagui_user_type"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          onagui_type?: Database["public"]["Enums"]["onagui_user_type"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      ranks: {
        Row: {
          badge_icon: string | null
          code: string
          description: string | null
          name: string
          requirements: Json | null
        }
        Insert: {
          badge_icon?: string | null
          code: string
          description?: string | null
          name: string
          requirements?: Json | null
        }
        Update: {
          badge_icon?: string | null
          code?: string
          description?: string | null
          name?: string
          requirements?: Json | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          giveaway_id: string
          id: string
          is_free: boolean
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          giveaway_id: string
          id?: string
          is_free?: boolean
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          giveaway_id?: string
          id?: string
          is_free?: boolean
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          status: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          id: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "onagui_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_code: string
          earned_at: string | null
          icon: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          badge_code: string
          earned_at?: string | null
          icon?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          badge_code?: string
          earned_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verifications: {
        Row: {
          id: string
          status: string | null
          type: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          status?: string | null
          type: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          status?: string | null
          type?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_crypto_wallets: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          private_key: string
          balance: string
          available_balance: string
          pending_withdrawals: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          private_key: string
          balance?: string
          available_balance?: string
          pending_withdrawals?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          wallet_address?: string
          private_key?: string
          balance?: string
          available_balance?: string
          pending_withdrawals?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_crypto_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          transaction_type: string
          description: string | null
          reference_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency: string
          transaction_type: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          transaction_type?: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_wallets: {
        Row: {
          id: string
          user_id: string
          network: string
          address: string
          encrypted_private_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          network: string
          address: string
          encrypted_private_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          network?: string
          address?: string
          encrypted_private_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_transactions: {
        Row: {
          id: string
          user_id: string | null
          network: string
          tx_hash: string
          from_address: string | null
          to_address: string | null
          amount: number
          currency: string
          confirmations: number | null
          status: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          network: string
          tx_hash: string
          from_address?: string | null
          to_address?: string | null
          amount: number
          currency: string
          confirmations?: number | null
          status?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          network?: string
          tx_hash?: string
          from_address?: string | null
          to_address?: string | null
          amount?: number
          currency?: string
          confirmations?: number | null
          status?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          id: string
          user_id: string
          network: string
          address: string
          encrypted_private_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          network: string
          address: string
          encrypted_private_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          network?: string
          address?: string
          encrypted_private_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          to_address: string
          status: string
          tx_hash: string | null
          idempotency_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          to_address: string
          status?: string
          tx_hash?: string | null
          idempotency_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          to_address?: string
          status?: string
          tx_hash?: string | null
          idempotency_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_scan_status: {
        Row: {
          id: string
          network: string
          last_scanned_block: number | null
          last_scanned_tx: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          network: string
          last_scanned_block?: number | null
          last_scanned_tx?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          network?: string
          last_scanned_block?: number | null
          last_scanned_tx?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance_fiat: number
          balance_tickets: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          balance_fiat?: number
          balance_tickets?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          balance_fiat?: number
          balance_tickets?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          description?: never
          id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          description?: never
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      admin_user_roles: {
        Row: {
          assigned_at: string | null
          role_description: string | null
          role_id: string | null
          role_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_funds_to_wallet: {
        Args: { amount: number; user_uuid: string }
        Returns: boolean
      }
      add_funds_to_wallet_fiat: {
        Args: { amount_to_add: number; user_uuid: string }
        Returns: boolean
      }
      add_funds_to_wallet_tickets: {
        Args: { amount_to_add: number; user_uuid: string }
        Returns: boolean
      }
      deduct_funds_from_wallet_fiat: {
        Args: { amount_to_deduct: number; user_uuid: string }
        Returns: boolean
      }
      deduct_funds_from_wallet_tickets: {
        Args: { amount_to_deduct: number; user_uuid: string }
        Returns: boolean
      }
      ensure_user_wallet: { Args: { user_uuid: string }; Returns: string }
      get_admin_users: {
        Args: never
        Returns: {
          assigned_at: string
          email: string
          role_description: string
          role_name: string
          user_id: string
        }[]
      }
      is_admin_user:
        | { Args: { user_uuid: string }; Returns: boolean }
        | { Args: never; Returns: boolean }
      release_giveaway_escrow: {
        Args: { giveaway_id: string; winner_user_id: string }
        Returns: boolean
      }
      sync_user_to_app_users: {
        Args: { p_email: string; p_id: string; p_username: string }
        Returns: Database["public"]["Tables"]["app_users"]["Row"]
        SetofOptions: {
          from: "*"
          to: "app_users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_balance:
        | { Args: { user_uuid: string }; Returns: number }
        | { Args: { user_uuid: string; currency_filter: string }; Returns: number }
      get_user_balances: {
        Args: { user_uuid: string }
        Returns: { currency: string; balance: number }[]
      }
      check_user_balance: {
        Args: { user_uuid: string; required_amount: number; currency_filter: string }
        Returns: boolean
      }
      transfer_funds: {
        Args: { 
          from_user_uuid: string
          to_user_uuid: string
          amount: number
          currency_param: string
          description_param: string
        }
        Returns: boolean
      }
      process_deposit: {
        Args: {
          user_uuid: string
          amount: number
          currency_param: string
          description_param: string
        }
        Returns: boolean
      }
      get_user_transactions: {
        Args: { user_uuid: string; limit_count: number }
        Returns: Database["public"]["Tables"]["ledger"]["Row"][]
      }
    }
    Enums: {
      onagui_user_type:
        | "vip"
        | "active"
        | "empowered"
        | "signed_in"
        | "subscriber"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      onagui_user_type: [
        "vip",
        "active",
        "empowered",
        "signed_in",
        "subscriber",
      ],
    },
  },
} as const