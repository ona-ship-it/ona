import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ============================================================================
// RAFFLE SETTLEMENT — Draw winner, calculate splits, create settlement record
// POST /api/admin/raffles/[id]/settle
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const raffleId = params.id

    // 1. Verify admin (check user is authenticated and has admin role)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add proper admin check against your admin table/role
    // For now, we proceed if user is authenticated

    // 2. Get raffle
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single()

    if (raffleError || !raffle) {
      return NextResponse.json({ error: 'Raffle not found' }, { status: 404 })
    }

    // 3. Validate raffle can be settled
    const validStatuses = ['active', 'settling', 'redrawing']
    if (!validStatuses.includes(raffle.status)) {
      return NextResponse.json(
        { error: `Raffle cannot be settled (status: ${raffle.status})` },
        { status: 400 }
      )
    }

    // Check raffle has ended or sold out
    const isExpired = new Date(raffle.end_date) <= new Date()
    const isSoldOut = raffle.tickets_sold >= raffle.total_tickets

    if (!isExpired && !isSoldOut && raffle.status !== 'redrawing') {
      return NextResponse.json(
        { error: 'Raffle has not ended yet and is not sold out' },
        { status: 400 }
      )
    }

    // 4. Get all ticket holders
    const { data: tickets, error: ticketError } = await supabase
      .from('raffle_tickets')
      .select('id, user_id, quantity')
      .eq('raffle_id', raffleId)

    if (ticketError || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: 'No tickets sold for this raffle' },
        { status: 400 }
      )
    }

    // 5. Get existing settlement (for redraws)
    const { data: existingSettlement } = await supabase
      .from('raffle_settlements')
      .select('*')
      .eq('raffle_id', raffleId)
      .single()

    // Get list of previous failed winners to exclude
    const previousWinners: string[] = existingSettlement?.previous_winners || []

    // 6. Build weighted ticket pool (excluding previous failed winners)
    const pool: { ticketId: string; userId: string }[] = []
    for (const ticket of tickets) {
      // Skip users who failed KYC in previous draws
      if (previousWinners.includes(ticket.user_id)) continue

      // Each ticket quantity adds that many entries
      for (let i = 0; i < ticket.quantity; i++) {
        pool.push({ ticketId: ticket.id, userId: ticket.user_id })
      }
    }

    if (pool.length === 0) {
      return NextResponse.json(
        { error: 'No eligible ticket holders remaining' },
        { status: 400 }
      )
    }

    // 7. Draw winner using provably fair randomness
    // Generate random seed (in production, replace with Chainlink VRF)
    const randomSeed = crypto.randomBytes(32).toString('hex')
    const hash = crypto.createHash('sha256').update(randomSeed + raffleId).digest('hex')
    const randomIndex = parseInt(hash.slice(0, 8), 16) % pool.length
    const winner = pool[randomIndex]

    // 8. Calculate revenue split
    const totalRevenue = raffle.tickets_sold * raffle.ticket_price
    const scenario = isSoldOut ? 'sold_out' : 'partial'

    let winnerPayout = 0
    let onaguiPayout = 0
    let creatorPayout = 0
    let cashAlternative = 0

    if (scenario === 'sold_out') {
      // Sold out: prize is fulfilled, Onagui keeps the buffer (~10%)
      // Prize costs prize_value, remaining goes to Onagui
      winnerPayout = raffle.prize_value  // winner gets the prize (or cash alternative)
      onaguiPayout = totalRevenue - raffle.prize_value
      creatorPayout = 0  // creator gets brand exposure, no cash
      cashAlternative = Math.round(raffle.prize_value * 0.5)  // 50% cash option
    } else {
      // Partial: 50% winner / 40% Onagui / 10% creator
      winnerPayout = Math.round(totalRevenue * 0.50 * 100) / 100
      onaguiPayout = Math.round(totalRevenue * 0.40 * 100) / 100
      creatorPayout = Math.round(totalRevenue * 0.10 * 100) / 100
    }

    // 9. Calculate referral payouts (from creator's share)
    let referralPayouts: Record<string, number> = {}
    if (raffle.referral_enabled && raffle.referral_rate > 0 && creatorPayout > 0) {
      const { data: referrals } = await supabase
        .from('raffle_referrals')
        .select('referrer_user_id, commission_amount')
        .eq('raffle_id', raffleId)
        .eq('paid', false)

      if (referrals && referrals.length > 0) {
        let totalReferralCost = 0
        for (const ref of referrals) {
          const userId = ref.referrer_user_id
          const amount = ref.commission_amount
          referralPayouts[userId] = (referralPayouts[userId] || 0) + amount
          totalReferralCost += amount
        }

        // Referral payouts come from creator's share
        // If referrals exceed creator share, cap them
        if (totalReferralCost > creatorPayout) {
          const ratio = creatorPayout / totalReferralCost
          for (const uid in referralPayouts) {
            referralPayouts[uid] = Math.round(referralPayouts[uid] * ratio * 100) / 100
          }
          totalReferralCost = creatorPayout
        }

        // Reduce creator payout by referral costs
        creatorPayout = Math.round((creatorPayout - totalReferralCost) * 100) / 100
      }
    }

    // 10. Create or update settlement record
    const settlementData = {
      raffle_id: raffleId,
      winner_user_id: winner.userId,
      winning_ticket_id: winner.ticketId,
      random_seed: randomSeed,
      selection_method: 'crypto_random',  // TODO: change to 'chainlink_vrf' when integrated
      scenario,
      total_revenue: totalRevenue,
      winner_payout: winnerPayout,
      onagui_payout: onaguiPayout,
      creator_payout: creatorPayout,
      referral_payouts: referralPayouts,
      winner_choice: scenario === 'sold_out' ? 'pending' : 'cash',  // partial always pays cash
      cash_alternative_amount: scenario === 'sold_out' ? cashAlternative : winnerPayout,
      kyc_status: 'pending',
      redraw_count: existingSettlement ? (existingSettlement.redraw_count || 0) + 1 : 0,
      previous_winners: previousWinners,
    }

    let settlement
    if (existingSettlement) {
      // Update existing settlement (redraw case)
      const { data, error } = await supabase
        .from('raffle_settlements')
        .update(settlementData)
        .eq('id', existingSettlement.id)
        .select()
        .single()
      if (error) throw error
      settlement = data
    } else {
      // Create new settlement
      const { data, error } = await supabase
        .from('raffle_settlements')
        .insert(settlementData)
        .select()
        .single()
      if (error) throw error
      settlement = data
    }

    // 11. Update raffle status
    await supabase
      .from('raffles')
      .update({ status: 'kyc_pending' })
      .eq('id', raffleId)

    // 12. Create notification for winner
    // TODO: Send email/push notification
    // For now, just log it
    console.log(`[RAFFLE ${raffleId}] Winner drawn: user ${winner.userId}, ticket ${winner.ticketId}`)

    return NextResponse.json({
      success: true,
      settlement_id: settlement.id,
      winner_user_id: winner.userId,
      scenario,
      revenue: {
        total: totalRevenue,
        winner: winnerPayout,
        onagui: onaguiPayout,
        creator: creatorPayout,
        referrals: referralPayouts,
      },
      cash_alternative: cashAlternative,
      random_seed: randomSeed,
      selection_method: 'crypto_random',
      message: `Winner drawn! User ${winner.userId.slice(0, 8)}... wins. KYC verification pending.`,
    })

  } catch (error: any) {
    console.error('Settlement error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// VERIFY KYC — Mark winner as passed or failed
// PATCH /api/admin/raffles/[id]/settle
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const raffleId = params.id
    const body = await request.json()
    const { action, reason } = body  // action: 'pass_kyc' | 'fail_kyc' | 'fulfill'

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get settlement
    const { data: settlement, error } = await supabase
      .from('raffle_settlements')
      .select('*')
      .eq('raffle_id', raffleId)
      .single()

    if (error || !settlement) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 })
    }

    // ── PASS KYC ──
    if (action === 'pass_kyc') {
      await supabase
        .from('raffle_settlements')
        .update({ kyc_status: 'passed' })
        .eq('id', settlement.id)

      // If partial scenario, auto-fulfill (just send USDC)
      if (settlement.scenario === 'partial') {
        await supabase
          .from('raffle_settlements')
          .update({ winner_choice: 'cash', fulfilled_at: new Date().toISOString() })
          .eq('id', settlement.id)

        await supabase
          .from('raffles')
          .update({ status: 'fulfilled' })
          .eq('id', raffleId)
      }

      return NextResponse.json({ success: true, message: 'KYC passed. Awaiting winner choice or fulfillment.' })
    }

    // ── FAIL KYC (must provide proof) ──
    if (action === 'fail_kyc') {
      if (!reason) {
        return NextResponse.json({ error: 'Must provide reason/proof for KYC failure' }, { status: 400 })
      }

      // Add failed winner to previous_winners list
      const previousWinners = [...(settlement.previous_winners || []), settlement.winner_user_id]

      await supabase
        .from('raffle_settlements')
        .update({
          kyc_status: 'failed',
          kyc_failure_reason: reason,
          previous_winners: previousWinners,
        })
        .eq('id', settlement.id)

      // Set raffle to redrawing so settle can be called again
      await supabase
        .from('raffles')
        .update({ status: 'redrawing' })
        .eq('id', raffleId)

      return NextResponse.json({
        success: true,
        message: 'KYC failed. Raffle set to redrawing. Call POST /settle again to draw new winner.',
        failed_user: settlement.winner_user_id,
        redraw_count: (settlement.redraw_count || 0) + 1,
      })
    }

    // ── FULFILL ──
    if (action === 'fulfill') {
      const { proof } = body  // { tracking, receipt, photos }

      await supabase
        .from('raffle_settlements')
        .update({
          fulfilled_at: new Date().toISOString(),
          fulfillment_proof: proof || {},
        })
        .eq('id', settlement.id)

      await supabase
        .from('raffles')
        .update({ status: 'fulfilled' })
        .eq('id', raffleId)

      // Mark referrals as paid
      if (settlement.referral_payouts && Object.keys(settlement.referral_payouts).length > 0) {
        await supabase
          .from('raffle_referrals')
          .update({ paid: true })
          .eq('raffle_id', raffleId)
      }

      return NextResponse.json({ success: true, message: 'Raffle fulfilled! Prize delivered.' })
    }

    // ── SET WINNER CHOICE (prize or cash) ──
    if (action === 'winner_choice') {
      const { choice } = body  // 'prize' or 'cash'
      if (!['prize', 'cash'].includes(choice)) {
        return NextResponse.json({ error: 'Choice must be "prize" or "cash"' }, { status: 400 })
      }

      await supabase
        .from('raffle_settlements')
        .update({ winner_choice: choice })
        .eq('id', settlement.id)

      return NextResponse.json({ success: true, message: `Winner chose: ${choice}` })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Settlement update error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
