import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) {
      const msg = userErr.message || 'Auth error'
      const isNoSession = msg.toLowerCase().includes('auth session missing')
      return NextResponse.json({ error: msg }, { status: isNoSession ? 401 : 400 })
    }
    if (!userRes?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('id,user_id,amount_usd,type,reason,reference_id,balance_after,metadata,created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ transactions: data ?? [] }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}