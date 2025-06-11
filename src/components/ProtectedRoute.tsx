'use client'

import { useAuth } from './AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
  requireEmailVerified?: boolean
  requireAdminApproved?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  requireEmailVerified = true,
  requireAdminApproved = true
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
        return
      }

      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        router.push('/')
        return
      }

      // Check email verification requirement
      if (requireEmailVerified && !user.emailVerified && user.role !== 'admin') {
        router.push('/')
        return
      }

      // Check admin approval requirement
      if (requireAdminApproved && !user.adminApproved && user.role !== 'admin') {
        router.push('/')
        return
      }
    }
  }, [user, loading, router, requiredRole, requireEmailVerified, requireAdminApproved])

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

  if (!user) {
    return null
  }

  // Allow access if user meets requirements or if they're an admin
  const hasAccess = user.role === 'admin' || (
    (!requiredRole || user.role === requiredRole) &&
    (!requireEmailVerified || user.emailVerified) &&
    (!requireAdminApproved || user.adminApproved)
  )

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}