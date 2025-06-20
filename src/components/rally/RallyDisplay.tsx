// src/components/rally/RallyDisplay.tsx - COMPLETE VERSION - All Features Preserved
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
  onEdit?: (rally: TransformedRally) => void
  onDelete?: (rally: TransformedRally) => void
  onSendNotification?: (rally: TransformedRally) => void
  viewMode?: 'user' | 'admin'
  variant?: 'grid' | 'list'
}

export function RallyDisplay({ 
  rallies, 
  showLimit, 
  showRegistration = false, 
  onRegister,
  onEdit,
  onDelete,
  onSendNotification,
  viewMode = 'user',
  variant = 'grid'
}: RallyDisplayProps) {
  
  const displayRallies = showLimit ? rallies.slice(0, showLimit) : rallies

  // Helper functions for status display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'registration_open':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'registration_closed':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'active':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'completed':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
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

  const isRegistrationOpen = (rally: TransformedRally) => {
    return canRegisterToRally({
      competition_date: rally.competition_date,
      registration_deadline: rally.registration_deadline
    })
  }

  // Empty state
  if (rallies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">🏁</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Rallisid ei ole</h3>
        <p className="text-slate-400">
          {viewMode === 'admin' 
            ? 'Loo uus ralli, et alustada.' 
            : 'Kontrolli varsti uute ralli teadaannete saamiseks!'
          }
        </p>
      </div>
    )
  }

  // Grid variant (original layout)
  if (variant === 'grid') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayRallies.map((rally) => {
          // Calculate real-time status
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentStatus)}`}>
                  {getStatusText(currentStatus)}
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

                {/* FIXED: Show registered participants count if available */}
                {rally.registered_participants !== undefined && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">👤</span>
                    <span className="text-slate-300">
                      {rally.registered_participants} registreerunud
                    </span>
                  </div>
                )}

                {/* FIXED: Show events count if available */}
                {rally.total_events !== undefined && rally.total_events > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">📍</span>
                    <span className="text-slate-300">
                      {rally.total_events} {rally.total_events === 1 ? 'riik' : 'riiki'}
                    </span>
                  </div>
                )}

                {/* FIXED: Only show tracks count if it's greater than 0 */}
                {rally.total_tracks !== undefined && rally.total_tracks > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">🛣️</span>
                    <span className="text-slate-300">
                      {rally.total_tracks} {rally.total_tracks === 1 ? 'rada' : 'rada'}
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

              {/* Action Buttons */}
              {(showRegistration || viewMode === 'admin') && (
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/50">
                  
                  {/* User Registration Button */}
                  {showRegistration && onRegister && (
                    <>
                      {registrationAllowed ? (
                        <button
                          onClick={() => onRegister(rally)}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Registreeru
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium">
                          Registreerimine suletud
                        </div>
                      )}
                    </>
                  )}

                  {/* Admin Buttons */}
                  {viewMode === 'admin' && (
                    <>
                      {onSendNotification && (
                        <button
                          onClick={() => onSendNotification(rally)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Saada teade
                        </button>
                      )}
                      
                      {onEdit && (
                        <button
                          onClick={() => onEdit(rally)}
                          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Muuda
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={() => onDelete(rally)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Kustuta
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // List variant (for compact display)
  return (
    <div className="space-y-4">
      {displayRallies.map((rally) => {
        const currentStatus = getRallyStatus({
          competition_date: rally.competition_date,
          registration_deadline: rally.registration_deadline
        })
        const registrationAllowed = isRegistrationOpen(rally)

        return (
          <div
            key={rally.id}
            className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{rally.name}</h3>
                  
                  {rally.is_featured && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-2 py-1">
                      <span className="text-yellow-300 text-xs font-medium">ESILETÕSTETUD</span>
                    </div>
                  )}
                </div>
                
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  {rally.description || 'Kirjeldus pole saadaval'}
                </p>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-lg border text-xs font-medium ${getStatusColor(currentStatus)}`}>
                {getStatusText(currentStatus)}
              </div>
            </div>

            {/* Rally Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
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
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">🎮</span>
                  <span className="text-slate-300">{rally.game_name}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">🏆</span>
                  <span className="text-slate-300">{rally.game_type_name}</span>
                </div>

                {/* FIXED: Show registered participants count */}
                {rally.registered_participants !== undefined && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">👤</span>
                    <span className="text-slate-300">
                      {rally.registered_participants} registreerunud
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Events and Tracks Info */}
            <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
              {/* Show events count if available */}
              {rally.total_events !== undefined && rally.total_events > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">📍</span>
                  <span className="text-slate-300">
                    {rally.total_events} {rally.total_events === 1 ? 'riik' : 'riiki'}
                  </span>
                </div>
              )}

              {/* FIXED: Only show tracks count if it's greater than 0 */}
              {rally.total_tracks !== undefined && rally.total_tracks > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">🛣️</span>
                  <span className="text-slate-300">
                    {rally.total_tracks} {rally.total_tracks === 1 ? 'rada' : 'rada'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {(showRegistration || viewMode === 'admin') && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/50">
                
                {/* User Registration Button */}
                {showRegistration && onRegister && (
                  <>
                    {registrationAllowed ? (
                      <button
                        onClick={() => onRegister(rally)}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        Registreeru
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium">
                        Registreerimine suletud
                      </div>
                    )}
                  </>
                )}

                {/* Admin Buttons */}
                {viewMode === 'admin' && (
                  <>
                    {onSendNotification && (
                      <button
                        onClick={() => onSendNotification(rally)}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        Saada teade
                      </button>
                    )}
                    
                    {onEdit && (
                      <button
                        onClick={() => onEdit(rally)}
                        className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        Muuda
                      </button>
                    )}
                    
                    {onDelete && (
                      <button
                        onClick={() => onDelete(rally)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        Kustuta
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}