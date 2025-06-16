// src/components/landing/CompetitionsModal.tsx - ENHANCED with participant counts and events
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xl">🏁</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tulevased Võistlused</h2>
              <p className="text-slate-400">Vaadake kõiki lähituleviku rallisid ja osalejaid</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedRallies.map((rally) => (
                <div
                  key={rally.id}
                  className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/50 transition-all duration-200"
                >
                  {/* Rally Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-lg">🏁</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg leading-tight">
                          {rally.name}
                        </h3>
                        <p className="text-sm text-slate-400">{rally.game_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rally Status */}
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                      {getStatusText(rally.status)}
                    </span>
                  </div>

                  {/* Rally Stats Grid - ENHANCED with real data */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Participants Count - FIXED */}
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-400">
                        {rally.registered_participants}
                        {rally.max_participants && (
                          <span className="text-slate-400 text-sm">/{rally.max_participants}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">Osalejat</div>
                    </div>

                    {/* Events Count - FIXED */}
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">{rally.total_events}</div>
                      <div className="text-xs text-slate-400">
                        {rally.total_events === 1 ? 'Riik' : 'Riiki'}
                      </div>
                    </div>

                    {/* Tracks Count */}
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-yellow-400">{rally.total_tracks}</div>
                      <div className="text-xs text-slate-400">
                        {rally.total_tracks === 1 ? 'Rada' : 'Rada'}
                      </div>
                    </div>

                    {/* Game Type */}
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-400">🎮</div>
                      <div className="text-xs text-slate-400">{rally.game_type_name}</div>
                    </div>
                  </div>

                  {/* Rally Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-400">🏁</span>
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
                      <span className="text-slate-400">📝</span>
                      <span className="text-slate-300">
                        Registreerimine kuni {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Events List - Show first few events */}
                  {rally.events && rally.events.length > 0 && (
                    <div className="border-t border-slate-700/30 pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-slate-400 text-sm">🌍</span>
                        <span className="text-slate-300 text-sm font-medium">Riigid:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rally.events.slice(0, 3).map((event, index) => (
                          <span 
                            key={event.event_id}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                          >
                            {event.event_name}
                          </span>
                        ))}
                        {rally.events.length > 3 && (
                          <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded text-xs">
                            +{rally.events.length - 3} veel
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {rally.description && (
                    <div className="border-t border-slate-700/30 pt-4 mt-4">
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {rally.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}