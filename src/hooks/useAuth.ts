import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
  created_at: string
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session:', session?.user?.email || 'No session')
        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        setUser(null)
      } else {
        console.log('User profile loaded:', data.email)
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          email_verified: data.email_verified,
          admin_approved: data.admin_approved,
          status: data.status,
          created_at: data.created_at
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('=== REGISTRATION START ===')
      console.log('Email:', email)
      console.log('Name:', name)
      console.log('Password length:', password.length)
      
      // REMOVED: existing user check that was causing 406 error
      // Let Supabase handle duplicate email detection
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name
          }
        }
      })

      console.log('Supabase signup response:', {
        user: data.user?.email,
        userData: data.user?.user_metadata,
        session: !!data.session,
        error: error?.message
      })

      if (error) {
        console.error('Supabase auth signup error:', error)
        return { success: false, error: error.message }
      }

      // If signup successful but no session, email confirmation is required
      if (data.user && !data.session) {
        console.log('Registration successful, email confirmation required')
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to verify your account.' 
        }
      }

      // If we have a session, user is immediately logged in
      if (data.user && data.session) {
        console.log('Registration successful with immediate login')
        return { success: true }
      }

      console.log('Registration completed')
      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('=== LOGIN START ===')
      console.log('Email:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      console.log('Supabase login response:', {
        user: data.user?.email,
        session: !!data.session,
        error: error?.message
      })

      if (error) {
        console.error('Login error:', error)
        return { success: false, error: error.message }
      }

      console.log('Login successful:', data.user?.email)
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    session,
    loading,
    register,
    login,
    logout
  }
}