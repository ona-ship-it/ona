// Edge Function: sync-user-registration
// Handles user ID synchronization between auth.users and onagui.app_users
// Can be called from your frontend registration flow or as a webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncUserRequest {
  userId: string;
  email: string;
  username?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    if (req.method === 'POST') {
      const { userId, email, username, metadata }: SyncUserRequest = await req.json()

      if (!userId || !email) {
        return new Response(
          JSON.stringify({ error: 'userId and email are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if user already exists in onagui.app_users
      const { data: existingUser, error: checkError } = await supabase
        .from('app_users')
        .select('id, email')
        .eq('id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      let result;
      
      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('app_users')
          .update({
            email,
            username: username || existingUser.username || email.split('@')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()

        if (error) throw error
        result = { action: 'updated', user: data[0] }
      } else {
        // Create new user in onagui.app_users
        const { data, error } = await supabase
          .from('app_users')
          .insert({
            id: userId,
            email,
            username: username || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()

        if (error) throw error
        result = { action: 'created', user: data[0] }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `User ${result.action} successfully`,
          data: result
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle GET request - health check
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          message: 'User sync service is running',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in sync-user-registration:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})