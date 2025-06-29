// src/components/ProtectedRoute.tsx - Updated with user-dashboard as default
'use client'

import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
  requireApproval?: boolean // New prop to require admin approval
}

export function ProtectedRoute({ children, requiredRole, requireApproval = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const redirectedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  console.log('🛡️ ProtectedRoute check:', {
    loading,
    hasUser: !!user,
    userRole: user?.role,
    userStatus: user?.status,
    adminApproved: user?.admin_approved,
    requiredRole,
    requireApproval,
    userEmail: user?.email,
    redirected: redirectedRef.current
  })

  useEffect(() => {
    // Set a maximum timeout for loading state
    timeoutRef.current = setTimeout(() => {
      if (loading && !user) {
        console.log('⏰ ProtectedRoute timeout reached, forcing redirect to login')
        if (!redirectedRef.current) {
          redirectedRef.current = true
          router.replace('/')
        }
      }
    }, 15000) // 15 second timeout for Vercel

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [loading, user, router])

  useEffect(() => {
    console.log('🛡️ ProtectedRoute useEffect triggered:', {
      loading,
      hasUser: !!user,
      userRole: user?.role,
      userStatus: user?.status,
      adminApproved: user?.admin_approved,
      requiredRole,
      redirected: redirectedRef.current
    })

    // Don't redirect if already redirected or still loading
    if (redirectedRef.current || loading) {
      return
    }

    // Check 1: User must be logged in
    if (!user) {
      console.log('❌ No user found, redirecting to login')
      redirectedRef.current = true
      router.replace('/')
      return
    }

    // Check 2: User must be approved (if requireApproval is true)
    if (requireApproval && user.status !== 'approved' && user.role !== 'admin') {
      console.log('❌ User not approved, redirecting to pending approval page')
      redirectedRef.current = true
      router.replace('/pending-approval')
      return
    }

    // Check 3: Role check (if requiredRole is specified)
    if (requiredRole && user.role !== requiredRole) {
      console.log('❌ Role mismatch, redirecting based on user role')
      const redirectUrl = user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
      console.log('🔄 Redirecting to:', redirectUrl)
      redirectedRef.current = true
      router.replace(redirectUrl)
      return
    }

    // All checks passed
    if (user && (!requiredRole || user.role === requiredRole)) {
      console.log('✅ ProtectedRoute - Access granted for:', user.email, '| Role:', user.role, '| Status:', user.status)
      // Clear timeout since we have successful auth
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [user, loading, requiredRole, requireApproval, router])

  // Show loading while checking auth (with timeout protection)
  if (loading && !redirectedRef.current) {
    console.log('⏳ ProtectedRoute showing loading state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading user profile...</p>
          <p className="text-slate-500 text-sm mt-2">This may take a moment on Vercel...</p>
          <div className="mt-4">
            <button
              onClick={() => {
                console.log('🔄 Manual redirect triggered')
                redirectedRef.current = true
                router.replace('/')
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!user || 
      (requireApproval && user.status !== 'approved' && user.role !== 'admin') ||
      (requiredRole && user.role !== requiredRole) || 
      redirectedRef.current) {
    console.log('🔄 ProtectedRoute showing redirect state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  // User has access
  console.log('✅ ProtectedRoute rendering children for:', user.email)
  return <>{children}</>
}