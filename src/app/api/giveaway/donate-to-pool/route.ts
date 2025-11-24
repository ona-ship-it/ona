import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/utils/supabase/server-side-service';

interface DonateToPoolRequest {
  giveawayId: string;
  userId: string;
  amountUsd: number;
  note?: string;
  // Optional override splits; if omitted, defaults from giveaway are used
  splitPlatform?: number;
  splitCreator?: number;
  splitPrize?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { giveawayId, userId, amountUsd, note, splitPlatform, splitCreator, splitPrize }: DonateToPoolRequest = await req.json();

    if (!giveawayId || !userId || typeof amountUsd !== 'number' || amountUsd <= 0) {
      return NextResponse.json({ error: 'Invalid request data. Amount must be positive.' }, { status: 400 });
    }

    // Validate optional override splits (must supply all three and sum to 1)
    const hasOverride = [splitPlatform, splitCreator, splitPrize].every(v => typeof v === 'number');
    if (hasOverride) {
      const sum = Number(splitPlatform) + Number(splitCreator) + Number(splitPrize);
      if (Math.abs(sum - 1) > 1e-9) {
        return NextResponse.json({ error: 'Override split must sum to exactly 1.0' }, { status: 400 });
      }
    }

    const supabase = createClient();

    const { data, error } = await supabase.rpc('apply_giveaway_donation_with_wallet_v2', {
      p_giveaway_id: giveawayId,
      p_user_id: userId,
      p_amount: amountUsd,
      p_note: note ?? 'User Donation',
      p_override_split_platform: hasOverride ? splitPlatform : null,
      p_override_split_creator: hasOverride ? splitCreator : null,
      p_override_split_prize: hasOverride ? splitPrize : null,
    });

    if (error) {
      console.error('RPC apply_giveaway_donation_with_wallet_v2 error:', error);
      return NextResponse.json({ error: error.message || 'Donation failed' }, { status: 400 });
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      newBalanceUsd: result.new_balance_usd,
      breakdown: {
        toPrizePoolUsd: result.pool_amount,
        toCreatorUsd: result.creator_amount,
        toPlatformUsd: result.platform_amount,
      },
      totals: {
        donationPoolUsd: result.donation_pool_total,
        creatorEarningsUsd: result.creator_earnings_total,
        platformEarningsUsd: result.platform_earnings_total,
      },
      audit: {
        contributionId: result.contribution_id,
        contributionCreatedAt: result.contribution_created_at,
      },
      message: 'Donation successfully added to the pool.'
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in donate-to-pool API:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}