import { createClient } from '@supabase/supabase-js'

export const createClientComponentClient = () => {
  // Use environment variables with fallback to hardcoded values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obgjsswksaotyyzydkkn.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ2pzc3drc2FvdHl5enlka2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzQ0MjMsImV4cCI6MjA3MzcxMDQyM30.6EIr-lABoi0HH2Tea_LpGo5rrGmXn_UQsBiseAZaua4'
  
  return createClient(supabaseUrl, supabaseAnonKey)
}