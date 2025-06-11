// src/hooks/useAuth.ts - Clean production version
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
    if (initialized.current) return
    initialized.current = true
    
    console.log('🔄 Starting auth initialization...')

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          setLoading(false)
          return
        }

        if (session) {
          console.log('✅ Session found for:', session.user.email)
          setSession(session)
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

    // Setup auth state listener
    subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event)
      
      if (event === 'SIGNED_IN' && session) {
        console.log('🔄 Auth state: SIGNED_IN detected')
        setSession(session)
        await loadUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.name)
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Auth state: SIGNED_OUT detected')
        setUser(null)
        setSession(null)
        setLoading(false)
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
    console.log('📋 Loading profile for:', email, '| User ID:', userId.substring(0, 8), '| Attempt:', retryCount + 1)
    
    try {
      // Force refresh the Supabase client session with timeout
      console.log('🔄 Refreshing Supabase session...')
      
      const refreshTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Session refresh timeout')), 5000)
      })
      
      try {
        await Promise.race([supabase.auth.refreshSession(), refreshTimeout])
        console.log('✅ Session refresh completed')
      } catch (refreshError: any) {
        console.warn('⚠️ Session refresh failed or timed out:', refreshError.message)
        // Continue anyway - sometimes the query works even if refresh fails
      }
      
      // Set a reasonable timeout for the database query
      const queryTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 8000)
      })
      
      // Race the query against timeout
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('🔍 Executing database query...')
      const result = await Promise.race([queryPromise, queryTimeout])
      const { data: existingUser, error: fetchError } = result as any

      if (fetchError) {
        console.error('❌ Database query error:', fetchError)
        
        // Retry logic for specific errors or connection issues
        if (retryCount < 2) {
          console.log('🔄 Retrying database query in 2 seconds... (attempt', retryCount + 2, ')')
          setTimeout(() => {
            loadUserProfile(userId, email, name, retryCount + 1)
          }, 2000)
          return
        }
        
        console.error('❌ Max retries reached, giving up')
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
      console.log('✅ User found in database:', {
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        emailVerified: existingUser.email_verified,
        adminApproved: existingUser.admin_approved
      })
      
      setUser(existingUser)
      setLoading(false)

    } catch (error: any) {
      console.error('❌ Profile loading exception:', error.message)
      
      // If it's any timeout, retry
      if ((error.message.includes('timeout') || error.message.includes('Timeout')) && retryCount < 2) {
        console.log('⏰ Operation timed out, retrying... (attempt', retryCount + 2, ')')
        setTimeout(() => {
          loadUserProfile(userId, email, name, retryCount + 1)
        }, 2000)
        return
      }
      
      console.error('❌ Profile loading failed completely after', retryCount + 1, 'attempts')
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
        setLoading(false)
        return
      }

      console.log('✅ User created successfully:', newUser.email, '| Role:', newUser.role)
      setUser(newUser)
      setLoading(false)
      
    } catch (createException) {
      console.error('❌ User creation exception:', createException)
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting login process for:', email)
    setLoading(true)

    try {
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
    
    setUser(null)
    setSession(null)
    setLoading(false)
    
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