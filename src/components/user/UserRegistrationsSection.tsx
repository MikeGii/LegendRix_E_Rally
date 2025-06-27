// src/components/user/UserRegistrationsSection.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
import { useState } from 'react'
import { UserRallyRegistration } from '@/hooks/useOptimizedRallies'

interface UserRegistrationsSectionProps {
  registrations: UserRallyRegistration[]
}

export function UserRegistrationsSection({ registrations }: UserRegistrationsSectionProps) {
  const [showPastRallies, setShowPastRallies] = useState(false)
  const [expandedRally, setExpandedRally] = useState<string | null>(null)

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
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/80 backdrop-blur-xl p-8 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Gradient orb */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] uppercase tracking-wider">
          <span className="text-transparent bg-gradient-to-r from-red-400 to-gray-300 bg-clip-text">
            Minu registreeringud
          </span>
        </h2>
        
        {/* Toggle buttons */}
        <div className="flex bg-gray-900/50 rounded-xl p-1 border border-gray-800">
          <button
            onClick={() => setShowPastRallies(false)}
            className={`px-4 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
              !showPastRallies 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                : 'text-gray-400 hover:text-red-400'
            }`}
          >
            Aktiivsed ({currentRegistrations.length})
          </button>
          <button
            onClick={() => setShowPastRallies(true)}
            className={`px-4 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
              showPastRallies 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                : 'text-gray-400 hover:text-red-400'
            }`}
          >
            Lõpetatud ({pastRegistrations.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {displayRegistrations.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-red-900/50 to-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-[0_0_30px_rgba(255,0,64,0.2)]">
              <span className="text-4xl">{showPastRallies ? '🏆' : '🏁'}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wide">
              {showPastRallies ? 'Lõpetatud rallisid ei leitud' : 'Aktiivseid registreeringuid ei ole'}
            </h3>
            <p className="text-gray-500">
              {showPastRallies 
                ? 'Siin kuvatakse lõppenud rallid' 
                : 'Registreeri end mõnele tulevale rallile'}
            </p>
          </div>
        ) : (
          /* Registration cards */
          <div className="space-y-4">
            {displayRegistrations.map((registration, index) => {
              const statusStyles = getStatusStyles(registration.status)
              const isExpanded = expandedRally === registration.id
              
              return (
                <div
                  key={registration.id}
                  className="group relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`
                    relative rounded-xl border transition-all duration-300
                    ${statusStyles.bg} ${statusStyles.border} ${statusStyles.glow}
                    hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,64,0.3)]
                  `}>
                    {/* Animated sweep effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                    
                    <div className="relative p-6">
                      {/* Main content */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Rally info */}
                          <div className="flex items-start space-x-4">
                            {/* Status icon */}
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center
                              ${statusStyles.bg} border ${statusStyles.border}
                              ${statusStyles.glow} backdrop-blur-sm
                            `}>
                              <span className="text-2xl">{statusStyles.icon}</span>
                            </div>
                            
                            {/* Rally details */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-1 font-['Orbitron'] uppercase tracking-wide group-hover:text-red-400 transition-colors">
                                {registration.rally_name}
                              </h3>
                              
                              {/* Date and class */}
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="text-gray-400 flex items-center space-x-1">
                                  <span>📅</span>
                                  <span>{formatDate(registration.rally_competition_date)}</span>
                                </span>
                                {registration.class_name && (
                                  <span className="text-gray-400 flex items-center space-x-1">
                                    <span>🏎️</span>
                                    <span>{registration.class_name}</span>
                                  </span>
                                )}
                              </div>
                              
                              {/* Status badge */}
                              <div className="mt-3 inline-flex items-center space-x-2">
                                <span className={`
                                  px-3 py-1 rounded-lg text-xs font-bold font-['Orbitron'] uppercase tracking-wider
                                  ${statusStyles.bg} border ${statusStyles.border} ${statusStyles.text}
                                  backdrop-blur-sm
                                `}>
                                  {getStatusText(registration.status)}
                                </span>
                                
                                {/* Registration time */}
                                <span className="text-xs text-gray-500">
                                  Registreeritud: {new Date(registration.created_at).toLocaleDateString('et-EE')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action button */}
                        <div className="flex items-center ml-4">
                          <button
                            onClick={() => setExpandedRally(isExpanded ? null : registration.id)}
                            className="p-2 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all duration-300 group/btn"
                          >
                            <svg 
                              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-800/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-['Orbitron'] mb-1">Võistluse aeg</p>
                              <p className="text-sm text-gray-300">
                                {registration.rally_competition_date 
                                  ? new Date(registration.rally_competition_date).toLocaleString('et-EE', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Määramata'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-['Orbitron'] mb-1">Registreerimise ID</p>
                              <p className="text-sm text-gray-300 font-mono">{registration.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
    </div>
  )
}