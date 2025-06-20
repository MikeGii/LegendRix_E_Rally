// src/components/user/UpcomingRalliesSection.tsx - COMPLETE VERSION - All Features Preserved
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransformedRally, useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { useDeleteRegistration } from '@/hooks/useRallyRegistrations'
import { RallyDetailModal } from '@/components/rally/RallyDetailModal'

// Import helper functions for proper status checking
import { 
  canRegisterToRally, 
  getRallyStatus, 
  getStatusDisplayText, 
  getStatusColor,
  isRallyInPast 
} from '@/hooks/useOptimizedRallies'

interface UpcomingRalliesSectionProps {
  rallies: TransformedRally[]
  isLoading: boolean
  canAccessRallies: boolean
}

export function UpcomingRalliesSection({ rallies, isLoading, canAccessRallies }: UpcomingRalliesSectionProps) {
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPastRallies, setShowPastRallies] = useState(false)
  const router = useRouter()
  
  const { data: userRegistrations = [] } = useUserRallyRegistrations()
  const deleteRegistrationMutation = useDeleteRegistration()

  if (!canAccessRallies) return null

  // Helper function to check if rally is in the past (1-hour rule)
  const isRallyPast = (competitionDate: string) => {
    return isRallyInPast({ competition_date: competitionDate })
  }

  // Split rallies by date (ignore status, use only time)
  const upcomingRallies = rallies.filter(rally => !isRallyPast(rally.competition_date))
  const pastRallies = rallies.filter(rally => isRallyPast(rally.competition_date))

  // Sort: upcoming by date ASC, past by date DESC
  const sortedUpcoming = [...upcomingRallies].sort((a, b) => 
    new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime()
  )
  const sortedPast = [...pastRallies].sort((a, b) => 
    new Date(b.competition_date).getTime() - new Date(a.competition_date).getTime()
  )

  // Choose which to display
  const displayRallies = showPastRallies ? sortedPast : sortedUpcoming
  const limitedRallies = isExpanded ? displayRallies : displayRallies.slice(0, 5)
  const hasMore = displayRallies.length > 5

  // Helper functions for status display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'active': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Tulemas'
      case 'registration_open': return 'Registreerimine avatud'
      case 'registration_closed': return 'Registreerimine suletud'
      case 'active': return 'Käimasolev'
      case 'completed': return 'Lõppenud'
      case 'cancelled': return 'Tühistatud'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Use proper status checking instead of manual logic
  const canRegister = (rally: TransformedRally) => {
    if (showPastRallies) return false // No registration for past rallies
    return canRegisterToRally(rally)
  }

  // Safety check for userRegistrations
  const getUserRegistration = (rallyId: string) => {
    if (!userRegistrations || !Array.isArray(userRegistrations)) {
      return undefined
    }
    return userRegistrations.find(
      reg => reg.rally_id === rallyId && 
             (reg.status === 'registered' || reg.status === 'confirmed')
    )
  }

  const handleRegister = (rally: TransformedRally) => {
    console.log('🔄 Navigating to registration for rally:', rally.name)
    router.push(`/registration?rallyId=${rally.id}`)
  }

  const handleUnregister = async (rally: TransformedRally) => {
    const registration = getUserRegistration(rally.id)
    if (!registration) return

    if (confirm(`Kas olete kindel, et soovite "${rally.name}" registreeringu tühistada?`)) {
      try {
        await deleteRegistrationMutation.mutateAsync(registration.id)
        alert('Registreering edukalt tühistatud!')
      } catch (error) {
        console.error('Error unregistering:', error)
        alert('Registreeringu tühistamine ebaõnnestus. Palun proovige uuesti.')
      }
    }
  }

  const handleViewDetails = (rally: TransformedRally) => {
    setSelectedRally(rally)
  }

  return (
    <>
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        {/* Header with toggle and counts */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>{showPastRallies ? '🏆' : '🏁'}</span>
            <span>{showPastRallies ? 'Olnud rallid' : 'Tulevased rallid'}</span>
          </h2>
          
          <div className="flex items-center space-x-3">
            {/* Toggle buttons with counts */}
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => {
                  setShowPastRallies(false)
                  setIsExpanded(false) // Reset expansion when switching
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !showPastRallies 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tulevased ({sortedUpcoming.length})
              </button>
              <button
                onClick={() => {
                  setShowPastRallies(true)
                  setIsExpanded(false) // Reset expansion when switching
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  showPastRallies 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Olnud ({sortedPast.length})
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Laadin rallisid...</p>
            </div>
          </div>
        ) : displayRallies.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-slate-500">
                {showPastRallies ? '🏆' : '🏁'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {showPastRallies ? 'Pole veel ühtegi möödunud rallit' : 'Pole veel ühtegi tulevast rallit'}
            </h3>
            <p className="text-slate-400">
              {showPastRallies 
                ? 'Siin kuvatakse rallid, mis on toimunud.' 
                : 'Pea silma peal uute rallide väljakuulutamisel!'
              }
            </p>
          </div>
        ) : (
          /* Rally list */
          <>
            <div className="space-y-4">
              {limitedRallies.map((rally) => {
                const userRegistration = getUserRegistration(rally.id)
                const isUserRegistered = !!userRegistration
                const registrationAllowed = canRegister(rally) && !isUserRegistered
                
                // Use real-time status calculation
                const currentStatus = getRallyStatus(rally)

                return (
                  <div
                    key={rally.id}
                    className="bg-slate-700/30 backdrop-blur-xl rounded-xl border border-slate-600/50 p-6 hover:bg-slate-700/40 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 text-xl">🏁</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-white">{rally.name}</h3>
                            
                            {/* Real-time status badge */}
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(currentStatus)}`}>
                              {getStatusText(currentStatus)}
                            </span>
                            
                            {/* Featured badge */}
                            {rally.is_featured && (
                              <span className="text-xs px-2 py-1 rounded-full border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                ⭐ ESILETÕSTETUD
                              </span>
                            )}
                            
                            {/* User registration status */}
                            {isUserRegistered && (
                              <span className="text-xs px-2 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                                Registreeritud
                              </span>
                            )}
                          </div>
                          
                          {/* Rally description */}
                          {rally.description && (
                            <p className="text-sm text-slate-400 mb-2 line-clamp-1">
                              {rally.description}
                            </p>
                          )}
                          
                          {/* Rally details */}
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>📅 {new Date(rally.competition_date).toLocaleDateString('et-EE')}</span>
                            <span>🎮 {rally.game_name}</span>
                            
                            {/* FIXED: Show events count if available */}
                            {rally.total_events !== undefined && rally.total_events > 0 && (
                              <span>🏆 {rally.total_events} {rally.total_events === 1 ? 'riik' : 'riiki'}</span>
                            )}
                            
                            {/* FIXED: Only show tracks count if it's greater than 0 */}
                            {rally.total_tracks !== undefined && rally.total_tracks > 0 && (
                              <span>🛣️ {rally.total_tracks} {rally.total_tracks === 1 ? 'rada' : 'rada'}</span>
                            )}
                            
                            {/* FIXED: Show registered participants count */}
                            {rally.registered_participants !== undefined && (
                              <span>👤 {rally.registered_participants} registreerunud</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-3">
                        {/* Registration buttons - only for upcoming rallies */}
                        {!showPastRallies && (
                          <>
                            {registrationAllowed && (
                              <button
                                onClick={() => handleRegister(rally)}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                              >
                                Registreeru
                              </button>
                            )}
                            
                            {isUserRegistered && (
                              <button
                                onClick={() => handleUnregister(rally)}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                              >
                                Tühista registreerimine
                              </button>
                            )}

                            {/* Show "Registreerimine suletud" when deadline passed */}
                            {!registrationAllowed && !isUserRegistered && (
                              <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium">
                                Registreerimine suletud
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Details button - always available */}
                        <button
                          onClick={() => handleViewDetails(rally)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Detailid
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Show more/less button */}
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white border border-slate-600/50 rounded-lg transition-all duration-200 font-medium"
                >
                  {isExpanded ? 'Näita vähem' : `Näita kõiki (${displayRallies.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rally Detail Modal */}
      {selectedRally && (
        <RallyDetailModal
          rally={selectedRally}
          onClose={() => setSelectedRally(null)}
        />
      )}
    </>
  )
}