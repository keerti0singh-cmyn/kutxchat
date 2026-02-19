import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client for client components
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// For server components
export const createServerClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
