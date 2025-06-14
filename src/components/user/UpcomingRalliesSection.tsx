// src/components/user/UpcomingRalliesSection.tsx - FIXED VERSION with Row Display
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransformedRally, useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { useDeleteRegistration } from '@/hooks/useRallyRegistrations'
import { RallyDetailModal } from '@/components/rally/RallyDetailModal'

interface UpcomingRalliesSectionProps {
  rallies: TransformedRally[]
  isLoading: boolean
  canAccessRallies: boolean
}

export function UpcomingRalliesSection({ rallies, isLoading, canAccessRallies }: UpcomingRalliesSectionProps) {
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  
  // Get user's registrations to check for existing registrations
  const { data: userRegistrations = [] } = useUserRallyRegistrations()
  const deleteRegistrationMutation = useDeleteRegistration()

  if (!canAccessRallies) return null

  // Sort rallies by rally date (competition_date)
  const sortedRallies = [...rallies].sort((a, b) => {
    return new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime()
  })

  // Show limited or expanded list based on state
  const displayRallies = isExpanded ? 
    sortedRallies.slice(0, 10) : sortedRallies.slice(0, 5)
  const hasMoreRallies = sortedRallies.length > 5

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
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

  const isRegistrationOpen = (rally: TransformedRally) => {
    const now = new Date()
    const deadline = new Date(rally.registration_deadline)
    return rally.status === 'registration_open' || 
           (rally.status === 'upcoming' && deadline > now)
  }

  // Check if user is already registered for a specific rally
  const getUserRegistration = (rallyId: string) => {
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>🏁</span>
            <span>Tulevased rallid</span>
          </h2>
          
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-1">
            <span className="text-blue-300 text-sm font-medium">{sortedRallies.length} rallit</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Laadime rallisid...</p>
            </div>
          </div>
        ) : sortedRallies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-slate-500">🏁</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Rallisid pole</h3>
            <p className="text-slate-400">Hetkel pole ühtegi tulevast rallit planeeritud</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 px-4 py-2 bg-slate-700/30 rounded-lg text-sm font-medium text-slate-400">
              <div>Ralli</div>
              <div>Staatus</div>
              <div>Võistluse aeg</div>
              <div>Registr. kuni</div>
              <div>Osavõtjaid</div>
              <div>Tegevused</div>
            </div>

            {/* Rally Rows */}
            <div className="space-y-3">
              {displayRallies.map((rally) => {
                const registration = getUserRegistration(rally.id)
                const isRegistered = !!registration
                
                return (
                  <div
                    key={rally.id}
                    className="bg-slate-700/30 rounded-xl border border-slate-600/50 p-4 hover:bg-slate-700/40 transition-all duration-200"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-blue-400 text-lg">🏁</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{rally.name}</h3>
                            <p className="text-sm text-slate-400">{rally.game_name} • {rally.game_type_name}</p>
                          </div>
                        </div>
                        {rally.is_featured && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                            ⭐
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Staatus:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                            {getStatusText(rally.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Võistlus:</span>
                          <span className="text-slate-300">
                            {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Registr. kuni:</span>
                          <span className="text-slate-300">
                            {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {rally.max_participants && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Max osavõtjaid:</span>
                            <span className="text-slate-300">{rally.max_participants}</span>
                          </div>
                        )}
                      </div>

                      {isRegistered && (
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <span>✓</span>
                          <span>Registreeritud: {registration?.class_name}</span>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setSelectedRally(rally)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                        >
                          Vaata detaile
                        </button>
                        {isRegistrationOpen(rally) && !isRegistered && (
                          <button
                            onClick={() => handleRegister(rally)}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                          >
                            Registreeru
                          </button>
                        )}
                        {isRegistered && (
                          <button
                            onClick={() => handleUnregister(rally)}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                          >
                            Tühista
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Desktop Layout - Table Row */}
                    <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                      {/* Rally Name */}
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 text-sm">🏁</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{rally.name}</h3>
                          <p className="text-xs text-slate-400">{rally.game_name}</p>
                          {isRegistered && (
                            <p className="text-xs text-green-400">✓ Registreeritud</p>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                          {getStatusText(rally.status)}
                        </span>
                      </div>

                      {/* Competition Date */}
                      <div className="text-sm text-slate-300">
                        {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {/* Registration Deadline */}
                      <div className="text-sm text-slate-300">
                        {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {/* Participants */}
                      <div className="text-sm text-slate-300">
                        {rally.registered_participants || 0}{rally.max_participants ? ` / ${rally.max_participants}` : ''}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRally(rally)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-all duration-200"
                        >
                          Detailid
                        </button>
                        {isRegistrationOpen(rally) && !isRegistered && (
                          <button
                            onClick={() => handleRegister(rally)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-all duration-200"
                          >
                            Registreeru
                          </button>
                        )}
                        {isRegistered && (
                          <button
                            onClick={() => handleUnregister(rally)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-all duration-200"
                          >
                            Tühista
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Show More/Less Button */}
            {hasMoreRallies && (
              <div className="text-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-all duration-200"
                >
                  {isExpanded ? 'Näita vähem' : `Näita kõiki (${sortedRallies.length})`}
                </button>
              </div>
            )}
          </div>
        )}
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