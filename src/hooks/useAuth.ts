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
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()

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
          
          // Step 2: Load user profile with timeout protection
          await loadUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.name)
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
        console.log('🔄 Auth state: SIGNED_IN detected')
        setSession(session)
        // Load profile for new sign-ins
        await loadUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.name)
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Auth state: SIGNED_OUT detected')
        setUser(null)
        setSession(null)
        setLoading(false)
        // Clear any pending timeouts
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
      }
    })

    initAuth()

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.data.subscription.unsubscribe()
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, []) // Empty dependency array - only run once

  const loadUserProfile = async (userId: string, email: string, name?: string) => {
    console.log('📋 Loading profile for:', email, '| User ID:', userId.substring(0, 8))
    
    // Set a timeout to prevent infinite loading
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      console.error('⏰ Profile loading timeout - forcing completion')
      setLoading(false)
    }, 15000) // 15 second timeout

    try {
      // Step 1: Try to get user directly (no test query needed)
      console.log('🔍 Querying user by ID:', userId.substring(0, 8))
      
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (fetchError) {
        console.error('❌ Database query error:', fetchError)
        console.error('❌ Error details:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint
        })
        
        // If it's an RLS or permissions error, try to create the user anyway
        if (fetchError.code === 'PGRST301' || fetchError.code === 'PGRST116') {
          console.log('🔄 RLS/permissions error, attempting to create user...')
          await createNewUser(userId, email, name)
          return
        }
        
        setLoading(false)
        clearTimeout(loadingTimeoutRef.current!)
        return
      }

      console.log('📊 Query result:', existingUser ? 'User found' : 'User not found')

      if (!existingUser) {
        // User doesn't exist, create them
        await createNewUser(userId, email, name)
        return
      }

      // User exists - success!
      console.log('✅ User found in database:', {
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        emailVerified: existingUser.email_verified,
        adminApproved: existingUser.admin_approved
      })
      
      setUser(existingUser)
      setLoading(false)
      clearTimeout(loadingTimeoutRef.current!)

    } catch (error) {
      console.error('❌ Profile loading exception:', error)
      setLoading(false)
      clearTimeout(loadingTimeoutRef.current!)
    }
  }

  const createNewUser = async (userId: string, email: string, name?: string) => {
    console.log('📝 Creating new user record for:', email)
    
    try {
      const newUserData = {
        id: userId,
        email: email,
        name: name || email,
        role: email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
        email_verified: true,
        admin_approved: email === 'ewrc.admin@ideemoto.ee',
        status: email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
      }

      console.log('📝 Inserting user data:', { 
        ...newUserData, 
        id: newUserData.id.substring(0, 8) + '...' 
      })

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single()

      if (createError) {
        console.error('❌ Failed to create user:', createError)
        console.error('❌ Create error details:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        })
        setLoading(false)
        clearTimeout(loadingTimeoutRef.current!)
        return
      }

      console.log('✅ User created successfully:', newUser.email, '| Role:', newUser.role)
      setUser(newUser)
      setLoading(false)
      clearTimeout(loadingTimeoutRef.current!)
      
    } catch (createException) {
      console.error('❌ User creation exception:', createException)
      setLoading(false)
      clearTimeout(loadingTimeoutRef.current!)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting login process for:', email)
    setLoading(true)

    try {
      // Clear any existing timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

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

      console.log('✅ Authentication successful for:', data.user.email)
      console.log('🔄 Auth state listener will handle profile loading...')
      
      // The auth state change listener will handle loading the profile
      // Don't set loading to false here - let the profile loading complete
      
      return { success: true }

    } catch (error: any) {
      console.error('❌ Login exception:', error)
      setLoading(false)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    console.log('📝 Starting registration for:', email)
    
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
        console.log('✅ Registration successful, email confirmation required')
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to verify your account.' 
        }
      }

      console.log('✅ Registration successful with immediate login')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Registration exception:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    console.log('🚪 Starting logout process...')
    
    // Clear any pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    
    // Clear state immediately
    setUser(null)
    setSession(null)
    setLoading(false)
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    console.log('✅ Logout completed')
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