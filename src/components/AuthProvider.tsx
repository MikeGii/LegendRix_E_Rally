// src/components/AuthProvider.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth as useSupabaseAuth } from '@/hooks/useAuth'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
  created_at: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ 
    success: boolean
    error?: string
    user?: any // Allow any user type to handle Supabase User vs our User interface
  }>
  register: (email: string, password: string, name: string) => Promise<{ 
    success: boolean
    error?: string
    message?: string 
  }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}