import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { giveaway_id } = await req.json()

    // 1. Get User (must be authenticated)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Get Giveaway Details
    const { data: giveaway, error: giveawayError } = await supabaseClient
      .from('giveaways')
      .select('*')
      .eq('id', giveaway_id)
      .single()

    if (giveawayError || !giveaway) throw new Error('Giveaway not found')

    // Check if user is creator or admin
    if (giveaway.creator_id !== user.id) {
      // Optional: Check for admin role here if needed
      throw new Error('Only the creator can activate this giveaway')
    }

    if (giveaway.status !== 'draft') throw new Error('Giveaway is not in draft status')

    const escrowAmount = giveaway.prize_amount // Simplified: escrow entire prize amount

    // 3. specific logic: Deduct from User Balance to "Escrow"
    // Get profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    const currentBalance = parseFloat(profile?.balance || '0')

    if (currentBalance < escrowAmount) {
      throw new Error(`Insufficient funds for escrow. Required: $${escrowAmount}, Available: $${currentBalance}`)
    }

    // Deduct
    const newBalance = currentBalance - escrowAmount
    await supabaseClient
      .from('profiles')
      .update({ balance: newBalance.toFixed(2) })
      .eq('id', user.id)

    // Record Transaction (Escrow Deposit)
    await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit', // or 'escrow_lock' if we had that type
        amount: -escrowAmount, // Negative to show deduction? Or Keep positive and rely on type? Let's use negative for now as it's a "spend"
        currency: 'USD',
        status: 'completed',
        metadata: { giveaway_id, action: 'escrow_lock' }
      })

    // 4. Activate Giveaway
    const { data: updatedGiveaway, error: updateError } = await supabaseClient
      .from('giveaways')
      .update({
        status: 'active',
        is_active: true,
        escrow_amount: escrowAmount
      })
      .eq('id', giveaway_id)
      .select()
      .single()

    if (updateError) throw new Error('Failed to activate giveaway')

    return new Response(
      JSON.stringify({
        success: true,
        message: "Giveaway activated and funds escrowed",
        giveaway: updatedGiveaway
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
