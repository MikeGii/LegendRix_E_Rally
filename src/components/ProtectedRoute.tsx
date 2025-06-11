'use client'

import { useAuth } from './AuthProvider'
import { useEffect, useState } from 'react'
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
  const [isChecking, setIsChecking] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Only run checks when loading is complete
    if (!loading) {
      console.log('🔍 ProtectedRoute checking access:', {
        user: user?.email || 'none',
        requiredRole,
        requireEmailVerified,
        requireAdminApproved
      })

      if (!user) {
        console.log('❌ No user, redirecting to login')
        setShouldRedirect(true)
        return
      }

      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        console.log('❌ Role mismatch, redirecting')
        setShouldRedirect(true)
        return
      }

      // Check email verification requirement (skip for admins)
      if (requireEmailVerified && !user.email_verified && user.role !== 'admin') {
        console.log('❌ Email not verified, redirecting')
        setShouldRedirect(true)
        return
      }

      // Check admin approval requirement (skip for admins)
      if (requireAdminApproved && !user.admin_approved && user.role !== 'admin') {
        console.log('❌ Not admin approved, redirecting')
        setShouldRedirect(true)
        return
      }

      console.log('✅ Access granted')
      setIsChecking(false)
    }
  }, [user, loading, router, requiredRole, requireEmailVerified, requireAdminApproved])

  // Redirect if needed
  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [shouldRedirect, router])

  // Show loading while auth is initializing or checking access
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">
            {loading ? 'Initializing...' : 'Checking access...'}
          </p>
        </div>
      </div>
    )
  }

  // Show redirect message
  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-red-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-400">Access denied. Redirecting...</p>
        </div>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}