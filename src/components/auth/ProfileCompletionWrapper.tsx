// src/components/auth/ProfileCompletionWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ProfileCompletionForm } from './ProfileCompletionForm'

interface ProfileCompletionWrapperProps {
  children: React.ReactNode
}

export function ProfileCompletionWrapper({ children }: ProfileCompletionWrapperProps) {
  const { user, loading } = useAuth()
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const [checkComplete, setCheckComplete] = useState(false)

  useEffect(() => {
    // Only check when:
    // 1. Not loading
    // 2. User exists (authenticated)
    // 3. Haven't checked yet
    // 4. User is actually logged in (not just on landing page)
    if (!loading && user && !checkComplete) {
      console.log('🔍 Checking if authenticated user needs profile completion:', {
        userId: user.id,
        email: user.email,
        hasPlayerName: !!(user as any).player_name,
        playerNameValue: (user as any).player_name
      })

      // Show form if user doesn't have player_name or it's null/empty
      const playerName = (user as any).player_name
      const needsCompletion = !playerName || playerName.trim() === ''
      
      if (needsCompletion) {
        console.log('📝 Authenticated user needs to complete profile - showing completion form')
        setShowCompletionForm(true)
      } else {
        console.log('✅ User profile is complete, player_name exists:', playerName)
      }
      
      setCheckComplete(true)
    } else if (!loading && !user) {
      // User is not authenticated (on landing page, etc.) - just continue normally
      console.log('ℹ️ No authenticated user - skipping profile completion check')
      setCheckComplete(true)
    }
  }, [user, loading, checkComplete])

  const handleCompletionComplete = () => {
    console.log('✅ Profile completion finished')
    setShowCompletionForm(false)
    
    // Force a page reload to get updated user data
    window.location.reload()
  }

  // Show loading only if auth is loading, not for profile completion check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show completion form only for authenticated users who need it
  if (showCompletionForm && user) {
    return (
      <ProfileCompletionForm 
        user={user} 
        onComplete={handleCompletionComplete}
      />
    )
  }

  // Show normal content for:
  // - Non-authenticated users (landing page)
  // - Authenticated users with complete profiles
  return <>{children}</>
}