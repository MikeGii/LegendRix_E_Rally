// src/components/UserDashboard.tsx - FIXED VERSION
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useView } from '@/components/ViewProvider'
import { useUpcomingRallies, useFeaturedRallies, useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { UserWelcomeHeader } from '@/components/user/UserWelcomeHeader'
import { UserStatusBanner } from '@/components/user/UserStatusBanner'
import { UpcomingRalliesSection } from '@/components/user/UpcomingRalliesSection'
import { FeaturedRalliesSection } from '@/components/user/FeaturedRalliesSection'
import { UserRegistrationsSection } from '@/components/user/UserRegistrationsSection'
import { UserActionPrompt } from '@/components/user/UserActionPrompt'

interface StatusMessage {
  type: 'success' | 'warning' | 'info'
  message: string
  icon: string
  color: 'green' | 'yellow' | 'blue'
}

export function UserDashboard() {
  const { user } = useAuth()
  const { currentView } = useView()
  
  // Load rally data using updated hooks
  const { data: upcomingRallies = [], isLoading: isLoadingUpcoming } = useUpcomingRallies(5)
  const { data: featuredRallies = [], isLoading: isLoadingFeatured } = useFeaturedRallies(3)
  const { data: userRegistrations = [], isLoading: isLoadingRegistrations } = useUserRallyRegistrations()

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

        {/* User's Rally Registrations - FIXED: Removed isLoading prop */}
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

        {/* Upcoming Rallies Section */}
        <UpcomingRalliesSection
          rallies={upcomingRallies}
          isLoading={isLoadingUpcoming}
          canAccessRallies={canAccessRallies}
        />

        {/* Action needed for non-approved users */}
        <UserActionPrompt 
          canAccessRallies={canAccessRallies}
          emailVerified={user.email_verified}
        />
      </div>
    </div>
  )
}

// Helper Functions - Estonian Messages
function getStatusMessage(user: any, isAdminAsUser: boolean): StatusMessage | null {
  // Admins viewing as users show admin status
  if (isAdminAsUser) {
    return {
      type: 'success',
      message: 'Administraatori ligipääs - kõik funktsioonid avatud',
      icon: '👑',
      color: 'green'
    }
  }

  // Only show status messages for users who need to take action
  if (!user.email_verified) {
    return {
      type: 'warning',
      message: 'Palun kinnitage oma e-mail, et pääseda ligi ralli funktsioonidele',
      icon: '📧',
      color: 'yellow'
    }
  }
  
  if (!user.admin_approved) {
    return {
      type: 'info',
      message: 'Konto ootab kinnitust - teavitame teid, kui kõik on valmis',
      icon: '⏳',
      color: 'blue'
    }
  }
  
  // Return null for approved users - no status banner needed
  return null
}