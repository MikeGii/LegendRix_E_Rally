import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    Missing Supabase environment variables!
    NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'Missing'}
  `)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disabled to prevent token in URL issues
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    debug: false // Disabled debug logging completely
  },
  global: {
    headers: {
      'X-Client-Info': 'legendrix-e-rally@1.0.0',
    },
  },
})

// Database Types
export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
  verification_token?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Rally {
  id: string
  name: string
  game: string
  date: string
  registration_deadline: string
  status: 'upcoming' | 'active' | 'completed'
  description?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface RallyRegistration {
  id: string
  rally_id: string
  user_id: string
  status: 'registered' | 'cancelled' | 'completed'
  created_at: string
}

// Helper function to get user session with error handling
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Helper function to get user with type safety
export const getUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user as User | null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}