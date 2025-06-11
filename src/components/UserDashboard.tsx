'use client'

import { useAuth } from '@/components/AuthProvider'
import { useView } from '@/components/ViewProvider'
import { useUpcomingRallies } from '@/hooks/useOptimizedRallies'
import { UserWelcomeHeader } from '@/components/user/UserWelcomeHeader'
import { UserStatusBanner } from '@/components/user/UserStatusBanner'
import { UpcomingRalliesSection } from '@/components/user/UpcomingRalliesSection'
import { RallyActionButtons } from '@/components/user/RallyActionButtons'
import { UserActionPrompt } from '@/components/user/UserActionPrompt'
import { AdminSwitchPanel } from '@/components/user/AdminSwitchPanel'

interface StatusMessage {
  type: 'success' | 'warning' | 'info'
  message: string
  icon: string
  color: 'green' | 'yellow' | 'blue'
}

export function UserDashboard() {
  const { user } = useAuth()
  const { currentView, canSwitchView } = useView()
  
  // Load upcoming rallies using optimized hook
  const { data: upcomingRallies = [], isLoading: isLoadingRallies } = useUpcomingRallies(3)

  if (!user) return null

  // Computed Values
  const isAdminAsUser = user.role === 'admin' && currentView === 'user'
  const status = getStatusMessage(user, isAdminAsUser)
  const canAccessRallies = isAdminAsUser || (user.email_verified && user.admin_approved)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Welcome Header */}
        <UserWelcomeHeader 
          userName={user.name}
          isAdminAsUser={isAdminAsUser}
        />

        {/* Status Banner */}
        <UserStatusBanner status={status} />

        {/* Upcoming Rallies Section */}
        <UpcomingRalliesSection
          rallies={upcomingRallies}
          isLoading={isLoadingRallies}
          canAccessRallies={canAccessRallies}
        />

        {/* Main Action Buttons */}
        <RallyActionButtons canAccessRallies={canAccessRallies} />

        {/* Action needed for non-approved users */}
        <UserActionPrompt 
          canAccessRallies={canAccessRallies}
          emailVerified={user.email_verified}
        />

        {/* Quick Admin Switch (only for admins in user mode) */}
        <AdminSwitchPanel 
          canSwitchView={canSwitchView}
          currentView={currentView}
        />
      </div>
    </div>
  )
}

// Helper Functions
function getStatusMessage(user: any, isAdminAsUser: boolean): StatusMessage {
  // Admins viewing as users are always "approved"
  if (isAdminAsUser) {
    return {
      type: 'success',
      message: 'Administrator access - all features unlocked',
      icon: '👑',
      color: 'green'
    }
  }

  if (!user.email_verified) {
    return {
      type: 'warning',
      message: 'Please verify your email to access rally features',
      icon: '📧',
      color: 'yellow'
    }
  }
  
  if (!user.admin_approved) {
    return {
      type: 'info',
      message: 'Account pending approval - you will be notified when ready',
      icon: '⏳',
      color: 'blue'
    }
  }
  
  return {
    type: 'success',
    message: 'Account verified - ready to compete!',
    icon: '✅',
    color: 'green'
  }
}