// src/components/UserDashboard.tsx - FIXED VERSION with useAllRallies
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useView } from '@/components/ViewProvider'
import { useAllRallies, useFeaturedRallies, useUserRallyRegistrations, useAutoUpdateRallyStatuses   } from '@/hooks/useOptimizedRallies'
import { UserWelcomeHeader } from '@/components/user/UserWelcomeHeader'
import { UserStatusBanner } from '@/components/user/UserStatusBanner'
import { UpcomingRalliesSection } from '@/components/user/UpcomingRalliesSection'
import { FeaturedRalliesSection } from '@/components/user/FeaturedRalliesSection'
import { UserRegistrationsSection } from '@/components/user/UserRegistrationsSection'
import { UserActionPrompt } from '@/components/user/UserActionPrompt'
import { useEffect } from 'react'

interface StatusMessage {
  type: 'success' | 'warning' | 'info'
  message: string
  icon: string
  color: 'green' | 'yellow' | 'blue'
}

function getStatusMessage(user: any, isAdminAsUser: boolean): StatusMessage | null {
  if (isAdminAsUser) {
    return {
      type: 'info',
      message: 'Kasutajavaates admin režiimis',
      icon: '👁️',
      color: 'blue'
    }
  }

  if (!user.email_verified) {
    return {
      type: 'warning',
      message: 'Palun kinnitage oma e-posti aadress',
      icon: '📧',
      color: 'yellow'
    }
  }

  if (!user.admin_approved) {
    return {
      type: 'warning',
      message: 'Ootame admin kinnitust',
      icon: '⏳',
      color: 'yellow'
    }
  }

  return null
}

export function UserDashboard() {
  const { user } = useAuth()
  const { currentView } = useView()

  const autoUpdateMutation = useAutoUpdateRallyStatuses()
  
  // Load rally data using updated hooks - Use higher limit to get more rallies
  const { data: allRallies = [], isLoading: isLoadingAll } = useAllRallies(20)
  const { data: featuredRallies = [], isLoading: isLoadingFeatured } = useFeaturedRallies(3)
  const { data: userRegistrations = [], isLoading: isLoadingRegistrations } = useUserRallyRegistrations()

  useEffect(() => {
    console.log('🔄 UserDashboard loaded - triggering rally status update...')
    autoUpdateMutation.mutate()
  }, []) // Run once when component mounts

  if (!user) return null

  // Computed Values
  const isAdminAsUser = user.role === 'admin' && currentView === 'user'
  const status = getStatusMessage(user, isAdminAsUser)
  const canAccessRallies = isAdminAsUser || (user.email_verified && user.admin_approved)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Welcome Header */}
        <UserWelcomeHeader 
          userName={user.name}
          isAdminAsUser={isAdminAsUser}
        />

        {/* Status Banner - only show if there's an issue to address */}
        {status && (
          <UserStatusBanner status={status} />
        )}

        {/* User's Rally Registrations */}
        {canAccessRallies && userRegistrations.length > 0 && (
          <UserRegistrationsSection
            registrations={userRegistrations}
          />
        )}

        {/* Featured Rallies */}
        {canAccessRallies && featuredRallies.length > 0 && (
          <FeaturedRalliesSection
            rallies={featuredRallies}
            isLoading={isLoadingFeatured}
            canAccessRallies={canAccessRallies}
          />
        )}

        {/* All Rallies Section - CHANGE: Pass allRallies instead of upcomingRallies */}
         <UpcomingRalliesSection
           rallies={allRallies}
           isLoading={isLoadingAll}
          canAccessRallies={canAccessRallies}
        />

        {/* Action Prompt - Encourage participation */}
        <UserActionPrompt 
          canAccessRallies={canAccessRallies}
          emailVerified={user.email_verified}
        />

      </div>
    </div>
  )
}