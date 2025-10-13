// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Prevent hard crash during static builds or missing vars
    console.warn('⚠️ Missing Supabase environment variables.')
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
