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
    // Get initial session but don't auto-login
    const getInitialSession = async () => {
      try {
        console.log('🔍 Checking for existing session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          return
        }

        if (session) {
          console.log('📱 Found existing session:', session.user.email)
          
          // Check if user intentionally logged in (stored in localStorage for persistence across refreshes)
          const intentionalLogin = localStorage.getItem('auth_intended_login')
          
          if (intentionalLogin) {
            console.log('🔄 Restoring intentional login session')
            setSession(session)
            await fetchUserProfile(session.user.id)
          } else {
            console.log('🚪 No intentional login found, clearing session')
            await supabase.auth.signOut()
            setLoading(false)
          }
        } else {
          console.log('❌ No session found')
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
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ User signed in, fetching profile...')
          setSession(session)
          localStorage.setItem('auth_intended_login', 'true')
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out')
          setUser(null)
          setSession(null)
          localStorage.removeItem('auth_intended_login')
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching user profile for:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        
        if (error.code === 'PGRST116') {
          console.log('User not found in users table')
        }
        setUser(null)
        setLoading(false)
        return
      }

      console.log('✅ User profile loaded:', data.email)
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
      console.error('❌ Error fetching user profile:', error)
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
      console.log('📧 Email:', email)
      
      // Mark this as an intended login
      localStorage.setItem('auth_intended_login', 'true')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      console.log('📊 Supabase login response:', {
        user: data.user?.email,
        session: !!data.session,
        error: error?.message
      })

      if (error) {
        console.error('❌ Login error:', error)
        localStorage.removeItem('auth_intended_login')
        return { success: false, error: error.message }
      }

      if (data.session && data.user) {
        console.log('✅ Login successful, session created')
        return { success: true }
      }

      localStorage.removeItem('auth_intended_login')
      return { success: false, error: 'Login failed - no session created' }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      localStorage.removeItem('auth_intended_login')
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      console.log('=== LOGOUT START ===')
      
      // Clear session storage first
      localStorage.removeItem('auth_intended_login')
      sessionStorage.clear()
      
      // Clear local storage to prevent auto-login
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token')
      
      // Clear local state immediately for better UX
      setUser(null)
      setSession(null)
      setLoading(false)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('❌ Logout error:', error)
      } else {
        console.log('✅ Logout successful')
      }
      
      // Force a complete page reload to clear all state
      window.location.href = '/'
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force redirect even if logout fails
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