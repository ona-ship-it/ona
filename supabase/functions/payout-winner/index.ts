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

        // 1. Get Giveaway
        const { data: giveaway, error: giveawayError } = await supabaseClient
            .from('giveaways')
            .select('*')
            .eq('id', giveaway_id)
            .single()

        if (giveawayError || !giveaway) throw new Error('Giveaway not found')

        if (!giveaway.winner_id) throw new Error('No winner selected yet')
        // We expect status to be 'completed' (waiting for payout) or 'active' (if pick winner didn't close it)

        const payoutAmount = giveaway.prize_amount // Or escrow_amount? 
        // Assuming prize_amount = what winner gets.

        // 2. Transfer Funds to Winner
        // Add to recipient
        const { data: winnerProfile, error: winnerError } = await supabaseClient
            .from('profiles')
            .select('balance')
            .eq('id', giveaway.winner_id)
            .single()

        if (winnerError) throw new Error('Winner profile not found')

        const currentBalance = parseFloat(winnerProfile.balance || '0')
        const newBalance = currentBalance + payoutAmount

        const { error: balanceUpdateError } = await supabaseClient
            .from('profiles')
            .update({ balance: newBalance.toFixed(2) })
            .eq('id', giveaway.winner_id)

        if (balanceUpdateError) throw new Error('Failed to update winner balance')

        // Record Transaction (Payout)
        await supabaseClient
            .from('transactions')
            .insert({
                user_id: giveaway.winner_id,
                type: 'payout',
                amount: payoutAmount,
                currency: 'USD',
                status: 'completed',
                metadata: { giveaway_id }
            })

        // 3. Mark Giveaway as Fully Closed/Paid
        // Maybe we need a new status 'paid_out'? keeping 'completed' for now.

        return new Response(
            JSON.stringify({
                success: true,
                message: "Payout processed successfully",
                payout_amount: payoutAmount
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
