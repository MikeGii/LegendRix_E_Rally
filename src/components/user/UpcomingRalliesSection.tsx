// src/components/user/UpcomingRalliesSection.tsx - Estonian Translation
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
  const displayRallies = isExpanded ? sortedRallies.slice(0, 10) : sortedRallies.slice(0, 3)
  const hasMoreRallies = sortedRallies.length > 3

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

  const handleShowMore = (rally: TransformedRally) => {
    setSelectedRally(rally)
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const formatEstonianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>🏁</span>
            <span>Tulevased rallid</span>
          </h2>
          
          {hasMoreRallies && (
            <button 
              onClick={handleToggleExpanded}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              {isExpanded ? 'Näita vähem' : 'Vaata rohkem rallisid'}
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Laadin tulevasi rallisid...</p>
            </div>
          </div>
        ) : sortedRallies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-slate-500">🏁</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tulevasi rallisid ei ole</h3>
            <p className="text-slate-400">Kontrollige varsti uute ralli teadaannete kohta!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayRallies.map((rally) => {
              const userRegistration = getUserRegistration(rally.id)
              const isRegistered = !!userRegistration
              const canRegister = isRegistrationOpen(rally) && !isRegistered

              return (
                <div
                  key={rally.id}
                  className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 hover:border-slate-600/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{rally.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                          {getStatusText(rally.status)}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-3">{rally.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Ralli kuupäev:</span>
                          <p className="text-white font-medium">{formatEstonianDate(rally.competition_date)}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Registreerimise tähtaeg:</span>
                          <p className="text-white font-medium">{formatEstonianDate(rally.registration_deadline)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {rally.max_participants && (
                        <span className="text-sm text-slate-400">
                          Maksimaalselt {rally.max_participants} osalejat
                        </span>
                      )}
                      
                      {isRegistered && (
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span className="text-green-400 text-sm font-medium">Registreeritud</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleShowMore(rally)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
                      >
                        Vaata detaile
                      </button>
                      
                      {canRegister && (
                        <button
                          onClick={() => handleRegister(rally)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                        >
                          Registreeru
                        </button>
                      )}
                      
                      {isRegistered && (
                        <button
                          onClick={() => handleUnregister(rally)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                        >
                          Tühista registreering
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Show count indicator when expanded */}
            {isExpanded && sortedRallies.length > 10 && (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">
                  Näitan {displayRallies.length} / {sortedRallies.length} rallist
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rally Detail Modal */}
      {selectedRally && (
        <RallyDetailModal
          rally={selectedRally}
          isOpen={!!selectedRally}
          onClose={() => setSelectedRally(null)}
          onRegister={() => handleRegister(selectedRally)}
          isRegistrationOpen={isRegistrationOpen(selectedRally)}
        />
      )}
    </>
  )
}