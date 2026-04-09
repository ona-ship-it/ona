import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern — reuse the same client instance.
// This prevents session loss from creating multiple clients.
let client: ReturnType<typeof createNoopClient> | ReturnType<typeof createBrowserClient> | null = null

function createNoopClient() {
  const noop = async () => ({ data: null, error: null })
  const noopUnsubscribe = () => undefined

  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: noopUnsubscribe,
          },
        },
      }),
    },
    from: () => ({
      select: noop,
      insert: noop,
      update: noop,
      delete: noop,
      upsert: noop,
      maybeSingle: noop,
      single: noop,
      order: () => ({ range: noop, limit: noop, execute: noop }),
      range: () => ({ execute: noop }),
      execute: noop,
    }),
    rpc: noop,
  }
}

export function createClient() {
  if (client) return client

  // Avoid creating a Supabase client during server-side build / prerender
  // where environment variables may be missing and window is unavailable.
  if (typeof window === 'undefined') {
    client = createNoopClient()
    return client
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    client = createNoopClient()
    return client
  }

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
