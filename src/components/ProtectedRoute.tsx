// src/components/ProtectedRoute.tsx
'use client'

import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // In ProtectedRoute.tsx, update the useEffect:
  useEffect(() => {
    if (!loading && !user) {
      console.log('❌ No user, redirecting to login')
      router.replace('/')
      return
    }

    if (!loading && requiredRole && user?.role !== requiredRole) {
      console.log('❌ Role mismatch, redirecting')
      router.replace(user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard')
      return
    }
  }, [user, loading, requiredRole, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-red-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  // User has access
  return <>{children}</>
}