// src/components/user/UpcomingRalliesSection.tsx - CORRECTLY FIXED VERSION
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransformedRally, useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { useDeleteRegistration } from '@/hooks/useRallyRegistrations'
import { RallyDetailModal } from '@/components/rally/RallyDetailModal'

// FIXED: Import the helper functions for proper status checking
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

  // FIXED: Use the 1-hour rule instead of 24-hour rule
  const isRallyPast = (competitionDate: string) => {
    return isRallyInPast({ competition_date: competitionDate })
  }

  // Split rallies by date only (ignore status completely)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
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
      default: return status
    }
  }

  // FIXED: Use proper status checking instead of manual logic
  const canRegister = (rally: TransformedRally) => {
    if (showPastRallies) return false // No registration for past rallies
    return canRegisterToRally(rally)
  }

  // FIXED: Add safety check for userRegistrations being undefined
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
        alert('Registreeringu tühistamine ebaõnnestus. Palun proovige uuesti.')
      }
    }
  }

  return (
    <>
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>{showPastRallies ? '🏆' : '🏁'}</span>
            <span>{showPastRallies ? 'Olnud rallid' : 'Tulevased rallid'}</span>
          </h2>
          
          <div className="flex items-center space-x-3">
            {/* Toggle buttons */}
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setShowPastRallies(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !showPastRallies 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tulevased ({sortedUpcoming.length})
              </button>
              <button
                onClick={() => setShowPastRallies(true)}
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
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Laadin rallit...</p>
            </div>
          </div>
        ) : displayRallies.length === 0 ? (
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
          <>
            <div className="space-y-4">
              {limitedRallies.map((rally) => {
                const userRegistration = getUserRegistration(rally.id)
                const isUserRegistered = !!userRegistration
                // FIXED: Use proper registration checking and show proper status
                const registrationAllowed = canRegister(rally) && !isUserRegistered
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
                            {/* FIXED: Use real-time status instead of database status */}
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(currentStatus)}`}>
                              {getStatusText(currentStatus)}
                            </span>
                            {isUserRegistered && (
                              <span className="text-xs px-2 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                                Registreeritud
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>📅 {new Date(rally.competition_date).toLocaleDateString('et-EE')}</span>
                            <span>🎮 {rally.game_name}</span>
                            {rally.total_events && <span>🏆 {rally.total_events} events</span>}
                            {rally.total_tracks && <span>🛣️ {rally.total_tracks} tracks</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Only show registration buttons for upcoming rallies */}
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
                                {/* FIXED: Changed from "Tühista" to "Tühista registreerimine" */}
                                Tühista registreerimine
                              </button>
                            )}

                            {/* FIXED: Show "Registreerimine suletud" when deadline passed */}
                            {!registrationAllowed && !isUserRegistered && (
                              <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium">
                                Registreerimine suletud
                              </div>
                            )}
                          </>
                        )}
                        
                        <button
                          onClick={() => setSelectedRally(rally)}
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