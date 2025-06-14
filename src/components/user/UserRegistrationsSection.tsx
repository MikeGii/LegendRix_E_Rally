// src/components/user/UserRegistrationsSection.tsx - FIXED VERSION with Past Rallies
import { useState } from 'react'
import { UserRallyRegistration } from '@/hooks/useOptimizedRallies'

interface UserRegistrationsSectionProps {
  registrations: UserRallyRegistration[]
}

export function UserRegistrationsSection({ registrations }: UserRegistrationsSectionProps) {
  const [showPastRallies, setShowPastRallies] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'disqualified':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered':
        return 'Registreeritud'
      case 'confirmed':
        return 'Kinnitatud'
      case 'cancelled':
        return 'Tühistatud'
      case 'disqualified':
        return 'Diskvalifitseeritud'
      case 'completed':
        return 'Lõpetatud'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Helper function to check if rally is in the past (competition_date + 24 hours)
  const isRallyInPast = (rallyCompetitionDate: string | undefined) => {
    if (!rallyCompetitionDate) return false
    
    const competitionDate = new Date(rallyCompetitionDate)
    const now = new Date()
    const twentyFourHoursLater = new Date(competitionDate.getTime() + (24 * 60 * 60 * 1000))
    
    return now > twentyFourHoursLater
  }

  // Filter current and past registrations
  const currentRegistrations = registrations.filter(reg => 
    !isRallyInPast(reg.rally_competition_date)
  )
  
  const pastRegistrations = registrations.filter(reg => 
    isRallyInPast(reg.rally_competition_date)
  )

  // Sort registrations by competition date (newest first)
  const sortedCurrentRegistrations = [...currentRegistrations].sort((a, b) => {
    if (!a.rally_competition_date || !b.rally_competition_date) return 0
    return new Date(b.rally_competition_date).getTime() - new Date(a.rally_competition_date).getTime()
  })

  const sortedPastRegistrations = [...pastRegistrations].sort((a, b) => {
    if (!a.rally_competition_date || !b.rally_competition_date) return 0
    return new Date(b.rally_competition_date).getTime() - new Date(a.rally_competition_date).getTime()
  })

  const displayRegistrations = showPastRallies ? sortedPastRegistrations : sortedCurrentRegistrations

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-slate-500">🏁</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Registreeringuid pole</h3>
        <p className="text-slate-400">Sa pole veel ühelegi rallile registreerunud</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {showPastRallies ? 'Olnud rallid' : 'Minu registreeringud'}
          </h2>
          <span className="text-blue-300 text-sm font-medium">
            {displayRegistrations.length} {showPastRallies ? 'lõppenud' : 'aktiivset'}
          </span>
        </div>
        
        {/* Toggle Button */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPastRallies(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              !showPastRallies
                ? 'bg-blue-600 text-white'
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            Praegused ({currentRegistrations.length})
          </button>
          {pastRegistrations.length > 0 && (
            <button
              onClick={() => setShowPastRallies(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                showPastRallies
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Näita olnud rallisid ({pastRegistrations.length})
            </button>
          )}
        </div>
      </div>

      {/* Registrations List */}
      {displayRegistrations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-slate-500">
              {showPastRallies ? '📚' : '🏁'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {showPastRallies ? 'Olnud rallisid pole' : 'Praeguseid registreeringuid pole'}
          </h3>
          <p className="text-slate-400">
            {showPastRallies 
              ? 'Sa pole veel ühelegi lõppenud rallile registreerunud'
              : 'Sa pole hetkel ühelegi eelseisvale rallile registreerunud'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-slate-700/30 rounded-xl border border-slate-600/50 p-6 hover:bg-slate-700/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Rally Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-lg">🏁</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{registration.rally_name}</h3>
                      <p className="text-sm text-slate-400">{registration.class_name}</p>
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Registreeritud:</span>
                      <p className="text-slate-300 font-medium">
                        {new Date(registration.registration_date).toLocaleDateString('et-EE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {registration.rally_competition_date && (
                      <div>
                        <span className="text-slate-400">Võistluse kuupäev:</span>
                        <p className="text-slate-300 font-medium">
                          {new Date(registration.rally_competition_date).toLocaleDateString('et-EE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400">Staatus:</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                          {getStatusText(registration.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Past Rally Indicator */}
                  {showPastRallies && (
                    <div className="mt-3 pt-3 border-t border-slate-600/50">
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <span>📅</span>
                        <span>
                          Lõppenud {registration.rally_competition_date && 
                            Math.floor((new Date().getTime() - new Date(registration.rally_competition_date).getTime()) / (1000 * 60 * 60 * 24))
                          } päeva tagasi
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rally Status Indicator */}
                {registration.rally_status && (
                  <div className="ml-4">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium border
                      ${registration.rally_status === 'upcoming' 
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : registration.rally_status === 'registration_open'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : registration.rally_status === 'active'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : registration.rally_status === 'completed'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }
                    `}>
                      {registration.rally_status === 'upcoming' && 'Eelseisev'}
                      {registration.rally_status === 'registration_open' && 'Registreerimine avatud'}
                      {registration.rally_status === 'registration_closed' && 'Registreerimine suletud'}
                      {registration.rally_status === 'active' && 'Käimas'}
                      {registration.rally_status === 'completed' && 'Lõppenud'}
                      {registration.rally_status === 'cancelled' && 'Tühistatud'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-slate-700/20 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-400">{currentRegistrations.length}</p>
            <p className="text-sm text-slate-400">Eelseisvad</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{pastRegistrations.length}</p>
            <p className="text-sm text-slate-400">Lõppenud</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {registrations.filter(r => r.status === 'completed').length}
            </p>
            <p className="text-sm text-slate-400">Osales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{registrations.length}</p>
            <p className="text-sm text-slate-400">Kokku</p>
          </div>
        </div>
      </div>
    </div>
  )
}