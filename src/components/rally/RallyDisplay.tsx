// src/components/rally/RallyDisplay.tsx
'use client'

import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { 
  canRegisterToRally, 
  getRallyStatus, 
  getStatusDisplayText, 
  getStatusColor
} from '@/hooks/useOptimizedRallies'

interface RallyDisplayProps {
  rallies: TransformedRally[]
  showLimit?: number
  showRegistration?: boolean
  onRegister?: (rally: TransformedRally) => void
}

export function RallyDisplay({ rallies, showLimit, showRegistration = false, onRegister }: RallyDisplayProps) {
  const displayRallies = showLimit ? rallies.slice(0, showLimit) : rallies

  if (rallies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">🏁</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Eelseisvaid rallisid ei ole</h3>
        <p className="text-slate-400">
          Kontrolli varsti uute ralli teadaannete saamiseks!
        </p>
      </div>
    )
  }

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
      default: return status
    }
  }

  const isRegistrationOpen = (rally: TransformedRally) => {
    return canRegisterToRally({
      competition_date: rally.competition_date,
      registration_deadline: rally.registration_deadline
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayRallies.map((rally) => {
        // FIXED: Calculate real-time status
        const currentStatus = getRallyStatus({
          competition_date: rally.competition_date,
          registration_deadline: rally.registration_deadline
        })
        const registrationAllowed = isRegistrationOpen(rally)

        return (
          <div
            key={rally.id}
            className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/40 transition-all duration-200"
          >
            {/* Rally Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-xl">🏁</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg leading-tight">
                    {rally.name}
                  </h3>
                  <p className="text-sm text-slate-400">{rally.game_name}</p>
                </div>
              </div>
              
              {/* Featured Badge */}
              {rally.is_featured && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                  ⭐ ESILETÕSTETUD
                </span>
              )}
            </div>

            {/* Rally Status */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                {getStatusText(rally.status)}
              </span>
            </div>

            {/* Rally Info - Complete with all original fields */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">🎮</span>
                <span className="text-slate-300">{rally.game_type_name}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">📅</span>
                <span className="text-slate-300">
                  {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">⏰</span>
                <span className="text-slate-300">
                  Registreerimine kuni {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {rally.max_participants && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">👥</span>
                  <span className="text-slate-300">
                    Max {rally.max_participants} osalejat
                  </span>
                </div>
              )}

              {/* Events and Tracks Info - Support both data structures */}
              {rally.events && rally.events.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">📍</span>
                  <span className="text-slate-300">
                    {rally.events.length} {rally.events.length === 1 ? 'riik' : 'riiki'}
                  </span>
                </div>
              )}

              {/* Show total tracks if available */}
              {rally.total_tracks && rally.total_tracks > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">🛣️</span>
                  <span className="text-slate-300">
                    {rally.total_tracks} {rally.total_tracks === 1 ? 'rada' : 'rada'}
                  </span>
                </div>
              )}

              {/* Show registered participants if available */}
              {typeof rally.registered_participants === 'number' && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">🏃</span>
                  <span className="text-slate-300">
                    {rally.registered_participants} registreerunud
                  </span>
                </div>
              )}
            </div>

            {/* Rally Description */}
            {rally.description && (
              <div className="mb-6">
                <p className="text-sm text-slate-400 line-clamp-2">
                  {rally.description}
                </p>
              </div>
            )}

            {/* Registration Actions */}
            {showRegistration && (
              <div className="space-y-3">
                {registrationAllowed ? (
                  <button
                    onClick={() => onRegister && onRegister(rally)}
                    className="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all duration-200 font-medium"
                  >
                    Registreeru
                  </button>
                ) : (
                  /* FIXED: Show "Registreerimine suletud" when deadline passed */
                  <div className="w-full px-4 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-center font-medium">
                    Registreerimine suletud
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}