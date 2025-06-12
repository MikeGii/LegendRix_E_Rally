// src/hooks/useAuth.ts - Optimized and simplified
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { handleQueryError } from '@/lib/queryUtils'
import type { User, ApiResponse } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  session: any
}

interface AuthMethods {
  login: (email: string, password: string) => Promise<ApiResponse<any>>
  register: (email: string, password: string, name: string) => Promise<ApiResponse>
  logout: () => Promise<void>
}

export function useAuth(): AuthState & AuthMethods {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    session: null
  })

  // Refs to prevent race conditions
  const initialized = useRef(false)
  const currentUserId = useRef<string | null>(null)
  const isLoadingProfile = useRef(false)

  // ============= Profile Management =============
  const loadUserProfile = useCallback(async (userId: string, email: string, name?: string, retryCount = 0) => {
    if (isLoadingProfile.current && retryCount === 0) return
    
    isLoadingProfile.current = true
    console.log('📋 Loading profile:', email)
    
    try {
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        if (retryCount < 2) {
          setTimeout(() => loadUserProfile(userId, email, name, retryCount + 1), 1000)
          return
        }
        throw error
      }

      if (!existingUser) {
        await createUserRecord(userId, email, name)
        return
      }

      setState(prev => ({ ...prev, user: existingUser, loading: false }))
      console.log('✅ Profile loaded:', existingUser.email)
      
    } catch (error) {
      console.error('❌ Profile load failed:', error)
      setState(prev => ({ ...prev, loading: false }))
    } finally {
      isLoadingProfile.current = false
    }
  }, [])

  const createUserRecord = useCallback(async (userId: string, email: string, name?: string) => {
    console.log('📝 Creating user record:', email)
    
    try {
      const userData = {
        id: userId,
        email,
        name: name || email,
        role: email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
        email_verified: true,
        admin_approved: email === 'ewrc.admin@ideemoto.ee',
        status: email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) throw error

      setState(prev => ({ ...prev, user: newUser, loading: false }))
      console.log('✅ User created:', newUser.email)
      
    } catch (error) {
      console.error('❌ User creation failed:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // ============= Session Management =============
  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    console.log('🔄 Auth event:', event)

    if (session?.user?.id === currentUserId.current && event !== 'SIGNED_OUT') {
      return // Prevent duplicate processing
    }

    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          setState(prev => ({ ...prev, session }))
          currentUserId.current = session.user.id
          await loadUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.name)
        }
        break

      case 'SIGNED_OUT':
        setState({ user: null, session: null, loading: false })
        currentUserId.current = null
        isLoadingProfile.current = false
        break

      case 'TOKEN_REFRESHED':
        if (session) {
          setState(prev => ({ ...prev, session }))
          currentUserId.current = session.user.id
        }
        break
    }
  }, [loadUserProfile])

  // ============= Initialization =============
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          setState(prev => ({ ...prev, loading: false }))
          return
        }

        if (session?.user) {
          setState(prev => ({ ...prev, session }))
          currentUserId.current = session.user.id
          await loadUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.name)
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('❌ Auth init failed:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)
    initAuth()

    return () => subscription.unsubscribe()
  }, [handleAuthStateChange, loadUserProfile])

  // ============= Auth Methods =============
  const login = useCallback(async (email: string, password: string): Promise<ApiResponse<any>> => {
    console.log('🔐 Login attempt:', email)
    setState(prev => ({ ...prev, loading: true }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: false, error: error.message }
      }

      return { success: true, data: data.user }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: handleQueryError(error, 'Login') }
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string): Promise<ApiResponse> => {
    console.log('📝 Registration attempt:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const message = data.user && !data.session 
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful!'

      return { success: true, message }
    } catch (error: any) {
      return { success: false, error: handleQueryError(error, 'Registration') }
    }
  }, [])

  const logout = useCallback(async () => {
    console.log('🚪 Logout initiated')
    
    try {
      // Clear state immediately
      setState({ user: null, session: null, loading: false })
      currentUserId.current = null
      isLoadingProfile.current = false

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' })

      // Clear storage
      if (typeof window !== 'undefined') {
        // Clear all auth-related storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase') || key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
        sessionStorage.clear()
      }

      console.log('✅ Logout completed')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }, [])

  return {
    ...state,
    login,
    register,
    logout
  }
}