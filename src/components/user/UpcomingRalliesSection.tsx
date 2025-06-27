// src/components/user/UpcomingRalliesSection.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
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

  // Functions
  const handleRegister = (rally: TransformedRally) => {
    router.push(`/registration?rallyId=${rally.id}`)
  }

  const handleUnregister = async (registrationId: string) => {
    if (window.confirm('Kas olete kindel, et soovite tühistada oma registreeringu?')) {
      try {
        await deleteRegistrationMutation.mutateAsync(registrationId)
      } catch (error) {
        console.error('Error unregistering:', error)
        alert('Registreeringu tühistamine ebaõnnestus. Palun proovige uuesti.')
      }
    }
  }

  const handleViewDetails = (rally: TransformedRally) => {
    setSelectedRally(rally)
  }

  // Get registration info
  const getRegistrationInfo = (rallyId: string) => {
    return userRegistrations.find(reg => reg.rally_id === rallyId)
  }

  // Futuristic status color mapping
  const getFuturisticStatusColor = (status: string): string => {
    switch (status) {
      case 'bg-green-500/20 text-green-400 border-green-500/30':
        return 'bg-gradient-to-r from-green-900/20 to-green-800/10 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
      case 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30':
        return 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
      case 'bg-orange-500/20 text-orange-400 border-orange-500/30':
        return 'bg-gradient-to-r from-orange-900/20 to-orange-800/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
      case 'bg-red-500/20 text-red-400 border-red-500/30':
        return 'bg-gradient-to-r from-red-900/20 to-red-800/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      case 'bg-slate-500/20 text-slate-400 border-slate-500/30':
        return 'bg-gradient-to-r from-gray-900/20 to-gray-800/10 text-gray-400 border border-gray-500/30'
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-700'
    }
  }

  return (
    <>
    <div className="upcoming-rallies-container">
      <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/80 backdrop-blur-xl p-8 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Header with futuristic styling */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-2xl font-black text-white flex items-center space-x-3 font-['Orbitron'] tracking-wider">
            <span className="text-3xl text-red-400 animate-pulse">{showPastRallies ? '🏆' : '🏁'}</span>
            <span className="bg-gradient-to-r from-red-400 to-gray-300 bg-clip-text text-transparent">
              {showPastRallies ? 'Olnud rallid' : 'Tulevased rallid'}
            </span>
          </h2>
          
          <div className="flex items-center space-x-3">
            {/* Futuristic toggle buttons */}
            <div className="flex bg-gray-900/50 rounded-xl p-1 border border-gray-800">
              <button
                onClick={() => {
                  setShowPastRallies(false)
                  setIsExpanded(false)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
                  !showPastRallies 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                Tulevased ({sortedUpcoming.length})
              </button>
              <button
                onClick={() => {
                  setShowPastRallies(true)
                  setIsExpanded(false)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
                  showPastRallies 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                Olnud ({sortedPast.length})
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-gray-500/20 border-b-gray-500 rounded-full animate-spin" 
                  style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider">LAADIN RALLISID...</p>
            </div>
          </div>
        ) : displayRallies.length === 0 ? (
          /* Empty state with futuristic design */
          <div className="text-center py-16 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-900/50 to-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-[0_0_30px_rgba(255,0,64,0.3)]">
                <span className="text-4xl text-red-400">
                  {showPastRallies ? '🏆' : '🏁'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wide">
                {showPastRallies ? 'Olnud rallisid ei leitud' : 'Tulevasi rallisid ei leitud'}
              </h3>
              <p className="text-gray-500">
                {showPastRallies 
                  ? 'Vaadake hiljem uuesti' 
                  : 'Uued rallid lisatakse peagi'}
              </p>
            </div>
          </div>
        ) : (
          /* Rally list with futuristic cards */
          <div className="space-y-4">
            {limitedRallies.map((rally, index) => {
              const registration = getRegistrationInfo(rally.id)
              const isUserRegistered = !!registration
              const currentStatus = getRallyStatus(rally)
              const canRegister = canRegisterToRally(rally)
              
              return (
                <div
                  key={rally.id}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,64,0.2)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Animated sweep effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Rally header with badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors font-['Orbitron'] uppercase tracking-wide">
                            {rally.name}
                          </h3>
                          
                          {/* Status badge with glow */}
                          <span className={`text-xs px-3 py-1 rounded-full font-['Orbitron'] uppercase tracking-wider ${getFuturisticStatusColor(getStatusColor(currentStatus))}`}>
                            {getStatusDisplayText(currentStatus)}
                          </span>
                          
                          {/* Featured badge */}
                          {rally.is_featured && (
                            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)] font-['Orbitron'] uppercase">
                              ⭐ Esiletõstetud
                            </span>
                          )}
                          
                          {/* Registration status */}
                          {isUserRegistered && (
                            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-green-900/20 to-green-800/10 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)] font-['Orbitron'] uppercase">
                              ✓ Registreeritud
                            </span>
                          )}
                        </div>
                        
                        {/* Rally description */}
                        {rally.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                            {rally.description}
                          </p>
                        )}
                        
                        {/* Rally details with icons */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-red-400">📅</span>
                            {new Date(rally.competition_date).toLocaleDateString('et-EE')}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-red-400">🎮</span>
                            {rally.game_name}
                          </span>
                          
                          {rally.total_events !== undefined && rally.total_events > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="text-red-400">🏆</span>
                              {rally.total_events} {rally.total_events === 1 ? 'sündmus' : 'sündmust'}
                            </span>
                          )}
                          
                          {rally.total_tracks !== undefined && rally.total_tracks > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="text-red-400">🛣️</span>
                              {rally.total_tracks} {rally.total_tracks === 1 ? 'rada' : 'rada'}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <span className="text-red-400">👥</span>
                            {rally.registered_participants || 0}/{rally.max_participants || '∞'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {!showPastRallies && (
                          <>
                            {isUserRegistered ? (
                              <button
                                onClick={() => registration && handleUnregister(registration.id)}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider hover:from-red-700 hover:to-red-800 transition-all shadow-[0_0_15px_rgba(255,0,64,0.5)] hover:shadow-[0_0_20px_rgba(255,0,64,0.7)]"
                              >
                                Tühista
                              </button>
                            ) : canRegister ? (
                              <button
                                onClick={() => handleRegister(rally)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider hover:from-green-700 hover:to-green-800 transition-all shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                              >
                                Registreeri
                              </button>
                            ) : null}
                          </>
                        )}
                        
                        <button
                          onClick={() => handleViewDetails(rally)}
                          className="px-4 py-2 bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider hover:bg-gray-800/50 hover:border-red-500/50 hover:text-red-400 transition-all"
                        >
                          Vaata
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Expand/Collapse button */}
            {displayRallies.length > 5 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 text-gray-300 rounded-xl font-['Orbitron'] uppercase tracking-wider hover:border-red-500/50 hover:text-red-400 transition-all group"
                >
                  {isExpanded ? (
                    <span className="flex items-center gap-2">
                      Näita vähem <span className="group-hover:animate-bounce">↑</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Näita kõiki ({displayRallies.length}) <span className="group-hover:animate-bounce">↓</span>
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Rally Detail Modal */}
      {selectedRally && (
        <RallyDetailModal
          rally={selectedRally}
          onClose={() => setSelectedRally(null)}
          onRegister={() => handleRegister(selectedRally)}
        />
      )}
    </>
  )
}