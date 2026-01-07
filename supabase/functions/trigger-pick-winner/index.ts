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

        // Validate Status (Should be active)
        if (giveaway.status !== 'active') throw new Error('Giveaway is not active')

        // Optional: Check if end_date has passed
        if (giveaway.ends_at && new Date(giveaway.ends_at) > new Date()) {
            // throw new Error('Giveaway has not ended yet') 
            // For MVP manual trigger, we might allow this override or require admin
        }

        // 2. Fetch all eligible tickets
        const { data: tickets, error: ticketError } = await supabaseClient
            .from('tickets')
            .select('id, user_id')
            .eq('giveaway_id', giveaway_id)
            .eq('status', 'active')

        if (ticketError) throw new Error('Failed to fetch tickets')
        if (!tickets || tickets.length === 0) throw new Error('No tickets found for this giveaway')

        // 3. Pick Random Winner
        const randomIndex = Math.floor(Math.random() * tickets.length)
        const winningTicket = tickets[randomIndex]
        const winnerId = winningTicket.user_id

        // 4. Update Giveaway
        const { error: updateError } = await supabaseClient
            .from('giveaways')
            .update({
                winner_id: winnerId,
                status: 'completed' // Mark as completed waiting for payout? Or just set winner?
            })
            .eq('id', giveaway_id)

        if (updateError) throw new Error('Failed to update winner')

        // Optional: Create Notification for Winner (omitted for MVP)

        return new Response(
            JSON.stringify({
                success: true,
                message: "Winner selected successfully",
                winner_id: winnerId,
                ticket_id: winningTicket.id
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
