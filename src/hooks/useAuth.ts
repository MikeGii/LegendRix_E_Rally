// src/hooks/useAuth.ts
import { useState, useEffect, useRef } from 'react'
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
  
  // Prevent multiple initializations
  const initialized = useRef(false)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return

    initialized.current = true
    console.log('🔄 Starting auth initialization...')

    const initAuth = async () => {
      try {
        // Step 1: Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          setLoading(false)
          return
        }

        if (session) {
          console.log('✅ Session found for:', session.user.email)
          setSession(session)
          
          // Step 2: Load user profile with retry logic
          await loadUserProfileWithRetry(session.user.id, session.user.email!, session.user.user_metadata?.name)
        } else {
          console.log('ℹ️ No session found')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setLoading(false)
      }
    }

    // Setup auth state listener (only once)
    subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event)
      
      if (event === 'SIGNED_IN' && session) {
        setSession(session)
        // Only proceed if we don't already have a user
        if (!user) {
          await loadUserProfileWithRetry(session.user.id, session.user.email!, session.user.user_metadata?.name)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setLoading(false)
      }
    })

    initAuth()

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.data.subscription.unsubscribe()
      }
    }
  }, []) // Empty dependency array - only run once

  const loadUserProfileWithRetry = async (userId: string, email: string, name?: string, retryCount = 0) => {
    try {
      console.log('📋 Loading profile for:', email)
      
      // Step 1: Check if user exists in database with error handling
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no rows

      // If there's a database error and we haven't retried yet, try once more
      if (fetchError && retryCount < 1) {
        console.warn('⚠️ Database error, retrying...', fetchError)
        setTimeout(() => {
          loadUserProfileWithRetry(userId, email, name, retryCount + 1)
        }, 1000)
        return
      }

      if (fetchError) {
        console.error('❌ Persistent database error:', fetchError)
        setLoading(false)
        return
      }

      if (!existingUser) {
        // User doesn't exist, create them
        console.log('📝 Creating new user record...')
        
        const newUserData = {
          id: userId,
          email: email,
          name: name || email,
          role: email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
          email_verified: true, // Assume verified if they can log in
          admin_approved: email === 'ewrc.admin@ideemoto.ee',
          status: email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
        }

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([newUserData])
          .select()
          .single()

        if (createError) {
          console.error('❌ Failed to create user:', createError)
          setLoading(false)
          return
        }

        console.log('✅ User created:', newUser.email)
        setUser(newUser)
        setLoading(false)
        return
      }

      // User exists
      console.log('✅ User loaded:', existingUser.email, '| Role:', existingUser.role)
      setUser(existingUser)
      setLoading(false)

    } catch (error) {
      console.error('❌ Profile loading error:', error)
      
      // If it's a network/connection error and we haven't retried, try once more
      if (retryCount < 1) {
        console.log('🔄 Retrying profile load...')
        setTimeout(() => {
          loadUserProfileWithRetry(userId, email, name, retryCount + 1)
        }, 2000)
        return
      }
      
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting login process...')
    setLoading(true)

    try {
      // Step 1: Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        console.error('❌ Authentication failed:', error.message)
        setLoading(false)
        return { success: false, error: error.message }
      }

      if (!data.user || !data.session) {
        console.error('❌ No user or session returned')
        setLoading(false)
        return { success: false, error: 'Login failed - no session created' }
      }

      console.log('✅ Authentication successful')
      
      // The auth state change listener will handle loading the profile
      // We don't need to do it here to avoid race conditions
      
      return { success: true }

    } catch (error: any) {
      console.error('❌ Login error:', error)
      setLoading(false)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    console.log('📝 Starting registration...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { name: name.trim() }
        }
      })

      if (error) {
        console.error('❌ Registration error:', error)
        return { success: false, error: error.message }
      }

      if (data.user && !data.session) {
        // Email confirmation required
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to verify your account.' 
        }
      }

      // Immediate login (email confirmation disabled)
      return { success: true }
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    console.log('🚪 Logging out...')
    
    // Clear state immediately
    setUser(null)
    setSession(null)
    setLoading(false)
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    console.log('✅ Logged out')
  }

  return {
    user,
    session,
    loading,
    login,
    register,
    logout
  }
}