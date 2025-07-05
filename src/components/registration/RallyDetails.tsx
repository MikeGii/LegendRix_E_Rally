// src/components/registration/RallyDetails.tsx - COMPLETE MOBILE RESPONSIVE VERSION
'use client'

import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { getRallyStatus, getStatusDisplayText, getStatusColor } from '@/hooks/useOptimizedRallies'
import '@/styles/futuristic-theme.css'

interface RallyDetailsProps {
  rally: TransformedRally | null
}

export function RallyDetails({ rally }: RallyDetailsProps) {
  if (!rally) {
    return (
      <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-6 sm:p-12">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <span className="text-3xl sm:text-4xl opacity-50">🏁</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wider">
            Ralli ei leitud
          </h3>
          <p className="text-gray-400 text-sm sm:text-base">Valitud ralli andmeid ei õnnestunud laadida.</p>
        </div>
      </div>
    )
  }

  // Get real-time status
  const currentStatus = getRallyStatus(rally)
  const statusText = getStatusDisplayText(currentStatus)
  const statusColorClass = getStatusColor(currentStatus)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Calculate days until registration deadline
  const daysUntilDeadline = () => {
    const now = new Date()
    const deadline = new Date(rally.registration_deadline)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const deadlineDays = daysUntilDeadline()

  // Separate event and track data for display
  const rallyEvents = rally.events || []

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Rally Header Card - Futuristic Design */}
      <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl overflow-hidden">
        {/* Header Background Pattern */}
        <div className="relative p-4 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-gray-900/10"></div>
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl flex items-center justify-center border border-red-500/30 shadow-[0_0_20px_rgba(255,0,64,0.3)]">
                <span className="text-red-400 text-xl sm:text-2xl">🏁</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-2xl font-black text-white mb-2 font-['Orbitron'] uppercase tracking-wider text-glow-red">
                  {rally.name}
                </h3>
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-red-400 font-bold font-['Orbitron'] text-sm sm:text-base">{rally.game_name}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 text-sm sm:text-base">{rally.game_type_name}</span>
                </div>
                
                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold font-['Orbitron'] uppercase tracking-wider ${statusColorClass} backdrop-blur-sm`}>
                    {statusText}
                  </span>
                </div>
              </div>
            </div>

            {/* Description with gradient fade */}
            {rally.description && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-800">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {rally.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rally Schedule - Futuristic Timeline */}
      <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <span className="text-green-400 text-base sm:text-lg">📅</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              Ajakava
            </h4>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Competition Date */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl p-3 sm:p-4 border border-gray-800 hover:border-gray-700 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-gray-400 text-sm sm:text-base font-medium">Võistluse kuupäev</span>
                <div className="text-left sm:text-right">
                  <span className="text-white font-bold font-['Orbitron'] text-sm sm:text-base block">
                    {formatDate(rally.competition_date)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Registration Deadline */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl p-3 sm:p-4 border border-gray-800 hover:border-gray-700 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-gray-400 text-sm sm:text-base font-medium">Registreerimise tähtaeg</span>
                <div className="text-left sm:text-right">
                  <span className="text-white font-bold font-['Orbitron'] text-sm sm:text-base block">
                    {formatDate(rally.registration_deadline)}
                  </span>
                  {deadlineDays > 0 && (
                    <span className="text-green-400 text-xs sm:text-sm font-['Orbitron'] animate-pulse">
                      {deadlineDays} päeva jäänud
                    </span>
                  )}
                  {deadlineDays === 0 && (
                    <span className="text-yellow-400 text-xs sm:text-sm font-['Orbitron'] animate-pulse">
                      ⚠️ Täna viimane päev!
                    </span>
                  )}
                  {deadlineDays < 0 && (
                    <span className="text-red-400 text-xs sm:text-sm font-['Orbitron']">
                      ❌ Tähtaeg möödunud
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rally Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Participants */}
        {rally.max_participants && (
          <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider">
                Osalejaid
              </span>
              <span className="text-lg sm:text-2xl font-bold text-white font-['Orbitron']">
                {rally.registered_participants || 0}/{rally.max_participants}
              </span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${((rally.registered_participants || 0) / rally.max_participants) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Events Count */}
        {rally.total_events !== undefined && rally.total_events > 0 && (
          <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider">
                Etapid
              </span>
              <span className="text-lg sm:text-2xl font-bold text-white font-['Orbitron']">
                {rally.total_events}
              </span>
            </div>
          </div>
        )}

        {/* Tracks Count */}
        {rally.total_tracks !== undefined && rally.total_tracks > 0 && (
          <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider">
                Rajad
              </span>
              <span className="text-lg sm:text-2xl font-bold text-white font-['Orbitron']">
                {rally.total_tracks}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rules Section */}
      {rally.rules && (
        <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-xl flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                <span className="text-orange-400 text-base sm:text-lg">📋</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                Ralli reeglid
              </h4>
            </div>
            <div className="bg-gradient-to-r from-orange-900/10 to-gray-900/10 rounded-xl p-3 sm:p-4 border border-orange-500/20">
              <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{rally.rules}</p>
            </div>
          </div>
        </div>
      )}

      {/* Events and Tracks */}
      {rallyEvents.length > 0 && (
        <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <span className="text-purple-400 text-base sm:text-lg">🗺️</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                Etapid ja rajad
              </h4>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {rallyEvents.map((event, eventIndex) => (
                <div 
                  key={event.event_id} 
                  className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl p-3 sm:p-4 border border-gray-800"
                >
                  <h5 className="text-white font-bold mb-2 sm:mb-3 flex items-center space-x-2">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600/20 to-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 font-['Orbitron'] text-xs sm:text-sm">
                      {eventIndex + 1}
                    </span>
                    <span className="text-sm sm:text-base">{event.event_name}</span>
                  </h5>
                  
                  {event.tracks && event.tracks.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {event.tracks.map((track, trackIndex) => (
                        <div 
                          key={track.id} 
                          className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-xs sm:text-sm font-medium">
                              <span className="text-gray-500 mr-1 sm:mr-2 font-['Orbitron']">{trackIndex + 1}.</span>
                              {track.name}
                            </span>
                            {track.length_km && (
                              <span className="text-xs text-gray-500 font-['Orbitron']">
                                {track.length_km} km
                              </span>
                            )}
                          </div>
                          {track.surface_type && (
                            <span className="text-xs text-gray-500 mt-1 block">
                              {track.surface_type}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Info Footer */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 font-['Orbitron']">
        <span>ID: {rally.id.slice(0, 8)}...</span>
        <span>•</span>
        <span>Loodud: {formatShortDate(rally.created_at)}</span>
      </div>
    </div>
  )
}