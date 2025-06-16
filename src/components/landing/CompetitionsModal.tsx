// src/components/landing/CompetitionsModal.tsx - ENHANCED with row layout and fixed participant counts
'use client'

import { useEffect } from 'react'
import { PublicRally } from '@/hooks/usePublicRallies'

interface CompetitionsModalProps {
  isOpen: boolean
  onClose: () => void
  rallies: PublicRally[]
  isLoading: boolean
}

export function CompetitionsModal({ isOpen, onClose, rallies, isLoading }: CompetitionsModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Sort rallies by competition date
  const sortedRallies = [...rallies].sort((a, b) => {
    return new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime()
  })

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl w-full max-w-6xl max-h-[85vh] mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Eelseisvad Võistlused</h2>
              <p className="text-slate-400 mt-1">
                {isLoading ? 'Laadin võistlusi...' : `${sortedRallies.length} võistlust planeeritud`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center"
              aria-label="Sulge modal"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Laadin võistlusi...</p>
              </div>
            ) : sortedRallies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-slate-500">🏁</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Eelseisvaid võistlusi pole</h3>
                <p className="text-slate-400">
                  Hetkel pole planeeritud uusi rallisid. Kontrollige hiljem uuesti!
                </p>
              </div>
            ) : (
              /* ROW LAYOUT - Each competition on separate row */
              <div className="space-y-4">
                {sortedRallies.map((rally) => (
                  <div
                    key={rally.id}
                    className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200"
                  >
                    {/* Rally Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Left side - Rally info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 text-xl">🏁</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-xl leading-tight">
                            {rally.name}
                          </h3>
                          <p className="text-slate-400">{rally.game_name} • {rally.game_type_name}</p>
                          <p className="text-sm text-slate-500">
                            Võistlus: {formatDate(rally.competition_date)}
                          </p>
                        </div>
                      </div>

                      {/* Right side - Status */}
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rally.status)}`}>
                          {getStatusText(rally.status)}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Registreerimine: {formatDate(rally.registration_deadline)}
                        </p>
                      </div>
                    </div>

                    {/* Rally Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {/* Participants Count - PROMINENT DISPLAY */}
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {rally.registered_participants}
                          {rally.max_participants && (
                            <span className="text-slate-400 text-lg">/{rally.max_participants}</span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">Registreeritud</div>
                      </div>

                      {/* Events Count */}
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{rally.total_events}</div>
                        <div className="text-sm text-slate-400">
                          {rally.total_events === 1 ? 'Üritus' : 'Üritust'}
                        </div>
                      </div>

                      {/* Tracks Count */}
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">{rally.total_tracks}</div>
                        <div className="text-sm text-slate-400">
                          {rally.total_tracks === 1 ? 'Rada' : 'Rada'}
                        </div>
                      </div>

                      {/* Max Participants */}
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-400">
                          {rally.max_participants ? rally.max_participants : '∞'}
                        </div>
                        <div className="text-sm text-slate-400">Max osalejat</div>
                      </div>
                    </div>

                    {/* Description */}
                    {rally.description && (
                      <div className="bg-slate-800/30 rounded-lg p-4">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {rally.description}
                        </p>
                      </div>
                    )}

                    {/* Events List - Collapsible */}
                    {rally.events && rally.events.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Üritused:</h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {rally.events.map((event) => (
                            <div key={event.event_id} className="text-sm text-slate-400">
                              <span className="text-slate-300">{event.event_name}</span>
                              {event.tracks && event.tracks.length > 0 && (
                                <span className="text-slate-500"> ({event.tracks.length} rada)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}