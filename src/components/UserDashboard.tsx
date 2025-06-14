// src/components/UserDashboard.tsx - Estonian Translation with Modern Theme
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

  // FILTER REGISTRATIONS: Hide those older than 1 day past their competition date
  const filteredRegistrations = userRegistrations.filter(registration => {
    // We need the rally's competition date to filter properly
    // For now, we'll use a simple date check if available
    // This would be enhanced with actual rally data joining
    const today = new Date()
    const oneDayAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000))
    
    // If registration has a rally date, check if it's not more than 1 day old
    // This is a simplified version - ideally we'd join with rally data
    return true // For now, keeping all registrations until we have proper rally data
  })

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
        {canAccessRallies && filteredRegistrations.length > 0 && (
          <UserRegistrationsSection
            registrations={filteredRegistrations}
            isLoading={isLoadingRegistrations}
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