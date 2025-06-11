// src/hooks/useAuth.ts - Fixed to prevent infinite loops
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
  
  // Prevent multiple initializations and profile loads
  const initialized = useRef(false)
  const subscriptionRef = useRef<any>(null)
  const loadingProfileRef = useRef(false)
  const currentUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    
    console.log('🔄 Starting auth initialization...')

    const initAuth = async () => {
      try {
        // Get existing session without forcing refresh
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ Existing session found for:', session.user.email)
          setSession(session)
          currentUserIdRef.current = session.user.id
          
          // Check if session is still valid
          const now = Math.floor(Date.now() / 1000)
          const expiresAt = session.expires_at || 0
          
          if (expiresAt > now + 300) { // If session expires in more than 5 minutes
            console.log('✅ Session is valid, loading user profile...')
            await loadUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.name)
          } else {
            console.log('⚠️ Session expiring soon, refreshing...')
            // Try to refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
            
            if (refreshError || !refreshData.session) {
              console.log('❌ Session refresh failed, signing out')
              await supabase.auth.signOut()
              setLoading(false)
              return
            }
            
            console.log('✅ Session refreshed successfully')
            setSession(refreshData.session)
            currentUserIdRef.current = refreshData.session.user.id
            await loadUserProfile(refreshData.session.user.id, refreshData.session.user.email!, refreshData.session.user.user_metadata?.name)
          }
        } else {
          console.log('ℹ️ No session found')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setLoading(false)
      }
    }

    // Setup auth state listener - only for actual auth changes
    subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event)
      
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
        await loadUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.name)
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
    })

    initAuth()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.data.subscription.unsubscribe()
      }
    }
  }, [])

  const loadUserProfile = async (userId: string, email: string, name?: string, retryCount = 0) => {
    // Prevent concurrent profile loads
    if (loadingProfileRef.current) {
      console.log('⚠️ Profile load already in progress, skipping...')
      return
    }
    
    loadingProfileRef.current = true
    console.log('📋 Loading profile for:', email, '| Attempt:', retryCount + 1)
    
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (fetchError) {
        console.error('❌ Database query error:', fetchError)
        
        // Retry logic for connection issues
        if (retryCount < 2 && (fetchError.message.includes('connection') || fetchError.message.includes('timeout'))) {
          console.log('🔄 Retrying database query in 2 seconds... (attempt', retryCount + 2, ')')
          setTimeout(() => {
            loadingProfileRef.current = false
            loadUserProfile(userId, email, name, retryCount + 1)
          }, 2000)
          return
        }
        
        console.error('❌ Max retries reached, giving up')
        loadingProfileRef.current = false
        setLoading(false)
        return
      }

      if (!existingUser) {
        // User doesn't exist, create them
        console.log('📝 User not found, creating new record')
        await createUserRecord(userId, email, name)
        return
      }

      // Success!
      console.log('✅ User profile loaded:', {
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status
      })
      
      setUser(existingUser)
      setLoading(false)
      loadingProfileRef.current = false

    } catch (error: any) {
      console.error('❌ Profile loading exception:', error.message)
      
      // Retry on timeout
      if (error.message.includes('timeout') && retryCount < 2) {
        console.log('⏰ Operation timed out, retrying... (attempt', retryCount + 2, ')')
        setTimeout(() => {
          loadingProfileRef.current = false
          loadUserProfile(userId, email, name, retryCount + 1)
        }, 2000)
        return
      }
      
      console.error('❌ Profile loading failed completely after', retryCount + 1, 'attempts')
      loadingProfileRef.current = false
      setLoading(false)
    }
  }

  const createUserRecord = async (userId: string, email: string, name?: string) => {
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

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single()

      if (createError) {
        console.error('❌ Failed to create user:', createError)
        loadingProfileRef.current = false
        setLoading(false)
        return
      }

      console.log('✅ User created successfully:', newUser.email, '| Role:', newUser.role)
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
      // Sign out first to clear any existing session
      await supabase.auth.signOut()
      
      // Small delay to ensure signout is processed
      await new Promise(resolve => setTimeout(resolve, 100))

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
    
    setUser(null)
    setSession(null)
    setLoading(false)
    currentUserIdRef.current = null
    loadingProfileRef.current = false
    
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