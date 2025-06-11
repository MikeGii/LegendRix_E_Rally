// src/hooks/useAuth.ts - Optimized for speed
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
          await loadUserProfileFast(session.user.id, session.user.email!, session.user.user_metadata?.name)
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
        await loadUserProfileFast(session.user.id, session.user.email!, session.user.user_metadata?.name)
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

  const loadUserProfileFast = async (userId: string, email: string, name?: string) => {
    console.log('⚡ Fast loading profile for:', email)
    
    try {
      // Skip session refresh for the first attempt - just try the query directly
      console.log('🔍 Direct database query (no refresh)...')
      
      // Set aggressive timeout - fail fast
      const queryTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Fast timeout')), 3000) // Only 3 seconds!
      })
      
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      try {
        const result = await Promise.race([queryPromise, queryTimeout])
        const { data: existingUser, error: fetchError } = result as any

        if (fetchError) {
          console.warn('⚠️ Direct query failed:', fetchError.message)
          // Fall back to refresh method
          return loadUserProfileWithRefresh(userId, email, name)
        }

        if (!existingUser) {
          console.log('📝 User not found, creating...')
          await createUserRecord(userId, email, name)
          return
        }

        // Success!
        console.log('✅ Fast query success:', existingUser.email)
        setUser(existingUser)
        setLoading(false)
        return

      } catch (timeoutError) {
        console.warn('⏰ Fast query timed out, trying refresh method...')
        // Fall back to refresh method
        return loadUserProfileWithRefresh(userId, email, name)
      }

    } catch (error) {
      console.error('❌ Fast profile loading failed:', error)
      setLoading(false)
    }
  }

  const loadUserProfileWithRefresh = async (userId: string, email: string, name?: string) => {
    console.log('🔄 Fallback: Using refresh method for:', email)
    
    try {
      // Only refresh if the direct method failed
      console.log('🔄 Refreshing session...')
      
      const refreshTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), 2000) // Very short refresh timeout
      })
      
      try {
        await Promise.race([supabase.auth.refreshSession(), refreshTimeout])
        console.log('✅ Session refreshed')
      } catch (refreshError) {
        console.warn('⚠️ Session refresh timed out, continuing anyway...')
      }
      
      // Try the query again after refresh
      const queryTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Post-refresh timeout')), 4000)
      })
      
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const result = await Promise.race([queryPromise, queryTimeout])
      const { data: existingUser, error: fetchError } = result as any

      if (fetchError) {
        console.error('❌ Refresh method also failed:', fetchError)
        setLoading(false)
        return
      }

      if (!existingUser) {
        console.log('📝 User not found after refresh, creating...')
        await createUserRecord(userId, email, name)
        return
      }

      // Success!
      console.log('✅ Refresh method success:', existingUser.email)
      setUser(existingUser)
      setLoading(false)

    } catch (error) {
      console.error('❌ Refresh method failed completely:', error)
      setLoading(false)
    }
  }

  const createUserRecord = async (userId: string, email: string, name?: string) => {
    console.log('📝 Creating user record for:', email)
    
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

      console.log('✅ User created:', newUser.email)
      setUser(newUser)
      setLoading(false)
      
    } catch (createException) {
      console.error('❌ User creation exception:', createException)
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting login for:', email)
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
    console.log('🚪 Logout...')
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