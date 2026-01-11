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

        const { giveaway_id, amount, currency } = await req.json()

        // 1. Get User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 2. Check Balance
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single()

        const currentBalance = parseFloat(profile?.balance || '0')
        if (currentBalance < amount) throw new Error('Insufficient funds')

        // 3. Deduct User
        const newBalance = currentBalance - amount
        await supabaseClient
            .from('profiles')
            .update({ balance: newBalance.toFixed(2) })
            .eq('id', user.id)

        // Record User Transaction
        await supabaseClient
            .from('transactions')
            .insert({
                user_id: user.id,
                type: 'deposit', // to pool
                amount: -amount,
                currency: currency || 'USD',
                status: 'completed',
                metadata: { giveaway_id, action: 'donate' }
            })

        // 4. Update Giveaway Pool
        // Retrieve current pool
        const { data: giveaway } = await supabaseClient
            .from('giveaways')
            .select('prize_amount, escrow_amount') // assuming prize_amount tracks total raised for fundraisers?
            .eq('id', giveaway_id)
            .single()

        // For fundraisers, prize_amount usually tracks the 'Goal' or 'Current'. Let's assume escrow_amount tracks actual cash.
        const currentPool = giveaway?.escrow_amount || 0
        const newPool = currentPool + amount

        await supabaseClient
            .from('giveaways')
            .update({ escrow_amount: newPool })
            .eq('id', giveaway_id)

        return new Response(
            JSON.stringify({ success: true, message: "Donation received", new_pool_total: newPool }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }
})
