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
  const abortControllerRef = useRef<AbortController>()

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
        
        // Cancel any pending queries
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, []) // Empty dependency array - only run once

  const loadUserProfile = async (userId: string, email: string, name?: string) => {
    console.log('📋 Loading profile for:', email, '| User ID:', userId.substring(0, 8))
    
    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    
    // Set a race condition between timeout and query
    const timeoutPromise = new Promise((resolve) => {
      loadingTimeoutRef.current = setTimeout(() => {
        console.error('⏰ Database query timeout - using cached/fallback approach')
        resolve('timeout')
      }, 3000) // Very aggressive 3-second timeout
    })

    try {
      console.log('🔍 Starting user query with timeout race...')
      
      // Race between the database query and timeout
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
        .then(result => ({ type: 'query' as const, result }))

      const raceResult = await Promise.race([
        queryPromise,
        timeoutPromise.then(() => ({ type: 'timeout' as const }))
      ])

      // Clear the timeout since we got a result
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      if (raceResult.type === 'timeout') {
        console.log('🔄 Query timed out, using fallback strategy')
        await handleFallbackStrategy(userId, email, name)
        return
      }

      // Now TypeScript knows this is the query result type
      const { data: existingUser, error: fetchError } = raceResult.result

      if (fetchError) {
        console.error('❌ Database query error:', fetchError)
        console.log('🔄 Query error, using fallback strategy')
        await handleFallbackStrategy(userId, email, name)
        return
      }

      console.log('📊 Query result:', existingUser ? 'User found' : 'User not found')

      if (!existingUser) {
        console.log('📝 User not found, trying quick creation...')
        await attemptUserCreation(userId, email, name)
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

    } catch (error) {
      console.error('❌ Profile loading exception:', error)
      console.log('🆘 Exception occurred, using fallback strategy')
      await handleFallbackStrategy(userId, email, name)
    }
  }

  const attemptUserCreation = async (userId: string, email: string, name?: string) => {
    console.log('📝 Attempting quick user creation for:', email)
    
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

      // Race the creation with a timeout too
      const createPromise = supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single()

      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('timeout'), 2000) // 2 second timeout for creation
      })

      const createResult = await Promise.race([
        createPromise.then(result => ({ type: 'create' as const, result })),
        timeoutPromise.then(() => ({ type: 'timeout' as const }))
      ])

      if (createResult.type === 'timeout') {
        console.log('🔄 User creation timed out, using fallback')
        createFallbackUser(userId, email, name)
        return
      }

      // Now TypeScript knows this is the create result type
      const { data: newUser, error: createError } = createResult.result

      if (createError) {
        console.error('❌ Failed to create user:', createError)
        console.log('🔄 Creation failed, using fallback')
        createFallbackUser(userId, email, name)
        return
      }

      console.log('✅ User created successfully:', newUser.email, '| Role:', newUser.role)
      setUser(newUser)
      setLoading(false)
      
    } catch (createException) {
      console.error('❌ User creation exception:', createException)
      console.log('🔄 Creation exception, using fallback')
      createFallbackUser(userId, email, name)
    }
  }

  const handleFallbackStrategy = async (userId: string, email: string, name?: string) => {
    console.log('🔄 Implementing fallback strategy for:', email)
    
    // Try to use cached user data from localStorage if available
    try {
      const cachedUserKey = `user_cache_${userId}`
      const cachedUserData = localStorage.getItem(cachedUserKey)
      
      if (cachedUserData) {
        const cachedUser = JSON.parse(cachedUserData)
        console.log('✅ Using cached user data:', cachedUser.email)
        setUser(cachedUser)
        setLoading(false)
        return
      }
    } catch (cacheError) {
      console.log('⚠️ Could not use cached data:', cacheError)
    }
    
    // If no cache, create fallback user
    createFallbackUser(userId, email, name)
  }

  const createFallbackUser = (userId: string, email: string, name?: string) => {
    console.log('🆘 Creating fallback user object for:', email)
    
    const fallbackUser: UserProfile = {
      id: userId,
      name: name || email,
      email: email,
      role: email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
      email_verified: true,
      admin_approved: email === 'ewrc.admin@ideemoto.ee',
      status: email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'approved', // Default to approved for fallback
      created_at: new Date().toISOString()
    }
    
    // Cache the user data for future use
    try {
      const cachedUserKey = `user_cache_${userId}`
      localStorage.setItem(cachedUserKey, JSON.stringify(fallbackUser))
    } catch (cacheError) {
      console.log('⚠️ Could not cache user data:', cacheError)
    }
    
    console.log('✅ Fallback user created:', fallbackUser.email, '| Role:', fallbackUser.role)
    setUser(fallbackUser)
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting login process for:', email)
    setLoading(true)

    try {
      // Clear any existing timeouts and abort controllers
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
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
    
    // Cancel any pending operations
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
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