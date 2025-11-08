import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import {
  GET as OnaGET,
  POST as OnaPOST,
} from '../../../../../ona-production/src/app/api/wallet/balance/route';

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
    return await OnaGET(request as any);
  } catch (err: any) {
    console.error('Wallet balance GET wrapper error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    return await OnaPOST(request as any);
  } catch (err: any) {
    console.error('Wallet balance POST wrapper error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
};