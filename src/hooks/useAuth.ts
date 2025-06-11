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
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, fetching profile...')
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        
        // If user doesn't exist in users table, create a basic profile
        if (error.code === 'PGRST116') {
          console.log('User not found in users table, this might be expected for new signups')
          setUser(null)
        }
        setLoading(false)
        return
      }

      console.log('User profile loaded successfully:', data.email)
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
      setLoading(false)
      
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('=== REGISTRATION START ===')
      console.log('Email:', email)
      console.log('Name:', name)
      
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
        session: !!data.session,
        error: error?.message
      })

      if (error) {
        console.error('Supabase auth signup error:', error)
        return { success: false, error: error.message }
      }

      if (data.user && !data.session) {
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to verify your account.' 
        }
      }

      if (data.user && data.session) {
        console.log('Registration successful with immediate login')
        return { success: true }
      }

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

      if (data.session && data.user) {
        console.log('Login successful, session created')
        // Don't fetch profile here, let the auth state change handler do it
        return { success: true }
      }

      return { success: false, error: 'Login failed - no session created' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      console.log('=== LOGOUT START ===')
      
      // Clear local state immediately
      setUser(null)
      setSession(null)
      setLoading(false)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
      } else {
        console.log('✅ Logout successful')
      }
      
      // Redirect to login page
      window.location.href = '/'
      
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
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