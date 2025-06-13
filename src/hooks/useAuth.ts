// src/hooks/useAuth.ts - Clean hook only (no provider)

'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name: string
  email: string
  player_name?: string | null  // Add player_name field
  role: 'user' | 'admin'
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
  created_at: string
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Refs for managing state in Vercel
  const currentUserIdRef = useRef<string | null>(null)
  const loadingProfileRef = useRef<boolean>(false)
  const subscriptionRef = useRef<any>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    
    console.log('🚀 Initializing auth system...')
    
    const initializeAuth = async () => {
      let timeoutId: NodeJS.Timeout | null = null
      
      try {
        // Set timeout for Vercel serverless functions
        timeoutId = setTimeout(() => {
          console.log('⏰ Auth initialization timeout, continuing...')
          setLoading(false)
        }, 10000)

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
          
          console.log('✅ Loading user profile...')
          await loadUserProfile(
            session.user.id, 
            session.user.email!, 
            session.user.user_metadata?.name,
            session.user.user_metadata?.player_name  // FIXED: Pass player_name from metadata
          )
        } else {
          console.log('ℹ️ No session found')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setLoading(false)
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    // Setup auth state listener with proper player_name handling
    let authEventTimeout: NodeJS.Timeout | null = null
    
    subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event)
      
      // Clear any pending auth event processing
      if (authEventTimeout) {
        clearTimeout(authEventTimeout)
      }
      
      // Debounce auth events to prevent rapid-fire processing
      authEventTimeout = setTimeout(async () => {
        // Prevent duplicate processing for the same user
        if (session?.user?.id === currentUserIdRef.current && event !== 'SIGNED_OUT') {
          console.log('⚠️ Ignoring duplicate auth event for same user')
          return
        }

        setSession(session)

        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🚪 User signed out or no session')
          setUser(null)
          setSession(null)
          currentUserIdRef.current = null
          loadingProfileRef.current = false
          setLoading(false)
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log(`✅ User ${event.toLowerCase()}:`, session.user.email)
          currentUserIdRef.current = session.user.id
          
          // FIXED: Always pass player_name from user metadata
          const userMetadata = session.user.user_metadata || {}
          console.log('📋 User metadata:', userMetadata)
          
          await loadUserProfile(
            session.user.id,
            session.user.email!,
            userMetadata.name,
            userMetadata.player_name  // CRITICAL FIX: Use metadata player_name
          )
        }
      }, 500) // 500ms debounce
    })

    // Initialize auth
    initializeAuth()

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth subscription...')
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
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
    console.log('📋 Loading profile for:', email, '| Player Name:', playerName, '| Attempt:', retryCount + 1)
    
    try {
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
        console.log('📝 User not found, creating new record with player_name:', playerName)
        await createUserRecord(userId, email, name, playerName)
        return
      }

      // FIXED: Update existing user record if player_name is missing but available in metadata
      if (!existingUser.player_name && playerName) {
        console.log('🔄 Updating existing user with missing player_name:', playerName)
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ player_name: playerName })
          .eq('id', userId)
          .select()
          .single()

        if (updateError) {
          console.error('❌ Failed to update player_name:', updateError)
        } else {
          console.log('✅ Player name updated successfully')
          setUser(updatedUser)
          setLoading(false)
          loadingProfileRef.current = false
          return
        }
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
    console.log('📝 Creating new user record for:', email, '| Player Name:', playerName)
    
    try {
      const newUserData = {
        id: userId,
        email: email,
        name: name || email,
        player_name: playerName || null,  // CRITICAL: Include player_name
        role: email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
        email_verified: true,
        admin_approved: email === 'ewrc.admin@ideemoto.ee',
        status: email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
      }

      console.log('📝 User data being inserted:', newUserData)

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

      console.log('✅ User created successfully:', {
        email: newUser.email,
        role: newUser.role,
        player_name: newUser.player_name
      })
      
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
    console.log('📝 Starting registration for:', email, '| Player Name:', playerName)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { 
            name: name.trim(),
            player_name: playerName?.trim()  // CRITICAL: Store in user metadata
          }
        }
      })

      if (error) {
        console.error('❌ Registration error:', error)
        return { success: false, error: error.message }
      }

      if (data.user && !data.session) {
        console.log('✅ Registration successful, email confirmation required')
        console.log('📧 User metadata stored:', data.user.user_metadata)
        return { 
          success: true, 
          message: 'Registreerimine õnnestus! Palun kontrolli oma e-posti, et kinnitada kasutaja (PS! palun vaata ka rämpsposti)!',
          user: data.user
        }
      }

      if (data.user && data.session) {
        console.log('✅ Registration successful, user logged in immediately')
        console.log('📧 User metadata stored:', data.user.user_metadata)
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
      setUser(null)
      setSession(null)
      setLoading(false)
      currentUserIdRef.current = null
      loadingProfileRef.current = false
      
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('❌ Supabase signOut error:', error)
      }
      
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem('supabase.auth.token')
          window.localStorage.removeItem('sb-localhost-auth-token')
          window.localStorage.removeItem('sb-' + window.location.hostname + '-auth-token')
          
          Object.keys(window.localStorage).forEach(key => {
            if (key.startsWith('supabase') || key.startsWith('sb-')) {
              window.localStorage.removeItem(key)
            }
          })
          
          window.sessionStorage.clear()
          console.log('✅ All storage cleared')
        } catch (storageError) {
          console.error('❌ Storage clearing error:', storageError)
        }
      }
      
      console.log('✅ Logout process completed successfully')
      
    } catch (error) {
      console.error('❌ Logout process failed:', error)
      
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