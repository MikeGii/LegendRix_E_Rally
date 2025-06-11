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

  console.log('🛡️ ProtectedRoute check:', {
    loading,
    hasUser: !!user,
    userRole: user?.role,
    requiredRole,
    userEmail: user?.email
  })

  useEffect(() => {
    console.log('🛡️ ProtectedRoute useEffect triggered:', {
      loading,
      hasUser: !!user,
      userRole: user?.role,
      requiredRole
    })

    if (!loading && !user) {
      console.log('❌ No user found, redirecting to login')
      router.replace('/')
      return
    }

    if (!loading && requiredRole && user?.role !== requiredRole) {
      console.log('❌ Role mismatch, redirecting based on user role')
      const redirectUrl = user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
      console.log('🔄 Redirecting to:', redirectUrl)
      router.replace(redirectUrl)
      return
    }

    if (!loading && user) {
      console.log('✅ ProtectedRoute - Access granted for:', user.email, '| Role:', user.role)
    }
  }, [user, loading, requiredRole, router])

  // Show loading while checking auth
  if (loading) {
    console.log('⏳ ProtectedRoute showing loading state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading user profile...</p>
          <p className="text-slate-500 text-sm mt-2">This should complete within 10 seconds</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!user || (requiredRole && user.role !== requiredRole)) {
    console.log('🔄 ProtectedRoute showing redirect state')
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
  console.log('✅ ProtectedRoute rendering children for:', user.email)
  return <>{children}</>
}