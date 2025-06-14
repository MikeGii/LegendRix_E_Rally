// src/components/rally/RallyDetailModal.tsx - ENHANCED with Statistics (Preserves All Existing Functions)
'use client'

import { useState } from 'react'
import { TransformedRally, useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { useRallyRegistrations } from '@/hooks/useRallyRegistrations'

// Simple local interfaces to avoid type conflicts
interface SimpleRallyEvent {
  event_id: string
  event_name: string
  event_order: number
  tracks?: SimpleRallyTrack[]
}

interface SimpleRallyTrack {
  id: string
  name: string
  surface_type?: string
  length_km?: number
  track_order: number
}

interface RallyDetailModalProps {
  rally: TransformedRally | null
  onClose: () => void
  onRegister?: () => void
}

export function RallyDetailModal({ rally, onClose, onRegister }: RallyDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'participants'>('info')
  
  // Get user's registrations to check if already registered
  const { data: userRegistrations = [] } = useUserRallyRegistrations()
  
  // Get all participants for this rally
  const { data: participants = [], isLoading: isLoadingParticipants } = useRallyRegistrations(rally?.id || '')
  
  if (!rally) return null

  // Check if user is already registered for this rally
  const userRegistration = userRegistrations.find(
    reg => reg.rally_id === rally.id && 
           (reg.status === 'registered' || reg.status === 'confirmed')
  )
  const isUserRegistered = !!userRegistration

  // ENHANCED: Calculate rally statistics
  const calculateStatistics = () => {
    const events = safeEvents || []
    
    // Calculate unique countries/events count
    const uniqueCountries = events.length
    
    // Calculate total tracks count and total length
    let totalTracks = 0
    let totalLength = 0
    
    events.forEach(event => {
      if (event.tracks) {
        totalTracks += event.tracks.length
        event.tracks.forEach(track => {
          if (track.length_km) {
            totalLength += track.length_km
          }
        })
      }
    })
    
    return {
      countries: uniqueCountries,
      tracks: totalTracks,
      totalLength: Math.round(totalLength * 10) / 10 // Round to 1 decimal place
    }
  }
  
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
      default: return status
    }
  }

  // Group participants by class - WITH PROPER TYPING
  const participantsByClass: Record<string, any[]> = {}
  participants.forEach(participant => {
    const className = participant.class_name || 'Tundmatu klass'
    if (!participantsByClass[className]) {
      participantsByClass[className] = []
    }
    participantsByClass[className].push(participant)
  })

  // Sort participants within each class by registration date
  Object.keys(participantsByClass).forEach(className => {
    participantsByClass[className].sort((a: any, b: any) => 
      new Date(a.registration_date).getTime() - new Date(b.registration_date).getTime()
    )
  })

  const totalParticipants = participants.length

  // SAFE TYPE HANDLING FOR EVENTS
  const safeEvents: SimpleRallyEvent[] = []
  if (rally.events && Array.isArray(rally.events)) {
    rally.events.forEach((event: any) => {
      if (event && typeof event === 'object') {
        const safeTracks: SimpleRallyTrack[] = []
        if (event.tracks && Array.isArray(event.tracks)) {
          event.tracks.forEach((track: any) => {
            if (track && typeof track === 'object') {
              safeTracks.push({
                id: track.id || '',
                name: track.name || '',
                surface_type: track.surface_type,
                length_km: track.length_km,
                track_order: track.track_order || 0
              })
            }
          })
        }
        safeEvents.push({
          event_id: event.event_id || '',
          event_name: event.event_name || '',
          event_order: event.event_order || 0,
          tracks: safeTracks
        })
      }
    })
  }

  // ENHANCED: Calculate statistics after safeEvents is defined
  const statistics = calculateStatistics()

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-blue-400 text-xl">🏁</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{rally.name}</h2>
              <p className="text-slate-400">{rally.game_name} • {rally.game_type_name}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <span className="text-slate-400 text-2xl">×</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-700/50 shrink-0">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              ℹ️ Rally info
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'participants'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              👥 Osalejad ({totalParticipants})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Staatus</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rally.status)}`}>
                        {getStatusText(rally.status)}
                      </span>
                      {isUserRegistered && (
                        <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                          Registreeritud
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Võistluse kuupäev</label>
                    <p className="text-white font-medium">
                      {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Registreerimise tähtaeg</label>
                    <p className="text-white font-medium">
                      {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Mäng</label>
                    <p className="text-white font-medium">{rally.game_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Kategooria</label>
                    <p className="text-white font-medium">{rally.game_type_name}</p>
                  </div>

                  {rally.max_participants && (
                    <div>
                      <label className="text-sm font-medium text-slate-400">Osalejate arv</label>
                      <p className="text-white font-medium">
                        {totalParticipants} / {rally.max_participants}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ENHANCED: Description - MOVED UP as requested */}
              {rally.description && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Kirjeldus</label>
                  <div className="mt-2 p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-300 whitespace-pre-wrap">{rally.description}</p>
                  </div>
                </div>
              )}

              {/* ENHANCED: Rules - MOVED UNDER DESCRIPTION as requested */}
              {rally.rules && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Reeglid</label>
                  <div className="mt-2 p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-300 whitespace-pre-wrap">{rally.rules}</p>
                  </div>
                </div>
              )}

              {/* Events and Tracks */}
              {safeEvents.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Etapid ja rajad</label>
                  <div className="mt-2 space-y-4">
                    {safeEvents.map((event, eventIndex) => (
                      <div key={event.event_id || eventIndex} className="bg-slate-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">
                          {eventIndex + 1}. {event.event_name}
                        </h4>
                        {event.tracks && event.tracks.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {event.tracks.map((track, trackIndex) => (
                              <div key={track.id || trackIndex} className="bg-slate-600/30 rounded p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-300">
                                    {trackIndex + 1}. {track.name}
                                  </span>
                                  <div className="flex items-center space-x-2 text-xs">
                                    {track.length_km && (
                                      <span className="text-slate-400">{track.length_km}km</span>
                                    )}
                                    {track.surface_type && (
                                      <span className="text-slate-400 capitalize">{track.surface_type}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ENHANCED: NEW Statistics Row - Added below Events and Tracks as requested */}
              {statistics.tracks > 0 && (
                <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    📊 Võistluste statistika
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Countries/Events Count */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🌍</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">{statistics.countries}</div>
                      <div className="text-sm text-slate-400">
                        {statistics.countries === 1 ? 'Riik' : 'Riigid'}
                      </div>
                    </div>

                    {/* Tracks Count */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🛣️</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">{statistics.tracks}</div>
                      <div className="text-sm text-slate-400">
                        {statistics.tracks === 1 ? 'Rada' : 'Rajad'}
                      </div>
                    </div>

                    {/* Total Length */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📏</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {statistics.totalLength}
                        <span className="text-lg text-slate-400 ml-1">km</span>
                      </div>
                      <div className="text-sm text-slate-400">Kogu pikkus</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Participants Section - PRESERVED ORIGINAL FUNCTIONALITY */}
              {isLoadingParticipants ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Laadin osalejaid...</p>
                </div>
              ) : totalParticipants === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl text-slate-500">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Osalejaid pole veel</h3>
                  <p className="text-slate-400">
                    Registreerimine on veel avatud!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">
                    Registreeritud osalejad ({totalParticipants})
                  </h3>
                  
                  {Object.keys(participantsByClass).map((className) => (
                    <div key={className} className="bg-slate-700/30 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                        <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xs">
                          {participantsByClass[className].length}
                        </span>
                        <span>{className}</span>
                      </h4>
                      
                      <div className="space-y-2">
                        {participantsByClass[className].map((participant: any, index: number) => (
                          <div
                            key={participant.id || index}
                            className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300 text-sm font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <p className="text-white font-medium">
                                  {participant.user_player_name || participant.user_name || 'Tundmatu kasutaja'}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Registreeritud: {new Date(participant.registration_date).toLocaleDateString('et-EE')}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                participant.status === 'confirmed'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : participant.status === 'registered'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                              }`}>
                                {participant.status === 'confirmed' ? 'Kinnitatud' :
                                 participant.status === 'registered' ? 'Registreeritud' :
                                 participant.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - PRESERVED ORIGINAL FUNCTIONALITY */}
        <div className="border-t border-slate-700/50 p-6 bg-slate-800/50 shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              Sulge
            </button>
            
            {onRegister && !isUserRegistered && rally.status === 'registration_open' && (
              <button
                onClick={onRegister}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Registreeru
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}