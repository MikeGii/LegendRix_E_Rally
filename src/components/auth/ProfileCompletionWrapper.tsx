// src/components/auth/ProfileCompletionWrapper.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ProfileCompletionForm } from './ProfileCompletionForm'

interface ProfileCompletionWrapperProps {
  children: React.ReactNode
}

export function ProfileCompletionWrapper({ children }: ProfileCompletionWrapperProps) {
  const { user, loading } = useAuth()
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const [checkComplete, setCheckComplete] = useState(false)
  const previousUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Only check when:
    // 1. Not loading
    // 2. User exists (authenticated)
    // 3. Haven't checked yet for this user
    // 4. User ID has changed (new login)
    if (!loading && user && !checkComplete) {
      // Skip if we already checked this user
      if (previousUserIdRef.current === user.id) {
        return
      }

      // Store the user ID to prevent rechecking
      previousUserIdRef.current = user.id

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
      // User logged out - reset state
      previousUserIdRef.current = null
      setCheckComplete(false)
      setShowCompletionForm(false)
    }
  }, [user, loading, checkComplete])

  const handleCompletionComplete = () => {
    console.log('✅ Profile completion finished')
    setShowCompletionForm(false)
    
    // Don't reload - just let the component continue
    // The user data will be updated through the auth state
  }

  // Don't show loading screen - just pass through to children
  // This prevents the flash during login
  if (loading && !showCompletionForm) {
    return <>{children}</>
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