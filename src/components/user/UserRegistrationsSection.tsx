// src/components/user/UserRegistrationsSection.tsx - MOBILE-FRIENDLY VERSION
import { useState } from 'react'
import { UserRallyRegistration } from '@/hooks/useOptimizedRallies'

interface UserRegistrationsSectionProps {
  registrations: UserRallyRegistration[]
}

export function UserRegistrationsSection({ registrations }: UserRegistrationsSectionProps) {
  const [showPastRallies, setShowPastRallies] = useState(false)

  // Futuristic status color mapping
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'registered':
        return {
          bg: 'bg-gradient-to-r from-blue-900/30 to-blue-800/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
          icon: '📝'
        }
      case 'confirmed':
        return {
          bg: 'bg-gradient-to-r from-green-900/30 to-green-800/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          icon: '✅'
        }
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-red-900/30 to-red-800/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
          icon: '❌'
        }
      case 'disqualified':
        return {
          bg: 'bg-gradient-to-r from-orange-900/30 to-orange-800/20',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
          icon: '⚠️'
        }
      case 'completed':
        return {
          bg: 'bg-gradient-to-r from-purple-900/30 to-purple-800/20',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
          icon: '🏆'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-900/30 to-gray-800/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          glow: '',
          icon: '📋'
        }
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
  const isRallyInPast = (registration: UserRallyRegistration) => {
    // Primary check: use rally status from database
    if (registration.rally_status === 'completed' || registration.rally_status === 'cancelled') {
      return true
    }
    
    // Secondary check: if no competition date, keep in current
    if (!registration.rally_competition_date) return false
    
    // Fallback check: use 2-hour rule only if status is not 'active' or 'registration_open'
    const competitionDate = new Date(registration.rally_competition_date)
    const now = new Date()
    const twoHoursLater = new Date(competitionDate.getTime() + (2 * 60 * 60 * 1000))
    
    // Only move to past if time has passed AND rally is not in an active state
    return now > twoHoursLater && 
           registration.rally_status !== 'active' && 
           registration.rally_status !== 'registration_open'
  }

  // Filter current and past registrations
  const currentRegistrations = registrations.filter(reg => 
    !isRallyInPast(reg)
  )
  
  const pastRegistrations = registrations.filter(reg => 
    isRallyInPast(reg)
  )

  // Sort registrations by competition date
  const sortedCurrentRegistrations = [...currentRegistrations].sort((a, b) => {
    if (!a.rally_competition_date || !b.rally_competition_date) return 0
    return new Date(a.rally_competition_date).getTime() - new Date(b.rally_competition_date).getTime()
  })

  const sortedPastRegistrations = [...pastRegistrations].sort((a, b) => {
    if (!a.rally_competition_date || !b.rally_competition_date) return 0
    return new Date(b.rally_competition_date).getTime() - new Date(a.rally_competition_date).getTime()
  })

  const displayRegistrations = showPastRallies ? sortedPastRegistrations : sortedCurrentRegistrations

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Kuupäev määramata'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const formattedDate = date.toLocaleDateString('et-EE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    if (!showPastRallies && diffDays >= 0 && diffDays <= 7) {
      return `${formattedDate} (${diffDays} päeva pärast)`
    }
    
    return formattedDate
  }

  return (
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/80 backdrop-blur-xl p-4 sm:p-8 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Header with futuristic styling - Same as UpcomingRallies */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 font-['Orbitron'] tracking-wider">
          <span className="text-2xl sm:text-3xl text-red-400 animate-pulse">📋</span>
          <span className="bg-gradient-to-r from-red-400 to-gray-300 bg-clip-text text-transparent">
            MINU REGISTREERINGUD
          </span>
        </h2>
        
        {/* Toggle buttons */}
        <div className="flex justify-center sm:justify-end">
          <div className="bg-gray-900/70 rounded-xl p-1.5 backdrop-blur-xl border border-gray-800">
            <button
              onClick={() => setShowPastRallies(false)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
                !showPastRallies 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              Aktiivsed
              <span className="ml-1 sm:ml-2 opacity-70">({currentRegistrations.length})</span>
            </button>
            <button
              onClick={() => setShowPastRallies(true)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
                showPastRallies 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              Lõpetatud
              <span className="ml-1 sm:ml-2 opacity-70">({pastRegistrations.length})</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Scan line effect */}
      <div className="scan-line"></div>

      {/* Content */}

        {/* Animated background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 to-gray-900/5"></div>
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6">
        {displayRegistrations.length === 0 ? (
          /* Empty state - Compact version */
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-900/30 to-gray-900/30 rounded-full flex items-center justify-center border border-red-500/20">
              <span className="text-3xl sm:text-4xl text-red-400">
                {showPastRallies ? '🏁' : '📋'}
              </span>
              </div>
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wide">
                  {showPastRallies ? 'Lõpetatud registreeringuid pole' : 'Aktiivseid registreeringuid pole'}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  {showPastRallies 
                    ? 'Osale rallides, et näha oma tulemusi' 
                    : 'Registreeru rallile, et alustada'}
                </p>
              </div>
            </div>
          </div>
          ) : (
            /* Registration list - Simplified without expansion */
            <div className="space-y-3 sm:space-y-4">
              {displayRegistrations.map((registration) => {
                const statusStyles = getStatusStyles(registration.status)
                
                return (
                  <div
                    key={registration.id}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,64,0.2)]"
                  >
                    {/* Animated sweep effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    {/* Main content */}
                    <div className="relative p-4 sm:p-6">
                      <div className="flex flex-col gap-3">
                        {/* Rally name */}
                        <h3 className="text-base sm:text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wide">
                          {registration.rally_name || 'Ralli'}
                        </h3>
                        
                        {/* Rally info grid - Mobile optimized */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-400">
                          {/* Date and time */}
                          {registration.rally_competition_date && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-red-400">📅</span>
                              <span>
                                {new Date(registration.rally_competition_date).toLocaleDateString('et-EE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                                {' '}
                                <span className="text-gray-500">kell</span>
                                {' '}
                                {new Date(registration.rally_competition_date).toLocaleTimeString('et-EE', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                          
                          {/* Class */}
                          {registration.class_name && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-red-400">🏎️</span>
                              <span>Klass: {registration.class_name}</span>
                            </div>
                          )}
                          
                          {/* Registration status */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-red-400">{statusStyles.icon}</span>
                            <span className={statusStyles.text}>
                              {getStatusText(registration.status)}
                            </span>
                          </div>
                          
                          {/* Registration date */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-red-400">✏️</span>
                            <span>
                              Registreeritud: {new Date(registration.created_at).toLocaleDateString('et-EE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

    </div>
  )
}