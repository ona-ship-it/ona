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

        const { giveaway_id, ticket_count } = await req.json()

        // 1. Get User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 2. Get Giveaway Details (Price)
        const { data: giveaway, error: giveawayError } = await supabaseClient
            .from('giveaways')
            .select('ticket_price, status')
            .eq('id', giveaway_id)
            .single()

        if (giveawayError || !giveaway) throw new Error('Giveaway not found')
        if (giveaway.status !== 'active') throw new Error('Giveaway is not active')

        const totalCost = giveaway.ticket_price * ticket_count

        // 3. Check User Balance (Profile)
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single()

        if (profileError) throw new Error('Profile not found')

        // Parse balance (stored as text/string in DB based on Schema)
        const currentBalance = parseFloat(profile.balance || '0')
        if (currentBalance < totalCost) {
            throw new Error(`Insufficient funds. Cost: $${totalCost}, Balance: $${currentBalance}`)
        }

        // 4. Deduct Balance & create Ledger Entry
        // We update manually since we don't have stored procs for this yet in the setup
        const newBalance = currentBalance - totalCost

        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ balance: newBalance.toFixed(2) })
            .eq('id', user.id)

        if (updateError) throw new Error('Failed to update balance')

        // Record Transaction
        const { data: transaction, error: txError } = await supabaseClient
            .from('transactions')
            .insert({
                user_id: user.id,
                type: 'purchase',
                amount: totalCost,
                currency: 'USD',
                status: 'completed',
                metadata: { giveaway_id, ticket_count }
            })
            .select()
            .single()

        if (txError) throw new Error('Failed to record transaction')

        // 5. Generate Tickets
        const tickets = []
        for (let i = 0; i < ticket_count; i++) {
            tickets.push({
                user_id: user.id,
                giveaway_id: giveaway_id,
                ticket_number: Math.floor(100000 + Math.random() * 900000).toString(), // Simple random generation
                purchase_transaction_id: transaction.id,
                status: 'active'
            })
        }

        const { data: createdTickets, error: ticketError } = await supabaseClient
            .from('tickets')
            .insert(tickets)
            .select()

        if (ticketError) throw new Error('Failed to generate tickets')

        return new Response(
            JSON.stringify({
                success: true,
                message: `Successfully purchased ${ticket_count} tickets`,
                tickets: createdTickets,
                new_balance: newBalance
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
