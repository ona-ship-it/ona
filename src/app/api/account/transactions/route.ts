import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'giveaway' | 'raffle' | null (all)
  const status = searchParams.get('status') // 'completed' | 'pending' | 'failed' | null (all)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = 20
  const offset = (page - 1) * pageSize

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Build query — enforce user_id filter so users only see their own data
  let query = supabase
    .from('transactions')
    .select(
      `id, transaction_type, amount, currency, payment_method, status, created_at,
       giveaway_id, ticket_id,
       giveaway:giveaways ( id, title, emoji )`,
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (status) {
    query = query.eq('status', status)
  }

  if (type === 'raffle') {
    query = query.is('giveaway_id', null)
  } else if (type === 'giveaway') {
    query = query.not('giveaway_id', 'is', null)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }

  return NextResponse.json({
    transactions: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > page * pageSize,
  })
}
