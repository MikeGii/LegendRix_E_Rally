// src/hooks/useAuth.ts - Vercel-optimized version with player_name support
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  name: string
  email: string
  player_name?: string | null  // Add this line
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
  
  // Prevent multiple initializations and profile loads
  const initialized = useRef(false)
  const subscriptionRef = useRef<any>(null)
  const loadingProfileRef = useRef(false)
  const currentUserIdRef = useRef<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    
    console.log('🔄 Starting auth initialization...')

    // Set a maximum timeout for the entire auth process
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        console.log('⏰ Auth initialization timeout reached, setting loading to false')
        setLoading(false)
        loadingProfileRef.current = false
      }
    }, 10000) // 10 second timeout

    const initAuth = async () => {
      try {
        // For Vercel: Add timeout to session check
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )

        const { data: { session }, error } = await Promise.race([
          sessionPromise, 
          timeoutPromise
        ]) as any

        if (error) {
          console.error('❌ Session error:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ Existing session found for:', session.user.email)
          setSession(session)
          currentUserIdRef.current = session.user.id
          
          // For Vercel: Don't check session expiry, just load profile
          console.log('✅ Loading user profile...')
          await loadUserProfile(
            session.user.id, 
            session.user.email!, 
            session.user.user_metadata?.name,
            session.user.user_metadata?.player_name  // Pass player_name from metadata
          )
        } else {
          console.log('ℹ️ No session found')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setLoading(false)
      } finally {
        // Clear the timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }

    // Setup auth state listener with debouncing for Vercel
    let authEventTimeout: NodeJS.Timeout | null = null
    
    subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event)
      
      // Clear any pending auth event processing
      if (authEventTimeout) {
        clearTimeout(authEventTimeout)
      }
      
      // Debounce auth events to prevent rapid-fire processing in Vercel
      authEventTimeout = setTimeout(async () => {
        // Prevent duplicate processing for the same user
        if (session?.user?.id === currentUserIdRef.current && event !== 'SIGNED_OUT') {
          console.log('⚠️ Ignoring duplicate auth event for same user')
          return
        }
        
        if (event === 'SIGNED_IN' && session) {
          console.log('🔄 Auth state: SIGNED_IN detected for:', session.user.email)
          
          // Prevent loading profile if already loading
          if (loadingProfileRef.current) {
            console.log('⚠️ Profile already loading, skipping...')
            return
          }
          
          setSession(session)
          currentUserIdRef.current = session.user.id
          await loadUserProfile(
            session.user.id, 
            session.user.email!, 
            session.user.user_metadata?.name,
            session.user.user_metadata?.player_name  // Pass player_name from metadata
          )
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Auth state: SIGNED_OUT detected')
          setUser(null)
          setSession(null)
          setLoading(false)
          currentUserIdRef.current = null
          loadingProfileRef.current = false
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed silently')
          setSession(session)
          currentUserIdRef.current = session.user.id
          // Don't reload profile, just update session
        }
      }, 100) // 100ms debounce
    })

    initAuth()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.data.subscription.unsubscribe()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (authEventTimeout) {
        clearTimeout(authEventTimeout)
      }
    }
  }, [])

  const loadUserProfile = async (userId: string, email: string, name?: string, playerName?: string, retryCount = 0) => {
    // Prevent concurrent profile loads
    if (loadingProfileRef.current) {
      console.log('⚠️ Profile load already in progress, skipping...')
      return
    }
    
    loadingProfileRef.current = true
    console.log('📋 Loading profile for:', email, '| Attempt:', retryCount + 1)
    
    try {
      // For Vercel: Add timeout to database queries
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 8000)
      )

      const { data: existingUser, error: fetchError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any

      if (fetchError) {
        console.error('❌ Database query error:', fetchError)
        
        // More aggressive retry for Vercel
        if (retryCount < 3) {
          console.log('🔄 Retrying database query in 1 second... (attempt', retryCount + 2, ')')
          setTimeout(() => {
            loadingProfileRef.current = false
            loadUserProfile(userId, email, name, playerName, retryCount + 1)
          }, 1000)
          return
        }
        
        console.error('❌ Max retries reached, giving up')
        loadingProfileRef.current = false
        setLoading(false)
        return
      }

      if (!existingUser) {
        console.log('📝 User not found, creating new record')
        await createUserRecord(userId, email, name, playerName)
        return
      }

      console.log('✅ User profile loaded:', {
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        player_name: existingUser.player_name
      })
      
      setUser(existingUser)
      setLoading(false)
      loadingProfileRef.current = false

    } catch (error: any) {
      console.error('❌ Profile loading exception:', error.message)
      
      // For Vercel: More forgiving retry logic
      if (retryCount < 3) {
        console.log('⏰ Retrying due to error... (attempt', retryCount + 2, ')')
        setTimeout(() => {
          loadingProfileRef.current = false
          loadUserProfile(userId, email, name, playerName, retryCount + 1)
        }, 1000)
        return
      }
      
      console.error('❌ Profile loading failed completely after', retryCount + 1, 'attempts')
      loadingProfileRef.current = false
      setLoading(false)
    }
  }

  const createUserRecord = async (userId: string, email: string, name?: string, playerName?: string) => {
    console.log('📝 Creating new user record for:', email)
    
    try {
      const newUserData = {
        id: userId,
        email: email,
        name: name || email,
        player_name: playerName || null,  // Add player_name field
        role: email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
        email_verified: true,
        admin_approved: email === 'ewrc.admin@ideemoto.ee',
        status: email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
      }

      // For Vercel: Add timeout to create operation
      const createPromise = supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Create user timeout')), 8000)
      )

      const { data: newUser, error: createError } = await Promise.race([
        createPromise,
        timeoutPromise
      ]) as any

      if (createError) {
        console.error('❌ Failed to create user:', createError)
        loadingProfileRef.current = false
        setLoading(false)
        return
      }

      console.log('✅ User created successfully:', newUser.email, '| Role:', newUser.role, '| Player:', newUser.player_name)
      setUser(newUser)
      setLoading(false)
      loadingProfileRef.current = false
      
    } catch (createException) {
      console.error('❌ User creation exception:', createException)
      loadingProfileRef.current = false
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting login process for:', email)
    setLoading(true)

    try {
      // For Vercel: Clear any existing state first
      setUser(null)
      setSession(null)
      currentUserIdRef.current = null
      loadingProfileRef.current = false

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
      
      // The auth state listener will handle the rest
      return { success: true, user: data.user }

    } catch (error: any) {
      console.error('❌ Login exception:', error)
      setLoading(false)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (email: string, password: string, name: string, playerName?: string) => {
    console.log('📝 Starting registration for:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { 
            name: name.trim(),
            player_name: playerName?.trim()  // Include player_name in user metadata
          }
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
          message: 'Registreerimine õnnestus! Palun kontrolli oma e-posti, et kinnitada kasutaja (PS! palun vaata ka rämpsposti)!',
          user: data.user
        }
      }

      if (data.user && data.session) {
        console.log('✅ Registration successful, user logged in')
        // The auth state listener will handle profile creation
        return { 
          success: true, 
          message: 'Registration successful!',
          user: data.user 
        }
      }

      return { success: false, error: 'Registration failed - no user created' }
      
    } catch (error: any) {
      console.error('❌ Registration exception:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    console.log('🚪 Starting comprehensive logout process...')
    
    try {
      // Clear React state immediately
      setUser(null)
      setSession(null)
      setLoading(false)
      currentUserIdRef.current = null
      loadingProfileRef.current = false
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('❌ Supabase signOut error:', error)
      }
      
      // Clear all possible storage locations
      if (typeof window !== 'undefined') {
        try {
          // Clear localStorage
          window.localStorage.removeItem('supabase.auth.token')
          window.localStorage.removeItem('sb-localhost-auth-token')
          window.localStorage.removeItem('sb-' + window.location.hostname + '-auth-token')
          
          // Clear any other Supabase keys
          Object.keys(window.localStorage).forEach(key => {
            if (key.startsWith('supabase') || key.startsWith('sb-')) {
              window.localStorage.removeItem(key)
            }
          })
          
          // Clear sessionStorage
          window.sessionStorage.clear()
          
          console.log('✅ All storage cleared')
        } catch (storageError) {
          console.error('❌ Storage clearing error:', storageError)
        }
      }
      
      console.log('✅ Logout process completed successfully')
      
    } catch (error) {
      console.error('❌ Logout process failed:', error)
      
      // Force clear state even if logout fails
      setUser(null)
      setSession(null)
      setLoading(false)
      currentUserIdRef.current = null
      loadingProfileRef.current = false
    }
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