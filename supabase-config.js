// Supabase Configuration
// This file will be populated once you have your Supabase credentials

import { createClient } from '@supabase/supabase-js'

// TODO: Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = 'https://dkswceahtpiiqnhfuytm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrc3djZWFodHBpaXFuaGZ1eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTY1NTcsImV4cCI6MjA4MzM5MjU1N30.j5V6wx9KfFJb7R_KoaD-iOFvIC9kYZ4JC-vp3uMccj4'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is configured
export function isSupabaseConfigured() {
    return supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
}

// Export for debugging
if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not configured yet. Please update supabase-config.js with your credentials.')
}
