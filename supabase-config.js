// Supabase Configuration
import { createClient } from '@supabase/supabase-js'

// Use environment variables for Vercel, fallback to hardcoded for local if needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dkswceahtpiiqnhfuytm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrc3djZWFodHBpaXFuaGZ1eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTY1NTcsImV4cCI6MjA4MzM5MjU1N30.j5V6wx9KfFJb7R_KoaD-iOFvIC9kYZ4JC-vp3uMccj4'

// Input validation
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn('⚠️ Supabase URL is not configured correctly.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is reachable
export async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1)
        if (error) {
            console.error('Supabase Connection Error:', error.message)
            return { connected: false, message: error.message }
        }
        return { connected: true }
    } catch (e) {
        console.error('Network Error:', e.message)
        return { connected: false, message: 'Failed to fetch. Is the project paused?' }
    }
}

// Export for debugging
export function isSupabaseConfigured() {
    return supabaseUrl && supabaseUrl.includes('supabase.co') && supabaseAnonKey.length > 20
}
