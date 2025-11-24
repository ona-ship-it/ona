import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteSupabase } from '@/lib/supabaseServer';
import { checkRateLimit } from '@/middleware/idempotencyRateLimit';

export const GET = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Admin/Service Role path: Authorization: Bearer <service_key>
    if (authHeader && serviceKey && authHeader === `Bearer ${serviceKey}`) {
      const url = new URL(request.url);
      const userId = url.searchParams.get('user_id');
      if (!userId) {
        return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
      }

      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await serviceClient
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, balance: (data as any)?.balance });
    }

    // Default behavior: session-based user path
    const supabase = await createRouteSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply simple rate limit for balance checks
    const rl = checkRateLimit(user.id, 'balance');
    if (!rl.allowed) {
      return NextResponse.json({ error: rl.error || 'Rate limit exceeded' }, { status: 429 });
    }

    // Fetch fiat wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance_fiat')
      .eq('user_id', user.id)
      .single<{ balance_fiat: number }>();

    if (walletError && walletError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
    }

    // Fetch recent wallet transactions (if table present)
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) {
      // Do not fail the entire request if transactions cannot be fetched
      console.warn('Wallet balance: transactions fetch warning:', txError);
    }

    const fiatBalanceUsdt = wallet?.balance_fiat || 0;
    return NextResponse.json({
      currency: 'USDT',
      fiat_balance_usdt: fiatBalanceUsdt,
      total_balance_usdt: fiatBalanceUsdt,
      balances: [],
      wallet: wallet || { balance_fiat: 0 },
      transactions: transactions || [],
    });
  } catch (err: any) {
    console.error('Wallet balance GET wrapper error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const supabase = await createRouteSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit withdrawals
    const rl = checkRateLimit(user.id, 'withdraw');
    if (!rl.allowed) {
      return NextResponse.json({ error: rl.error || 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { amount, currency, address } = body || {};
    if (!amount || !currency) {
      return NextResponse.json({ error: 'Amount and currency are required' }, { status: 400 });
    }

    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount_usd: Number(amount),
        reason: 'user_request',
        reference_id: null,
        balance_after: null,
        metadata: address ? { address } : null,
      })
      .select()
      .single();

    if (txError) {
      console.error('Wallet balance POST create withdrawal error:', txError);
      return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    console.error('Wallet balance POST wrapper error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
};