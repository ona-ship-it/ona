/**
 * Simple verification script for v2 RPCs.
 *
 * Requires environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - TEST_GIVEAWAY_ID
 * - TEST_USER_ID
 * - TEST_DONATION_USD (e.g. 0.01)
 * - TEST_TICKET_QTY (e.g. 1)
 *
 * This script performs real operations:
 * - Calls apply_giveaway_donation_with_wallet_v2 (deducts wallet, updates totals)
 * - Calls buy_giveaway_tickets_v2 (deducts wallet, inserts tickets, logs purchase)
 *
 * Use a staging environment and test user/giveaway.
 */
import { createClient } from '@supabase/supabase-js';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function main() {
  const url = required('SUPABASE_URL');
  const key = required('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const giveawayId = required('TEST_GIVEAWAY_ID');
  const userId = required('TEST_USER_ID');
  const donationUsd = parseFloat(required('TEST_DONATION_USD'));
  const ticketQty = parseInt(required('TEST_TICKET_QTY'), 10);

  console.log('--- Verifying apply_giveaway_donation_with_wallet_v2 ---');
  const { data: donationData, error: donationError } = await supabase.rpc(
    'apply_giveaway_donation_with_wallet_v2',
    {
      p_giveaway_id: giveawayId,
      p_user_id: userId,
      p_amount: donationUsd,
      p_note: 'Verification donation',
      p_override_split_platform: null,
      p_override_split_creator: null,
      p_override_split_prize: null,
    }
  );
  if (donationError) {
    console.error('Donation v2 RPC error:', donationError);
  } else {
    const row = Array.isArray(donationData) ? donationData[0] : donationData;
    console.log('Donation v2 result:', {
      newBalanceUsd: row?.new_balance_usd,
      breakdown: {
        toPrizePoolUsd: row?.pool_amount,
        toCreatorUsd: row?.creator_amount,
        toPlatformUsd: row?.platform_amount,
      },
      totals: {
        donationPoolUsd: row?.donation_pool_total,
        creatorEarningsUsd: row?.creator_earnings_total,
        platformEarningsUsd: row?.platform_earnings_total,
      },
      audit: {
        contributionId: row?.contribution_id,
        contributionCreatedAt: row?.contribution_created_at,
      },
    });

    // Verify ledger entry for donation
    if (row?.contribution_id) {
      const { data: ledgerDonation, error: ledgerDonationError } = await supabase
        .from('wallet_transactions')
        .select('id,user_id,amount_usd,type,reason,reference_id,balance_after,created_at')
        .eq('reference_id', row.contribution_id)
        .eq('reason', 'donation')
        .order('created_at', { ascending: false })
        .limit(1);
      if (ledgerDonationError) {
        console.error('Ledger donation query error:', ledgerDonationError);
      } else {
        console.log('Ledger donation entry:', ledgerDonation?.[0] ?? null);
      }
    }
  }

  console.log('--- Verifying buy_giveaway_tickets_v2 ---');
  const { data: ticketData, error: ticketError } = await supabase.rpc(
    'buy_giveaway_tickets_v2',
    {
      p_giveaway_id: giveawayId,
      p_user_id: userId,
      p_quantity: ticketQty,
    }
  );
  if (ticketError) {
    console.error('Ticket v2 RPC error:', ticketError);
  } else {
    const row = Array.isArray(ticketData) ? ticketData[0] : ticketData;
    console.log('Ticket v2 result:', {
      purchaseId: row?.purchase_id,
      createdAt: row?.created_at,
      issuedTickets: row?.issued_tickets,
      totalCostUsd: row?.total_cost_usd,
      newBalanceUsd: row?.new_balance_usd,
    });

    // Verify ledger entry for ticket purchase
    if (row?.purchase_id) {
      const { data: ledgerPurchase, error: ledgerPurchaseError } = await supabase
        .from('wallet_transactions')
        .select('id,user_id,amount_usd,type,reason,reference_id,balance_after,created_at')
        .eq('reference_id', row.purchase_id)
        .eq('reason', 'ticket_purchase')
        .order('created_at', { ascending: false })
        .limit(1);
      if (ledgerPurchaseError) {
        console.error('Ledger purchase query error:', ledgerPurchaseError);
      } else {
        console.log('Ledger purchase entry:', ledgerPurchase?.[0] ?? null);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});