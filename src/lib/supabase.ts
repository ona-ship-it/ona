import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'onagui'
      }
    }
  )
}

// Type definitions for our database
export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone_number: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Wallet = {
  id: string
  user_id: string
  usdc_balance: number
  eth_balance: number
  matic_balance: number
  created_at: string
  updated_at: string
}
