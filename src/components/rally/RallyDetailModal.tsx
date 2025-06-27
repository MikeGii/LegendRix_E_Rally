// src/components/rally/RallyDetailModal.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TransformedRally, useUserRallyRegistrations, UserRallyRegistration } from '@/hooks/useOptimizedRallies'
import { useRallyRegistrations, RallyRegistration } from '@/hooks/useRallyRegistrations'
import { 
  getRallyStatus, 
  getStatusDisplayText, 
  getStatusColor,
  canRegisterToRally,
  isRallyInPast 
} from '@/hooks/useOptimizedRallies'

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
  userRegistration?: UserRallyRegistration
  onUnregister?: () => void
}

export function RallyDetailModal({ rally, onClose, onRegister, userRegistration: propUserRegistration, onUnregister }: RallyDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'participants'>('info')
  const [isClosing, setIsClosing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  
  if (!rally) return null

  // Calculate real-time status
  const realTimeStatus = getRallyStatus({
    competition_date: rally.competition_date,
    registration_deadline: rally.registration_deadline
  })

  const registrationAllowed = canRegisterToRally({
    competition_date: rally.competition_date,
    registration_deadline: rally.registration_deadline
  })

  const isPastRally = isRallyInPast({
    competition_date: rally.competition_date
  })
  
  // Get user's registrations to check if already registered
  const { data: userRegistrations = [] } = useUserRallyRegistrations()
  
  // Get all participants for this rally
  const { data: participants = [], isLoading: isLoadingParticipants } = useRallyRegistrations(rally?.id || '')

  // Check if user is already registered for this rally
  const currentUserRegistration = propUserRegistration || userRegistrations.find(
    reg => reg.rally_id === rally.id && 
           (reg.status === 'registered' || reg.status === 'confirmed')
  )
  const isUserRegistered = !!currentUserRegistration

  // Get status styles for futuristic theme
  const statusInfo = getStatusDisplayText(realTimeStatus)
  const statusColor = getStatusColor(realTimeStatus)
  
  const getStatusStyles = (color: string) => {
    switch (color) {
      case 'bg-green-500/20 text-green-400 border-green-500/30':
        return {
          bg: 'bg-gradient-to-r from-green-900/30 to-green-800/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        }
      case 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30':
        return {
          bg: 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]'
        }
      case 'bg-orange-500/20 text-orange-400 border-orange-500/30':
        return {
          bg: 'bg-gradient-to-r from-orange-900/30 to-orange-800/20',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
        }
      case 'bg-red-500/20 text-red-400 border-red-500/30':
        return {
          bg: 'bg-gradient-to-r from-red-900/30 to-red-800/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-900/30 to-gray-800/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          glow: ''
        }
    }
  }

  const styles = getStatusStyles(statusColor)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('et-EE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Tallinn'
    })
  }

  // Safe event and track data - FIXED property names
  const rallyEventsData = rally.events || [] // Changed from rally_events to events
  const safeEvents: SimpleRallyEvent[] = rallyEventsData
    .map(re => ({
      event_id: re.event_id || '',
      event_name: re.event_name || 'Tundmatu etapp', // Changed from re.events?.name
      event_order: re.event_order || 0,
      tracks: (re.tracks || []) // Changed from re.rally_tracks
        .map(rt => ({
          id: rt.id || '',
          name: rt.name || 'Tundmatu rada', // Changed from rt.tracks?.name
          surface_type: rt.surface_type || undefined,
          length_km: rt.length_km || undefined,
          track_order: rt.track_order || 0
        }))
        .sort((a, b) => a.track_order - b.track_order)
    }))
    .sort((a, b) => a.event_order - b.event_order)

  const modalContent = (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative w-full max-w-3xl max-h-[85vh] bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] overflow-hidden flex flex-col ${isClosing ? 'animate-slideOut' : 'animate-slideIn'}`}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-red-900/30 to-gray-900/30 border-b border-gray-800 px-6 py-4">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <h2 className="text-2xl font-black text-white font-['Orbitron'] uppercase tracking-wider">
              {rally.name}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-red-400 group-hover:rotate-90 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Status badge - FIXED */}
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold font-['Orbitron'] uppercase tracking-wider ${styles.bg} ${styles.border} ${styles.text} ${styles.glow} border backdrop-blur-sm`}>       
              {getStatusDisplayText(realTimeStatus)}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-3 text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'info'
                ? 'text-red-400 border-b-2 border-red-500 bg-red-900/10'
                : 'text-gray-400 hover:text-red-400 hover:bg-gray-800/30'
            }`}
          >
            Ralli info
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 px-6 py-3 text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'participants'
                ? 'text-red-400 border-b-2 border-red-500 bg-red-900/10'
                : 'text-gray-400 hover:text-red-400 hover:bg-gray-800/30'
            }`}
          >
            Osalejad ({participants.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {activeTab === 'info' ? (
              <div className="space-y-6">
                {/* Rally Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Game info */}
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-800">
                    <label className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Mäng</label>
                    <p className="text-white font-medium mt-1">{rally.game_name || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-800">
                    <label className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Tüüp</label>
                    <p className="text-white font-medium mt-1">{rally.game_type_name || 'N/A'}</p>
                  </div>
                  
                  {/* Dates */}
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-800">
                    <label className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Võistluse aeg</label>
                    <p className="text-white font-medium mt-1">{formatDate(rally.competition_date)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-800">
                    <label className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Registreerimine kuni</label>
                    <p className="text-white font-medium mt-1">{formatDate(rally.registration_deadline)}</p>
                  </div>
                  
                  {/* Participants */}
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-800">
                    <label className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Osalejaid</label>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-bold text-white font-['Orbitron']">{participants.length}</span>
                      {rally.max_participants && (
                        <span className="text-gray-500">/ {rally.max_participants}</span>
                      )}
                    </div>
                    {rally.max_participants && (
                      <div className="mt-2">
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${(participants.length / rally.max_participants) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Available spots */}
                  {rally.max_participants && (
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-800">
                      <label className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Vabu kohti</label>
                      <p className={`text-2xl font-bold font-['Orbitron'] mt-1 ${
                        rally.max_participants - participants.length > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {Math.max(0, rally.max_participants - participants.length)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {rally.description && (
                  <div>
                    <label className="text-sm font-bold text-white font-['Orbitron'] uppercase tracking-wider mb-3 block">Kirjeldus</label>
                    <div className="p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-800">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{rally.description}</p>
                    </div>
                  </div>
                )}

                {/* Rules */}
                {rally.rules && (
                  <div>
                    <label className="text-sm font-bold text-white font-['Orbitron'] uppercase tracking-wider mb-3 block">Reeglid</label>
                    <div className="p-4 bg-gradient-to-br from-red-900/20 to-gray-900/30 rounded-xl border border-red-500/30">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{rally.rules}</p>
                    </div>
                  </div>
                )}

                {/* Events and Tracks */}
                {safeEvents.length > 0 && (
                  <div>
                    <label className="text-sm font-bold text-white font-['Orbitron'] uppercase tracking-wider mb-3 block">
                      Etapid ja rajad
                    </label>
                    <div className="space-y-3">
                      {safeEvents.map((event, eventIndex) => (
                        <div key={event.event_id || eventIndex} className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-800">
                          <h4 className="text-white font-bold mb-3 flex items-center space-x-2">
                            <span className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400 font-['Orbitron'] text-sm">
                              {eventIndex + 1}
                            </span>
                            <span>{event.event_name}</span>
                          </h4>
                          {event.tracks && event.tracks.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {event.tracks.map((track, trackIndex) => (
                                <div key={track.id || trackIndex} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-300 font-medium">
                                      <span className="text-gray-500 mr-2">{trackIndex + 1}.</span>
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
                )}
              </div>
            ) : (
              /* Participants Tab */
              <div>
                {isLoadingParticipants ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-2 text-gray-500">
                      <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                      <span className="font-['Orbitron'] text-xs uppercase tracking-wider">Laadin osalejaid...</span>
                    </div>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
                      <span className="text-3xl opacity-50">👥</span>
                    </div>
                    <p className="text-gray-500">Veel pole ühtegi osalejat registreerunud</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group participants by class */}
                    {(() => {
                      // Group participants by class
                      const participantsByClass = participants.reduce((acc, participant) => {
                        const className = participant.class_name || 'Klass määramata'
                        if (!acc[className]) {
                          acc[className] = []
                        }
                        acc[className].push(participant)
                        return acc
                      }, {} as Record<string, RallyRegistration[]>)

                      // Sort classes alphabetically
                      const sortedClasses = Object.keys(participantsByClass).sort()

                      return sortedClasses.map((className, classIndex) => {
                        const classParticipants = participantsByClass[className]
                        // Sort participants within each class by registration date
                        const sortedParticipants = [...classParticipants].sort((a, b) => 
                          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        )

                        return (
                          <div key={className} className="space-y-3">
                            {/* Class header */}
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-sm font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                                {className}
                              </h4>
                              <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 via-gray-500/30 to-transparent"></div>
                              <span className="text-xs text-gray-500 font-['Orbitron']">
                                {sortedParticipants.length} osalejat
                              </span>
                            </div>

                            {/* Participants in this class */}
                            <div className="space-y-2">
                              {sortedParticipants.map((participant, index) => (
                                <div
                                  key={participant.id}
                                  className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300"
                                  style={{ animationDelay: `${(classIndex * 50) + (index * 30)}ms` }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-gray-600/20 rounded-lg flex items-center justify-center text-white font-bold font-['Orbitron']">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">
                                        {participant.user_player_name || participant.user_name || 'Tundmatu'}
                                      </p>
                                      {/* Team info if needed - currently not in RallyRegistration type */}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-600">
                                      {new Date(participant.created_at).toLocaleDateString('et-EE')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex-shrink-0 border-t border-gray-800 px-6 py-4 bg-gradient-to-r from-gray-900/50 to-black/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 font-['Orbitron']">
              ID: {rally.id.slice(0, 8)}...
            </div>
            <div className="flex items-center space-x-3">
              {!isPastRally && registrationAllowed && onRegister && !isUserRegistered && (
                <button
                  onClick={onRegister}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,64,0.4)] hover:shadow-[0_0_30px_rgba(255,0,64,0.6)] hover:scale-105"
                >
                  Registreeri
                </button>
              )}
              {isUserRegistered && onUnregister && currentUserRegistration && (
                <button
                  onClick={() => onUnregister()}
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-[0_0_20px_rgba(251,146,60,0.4)] hover:shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:scale-105"
                >
                  Tühista registreering
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 border border-gray-700 hover:border-gray-600"
              >
                Sulge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document root
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}