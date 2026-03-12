import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern — reuse the same client instance
// This prevents session loss from creating multiple clients
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  // When building on Vercel preview branches we may not have the
  // Supabase env vars configured. Passing empty strings prevents
  // the library from throwing a runtime error during build, and
  // since the pages using this are client-only the real values
  // will be available in the browser once the user navigates.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  client = createBrowserClient(url, key)

  return client
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
