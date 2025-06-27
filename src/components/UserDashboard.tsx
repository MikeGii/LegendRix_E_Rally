// src/components/UserDashboard.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useView } from '@/components/ViewProvider'
import { useAllRallies, useFeaturedRallies, useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { UserWelcomeHeader } from '@/components/user/UserWelcomeHeader'
import { UserQuickMenu } from '@/components/user/UserQuickMenu'
import { UserStatusBanner } from '@/components/user/UserStatusBanner'
import { UpcomingRalliesSection } from '@/components/user/UpcomingRalliesSection'
import { FeaturedRalliesSection } from '@/components/user/FeaturedRalliesSection'
import { UserRegistrationsSection } from '@/components/user/UserRegistrationsSection'
import { UserActionPrompt } from '@/components/user/UserActionPrompt'
import { SectionDivider } from '@/components/landing/SectionDivider'

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
  
  // Load rally data
  const { data: allRallies = [], isLoading: isLoadingAll } = useAllRallies(20)
  const { data: featuredRallies = [], isLoading: isLoadingFeatured } = useFeaturedRallies(3)
  const { data: userRegistrations = [], isLoading: isLoadingRegistrations } = useUserRallyRegistrations()

  if (!user) return null

  // Computed Values
  const isAdminAsUser = user.role === 'admin' && currentView === 'user'
  const status = getStatusMessage(user, isAdminAsUser)
  const canAccessRallies = isAdminAsUser || (user.email_verified && user.admin_approved)

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '4s' }}></div>
        
        {/* Scan Line Effect */}
        <div className="scan-line"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome Header with Futuristic Style */}
        <div className="relative">
          <UserWelcomeHeader 
            userName={user.name}
            isAdminAsUser={isAdminAsUser}
          />
          {/* Tech Border Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        </div>

        {/* Quick Menu with Animations */}
        <div className="relative">
          <UserQuickMenu />
          <div className="mt-8">
            <SectionDivider variant="mixed" />
          </div>
        </div>

        {/* Status Banner - Redesigned */}
        {status && (
          <div className="relative">
            <UserStatusBanner status={status} />
          </div>
        )}

        {/* User's Rally Registrations with Glow Effect */}
        {canAccessRallies && userRegistrations.length > 0 && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-gray-600/20 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative">
              <UserRegistrationsSection
                registrations={userRegistrations}
              />
            </div>
            <div className="mt-8">
              <SectionDivider variant="z-pattern" />
            </div>
          </div>
        )}

        {/* Featured Rallies with Special Effects */}
        {canAccessRallies && featuredRallies.length > 0 && (
          <div className="relative">
            {/* Animated Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 to-red-600/20 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <div className="relative">
              <FeaturedRalliesSection
                rallies={featuredRallies}
                isLoading={isLoadingFeatured}
                canAccessRallies={canAccessRallies}
              />
            </div>
            <div className="mt-8">
              <SectionDivider variant="l-corners" />
            </div>
          </div>
        )}

        {/* All Rallies Section with Grid Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent rounded-2xl"></div>
          <UpcomingRalliesSection
            rallies={allRallies}
            isLoading={isLoadingAll}
            canAccessRallies={canAccessRallies}
          />
        </div>

        {/* Action Prompt with Pulsing Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-gray-600/10 rounded-2xl blur-xl animate-pulse"></div>
          <div className="relative">
            <UserActionPrompt 
              canAccessRallies={canAccessRallies}
              emailVerified={user.email_verified}
            />
          </div>
        </div>

        {/* Bottom Spacing with Gradient Fade */}
        <div className="h-20 bg-gradient-to-b from-transparent to-black/50"></div>
      </div>

      {/* Futuristic Corner Accents */}
      <div className="fixed top-10 left-10 w-20 h-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-red-500 to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-red-500 to-transparent"></div>
      </div>
      <div className="fixed top-10 right-10 w-20 h-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-red-500 to-transparent"></div>
        <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-red-500 to-transparent"></div>
      </div>
      <div className="fixed bottom-10 left-10 w-20 h-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-red-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-red-500 to-transparent"></div>
      </div>
      <div className="fixed bottom-10 right-10 w-20 h-20 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-red-500 to-transparent"></div>
        <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-red-500 to-transparent"></div>
      </div>
    </div>
  )
}