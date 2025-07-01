// src/hooks/useAuth.ts - Clean API layer only (no error handling)

'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name: string
  email: string
  player_name?: string | null
  role: 'user' | 'admin'
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
  created_at: string
}

// Clean API response types - no error handling mixed in
interface AuthResponse {
  success: boolean
  data?: any
  error?: string
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Refs for managing state in Vercel
  const currentUserIdRef = useRef<string | null>(null)
  const loadingProfileRef = useRef<boolean>(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    
    const initializeAuth = async () => {
      let timeoutId: NodeJS.Timeout | null = null
      
      try {
        timeoutId = setTimeout(() => {
          setLoading(false)
        }, 10000)

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setLoading(false)
          return
        }

        if (session?.user) {
          setSession(session)
          currentUserIdRef.current = session.user.id
          
          await loadUserProfile(
            session.user.id, 
            session.user.email!, 
            session.user.user_metadata?.name,
            session.user.user_metadata?.player_name
          )
        } else {
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    // Setup auth state listener
    let authEventTimeout: NodeJS.Timeout | null = null
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (authEventTimeout) {
        clearTimeout(authEventTimeout)
      }
      
      authEventTimeout = setTimeout(async () => {
        // Prevent duplicate processing for the same user
        if (session?.user?.id === currentUserIdRef.current && event !== 'SIGNED_OUT') {
          return
        }

        setSession(session)

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null)
          setSession(null)
          currentUserIdRef.current = null
          loadingProfileRef.current = false
          setLoading(false)
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          currentUserIdRef.current = session.user.id
          
          const userMetadata = session.user.user_metadata || {}
          
          await loadUserProfile(
            session.user.id,
            session.user.email!,
            userMetadata.name,
            userMetadata.player_name
          )
        }
      }, 500)
    })

    initializeAuth()

    return () => {
      subscription.unsubscribe()
      if (authEventTimeout) {
        clearTimeout(authEventTimeout)
      }
    }
  }, [])

  const loadUserProfile = async (userId: string, email: string, name?: string, playerName?: string): Promise<void> => {
    if (loadingProfileRef.current) {
      return
    }

    loadingProfileRef.current = true
    setLoading(true)

    try {

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      // Handle table not existing error
      if (error && error.code === '42P01') {
        console.warn('⚠️ users table does not exist, creating basic user from auth data')
        
        // Create basic user profile from auth session data
        const basicProfile = {
          id: userId,
          email: email,
          name: name || email.split('@')[0],
          player_name: playerName,
          role: 'user' as const,
          email_verified: true, // Since they successfully logged in
          admin_approved: true, // Assume approved for now
          status: 'approved' as const,
          created_at: new Date().toISOString()
        }

        setUser(basicProfile)
        setLoading(false)
        loadingProfileRef.current = false
        return
      }

      if (error && error.code !== 'PGRST116') {
        setLoading(false)
        loadingProfileRef.current = false
        return
      }

      if (!profile) {
        
        const newProfile = {
          id: userId,
          email: email,
          name: name || email.split('@')[0],
          player_name: playerName,
          role: 'user' as const,
          email_verified: false,
          admin_approved: false,
          status: 'pending_email' as const
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          setLoading(false)
          loadingProfileRef.current = false
          return
        }

        setUser(createdProfile)
      } else {
        setUser(profile)
      }
    } catch (err) {
    } finally {
      setLoading(false)
      loadingProfileRef.current = false
    }
  }

  // CLEAN API METHODS - Return structured responses, no error handling
  
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      if (data.user) {
        return {
          success: true,
          data: data.user
        }
      }

      return {
        success: false,
        error: 'Login failed - no user data returned'
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Login failed'
      }
    }
  }

  const register = async (email: string, password: string, name: string, playerName?: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            player_name: playerName?.trim() || null
          }
        }
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      if (data.user) {
        // The trigger now handles creating the user record with all fields including player_name
        // No need to create or update anything here
        console.log('✅ User registered successfully')
        
        return {
          success: true,
          data: data.user
        }
      }

      return {
        success: false,
        error: 'Registration failed - no user data returned'
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Registration failed'
      }
    }
  }
    
  const logout = async (): Promise<void> => {
    
    try {
      await supabase.auth.signOut()
      
      // Clear local state
      setUser(null)
      setSession(null)
      currentUserIdRef.current = null
      
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null)
      setSession(null)
      currentUserIdRef.current = null
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