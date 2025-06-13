// src/components/AuthProvider.tsx - Clean provider that uses the hook
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthHook } from '@/hooks/useAuth'

interface User {
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

interface AuthContextType {
  user: User | null
  session: any | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ 
    success: boolean
    error?: string
    user?: any
  }>
  register: (email: string, password: string, name: string, playerName?: string) => Promise<{ 
    success: boolean
    error?: string
    message?: string 
  }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()
  
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