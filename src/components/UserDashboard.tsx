'use client'

import { useAuth } from '@/components/AuthProvider'
import { useView } from '@/components/ViewProvider'
import { 
  useDetailedRallies, 
  useFeaturedRallies, 
  useUserRallyRegistrations,
  useRallyRegistration 
} from '@/hooks/useOptimizedRallies'
import { UserWelcomeHeader } from '@/components/user/UserWelcomeHeader'
import { UserStatusBanner } from '@/components/user/UserStatusBanner'
import { UserRegistrationsSection } from '@/components/user/UserRegistrationsSection'
import { RallyActionButtons } from '@/components/user/RallyActionButtons'
import { UserActionPrompt } from '@/components/user/UserActionPrompt'
import { AdminSwitchPanel } from '@/components/user/AdminSwitchPanel'
import { EnhancedRallyDisplay } from '@/components/rally/EnhancedRallyDisplay'

interface StatusMessage {
  type: 'success' | 'warning' | 'info'
  message: string
  icon: string
  color: 'green' | 'yellow' | 'blue'
}

export function UserDashboard() {
  const { user } = useAuth()
  const { currentView, canSwitchView } = useView()
  
  // Load rally data using enhanced hooks
  const { data: detailedRallies = [], isLoading: isLoadingDetailed } = useDetailedRallies(8)
  const { data: featuredRallies = [], isLoading: isLoadingFeatured } = useFeaturedRallies(3)
  const { data: userRegistrations = [], isLoading: isLoadingRegistrations } = useUserRallyRegistrations()
  
  // Rally registration mutation
  const rallyRegistrationMutation = useRallyRegistration()

  if (!user) return null

  // Computed Values
  const isAdminAsUser = user.role === 'admin' && currentView === 'user'
  const status = getStatusMessage(user, isAdminAsUser)
  const canAccessRallies = isAdminAsUser || (user.email_verified && user.admin_approved)

  // Split rallies into upcoming and registration open
  const upcomingRallies = detailedRallies.filter(rally => 
    rally.status === 'upcoming' || rally.daysUntilEvent > 7
  )
  const registrationOpenRallies = detailedRallies.filter(rally => 
    rally.status === 'registration_open' && rally.registrationStatus === 'open'
  )

  const handleRallyRegistration = async (rally: any, classId: string) => {
    try {
      await rallyRegistrationMutation.mutateAsync({
        rallyId: rally.id,
        classId: classId
      })
      
      // Show success message (you can implement a toast system)
      alert(`Successfully registered for ${rally.name}!`)
    } catch (error: any) {
      // Show error message
      alert(`Registration failed: ${error.message}`)
    }
  }

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

        {/* User's Rally Registrations */}
        {canAccessRallies && userRegistrations.length > 0 && (
          <UserRegistrationsSection
            registrations={userRegistrations}
            isLoading={isLoadingRegistrations}
          />
        )}

        {/* Registration Open Rallies */}
        {canAccessRallies && registrationOpenRallies.length > 0 && (
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <span>🎯</span>
                <span>Registration Open ({registrationOpenRallies.length})</span>
              </h2>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-1">
                <span className="text-green-300 text-sm font-medium">Register Now!</span>
              </div>
            </div>
            
            {isLoadingDetailed ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading registration opportunities...</p>
                </div>
              </div>
            ) : (
              <EnhancedRallyDisplay 
                rallies={registrationOpenRallies}
                showRegistration={true}
                onRegister={handleRallyRegistration}
              />
            )}
          </div>
        )}

        {/* Featured Rallies */}
        {canAccessRallies && featuredRallies.length > 0 && (
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <span>⭐</span>
                <span>Featured Championships</span>
              </h2>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-3 py-1">
                <span className="text-yellow-300 text-sm font-medium">Premium Events</span>
              </div>
            </div>
            
            {isLoadingFeatured ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-slate-600 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading featured rallies...</p>
                </div>
              </div>
            ) : (
              <EnhancedRallyDisplay 
                rallies={featuredRallies}
                showRegistration={true}
                onRegister={handleRallyRegistration}
              />
            )}
          </div>
        )}

        {/* Upcoming Rallies Section */}
        {canAccessRallies && (
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <span>🏁</span>
                <span>Upcoming Championships</span>
              </h2>
              
              {detailedRallies.length > 3 && (
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                  View All Rallies ({detailedRallies.length})
                </button>
              )}
            </div>
            
            {isLoadingDetailed ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading rally championships...</p>
                </div>
              </div>
            ) : detailedRallies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-slate-500">🏁</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Rallies Available</h3>
                <p className="text-slate-400">
                  New rally championships will be announced soon. Stay tuned!
                </p>
              </div>
            ) : (
              <EnhancedRallyDisplay 
                rallies={detailedRallies}
                showLimit={6}
                showRegistration={true}
                onRegister={handleRallyRegistration}
              />
            )}
          </div>
        )}

        {/* Rally Statistics */}
        {canAccessRallies && detailedRallies.length > 0 && (
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>📊</span>
              <span>Rally Overview</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-400 text-2xl">🏁</span>
                </div>
                <p className="text-2xl font-bold text-white">{detailedRallies.length}</p>
                <p className="text-slate-400 text-sm">Total Rallies</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-400 text-2xl">✅</span>
                </div>
                <p className="text-2xl font-bold text-white">{registrationOpenRallies.length}</p>
                <p className="text-slate-400 text-sm">Open for Registration</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-400 text-2xl">⭐</span>
                </div>
                <p className="text-2xl font-bold text-white">{featuredRallies.length}</p>
                <p className="text-slate-400 text-sm">Featured Events</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 text-2xl">🎮</span>
                </div>
                <p className="text-2xl font-bold text-white">{userRegistrations.length}</p>
                <p className="text-slate-400 text-sm">My Registrations</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Rally Information */}
        {canAccessRallies && detailedRallies.length > 0 && (
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>ℹ️</span>
              <span>Quick Information</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <span>⏰</span>
                  <span>Upcoming Deadlines</span>
                </h3>
                
                <div className="space-y-3">
                  {detailedRallies
                    .filter(rally => rally.daysUntilRegistrationDeadline <= 7 && rally.daysUntilRegistrationDeadline > 0)
                    .slice(0, 3)
                    .map(rally => (
                      <div key={rally.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{rally.name}</p>
                          <p className="text-slate-400 text-sm">Registration deadline</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            rally.daysUntilRegistrationDeadline <= 1 ? 'text-red-400' :
                            rally.daysUntilRegistrationDeadline <= 3 ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            {rally.daysUntilRegistrationDeadline === 0 ? 'Today' :
                             rally.daysUntilRegistrationDeadline === 1 ? 'Tomorrow' :
                             `${rally.daysUntilRegistrationDeadline} days`}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {detailedRallies.filter(rally => rally.daysUntilRegistrationDeadline <= 7 && rally.daysUntilRegistrationDeadline > 0).length === 0 && (
                    <p className="text-slate-400 text-center py-4">No urgent deadlines</p>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <span>🏆</span>
                  <span>Prize Pools</span>
                </h3>
                
                <div className="space-y-3">
                  {detailedRallies
                    .filter(rally => rally.prize_pool && rally.prize_pool > 0)
                    .sort((a, b) => (b.prize_pool || 0) - (a.prize_pool || 0))
                    .slice(0, 3)
                    .map(rally => (
                      <div key={rally.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{rally.name}</p>
                          <p className="text-slate-400 text-sm">{rally.game_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">€{rally.prize_pool}</p>
                          {rally.is_featured && (
                            <p className="text-yellow-400 text-xs">⭐ Featured</p>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  {detailedRallies.filter(rally => rally.prize_pool && rally.prize_pool > 0).length === 0 && (
                    <p className="text-slate-400 text-center py-4">No prize pools announced</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
      message: 'Administrator access - all rally features unlocked',
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
    message: 'Account verified - ready to compete in rallies!',
    icon: '✅',
    color: 'green'
  }
}