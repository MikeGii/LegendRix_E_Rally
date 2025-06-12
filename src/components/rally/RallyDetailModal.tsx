// src/components/rally/RallyDetailModal.tsx
'use client'

import { useEffect } from 'react'
import { TransformedRally } from '@/hooks/useOptimizedRallies'

interface RallyDetailModalProps {
  rally: TransformedRally
  isOpen: boolean
  onClose: () => void
  onRegister: () => void
  isRegistrationOpen: boolean
}

export function RallyDetailModal({ 
  rally, 
  isOpen, 
  onClose, 
  onRegister, 
  isRegistrationOpen 
}: RallyDetailModalProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
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
      <div className="relative bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xl">🏁</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{rally.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                  {rally.status.replace('_', ' ').toUpperCase()}
                </span>
                {rally.is_featured && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                    ⭐ FEATURED
                  </span>
                )}
              </div>
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
        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Game</h3>
              <p className="text-lg font-semibold text-white">{rally.game_name}</p>
            </div>
            
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Game Type</h3>
              <p className="text-lg font-semibold text-white">{rally.game_type_name}</p>
            </div>
            
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Competition Date</h3>
              <p className="text-lg font-semibold text-white">
                {new Date(rally.competition_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Registration Deadline</h3>
              <p className="text-lg font-semibold text-white">
                {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Participants</h3>
              <p className="text-lg font-semibold text-white">
                {rally.registered_participants || 0} / {rally.max_participants || '∞'}
              </p>
            </div>
            
            {rally.entry_fee && rally.entry_fee > 0 && (
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Entry Fee</h3>
                <p className="text-lg font-semibold text-green-400">€{rally.entry_fee}</p>
              </div>
            )}
          </div>

          {/* Prize Pool */}
          {rally.prize_pool && rally.prize_pool > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-green-500/10 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Prize Pool</h3>
                  <p className="text-2xl font-bold text-green-400">€{rally.prize_pool}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {rally.description && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>📝</span>
                <span>Description</span>
              </h3>
              <div className="bg-slate-700/30 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{rally.description}</p>
              </div>
            </div>
          )}

          {/* Rules */}
          {rally.rules && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>📋</span>
                <span>Rules</span>
              </h3>
              <div className="bg-slate-700/30 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{rally.rules}</p>
              </div>
            </div>
          )}

          {/* Events & Tracks */}
          {rally.total_events && rally.total_events > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>🌍</span>
                <span>Events & Tracks</span>
              </h3>
              <div className="bg-slate-700/30 rounded-xl p-6">
                {rally.events && rally.events.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">📍</span>
                        <div>
                          <p className="text-sm text-slate-400">Total Events</p>
                          <p className="text-lg font-semibold text-white">{rally.total_events}</p>
                        </div>
                      </div>
                      
                      {rally.total_tracks && (
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-400">🛤️</span>
                          <div>
                            <p className="text-sm text-slate-400">Total Tracks</p>
                            <p className="text-lg font-semibold text-white">{rally.total_tracks}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Events:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rally.events.map((event, index) => (
                          <div key={index} className="bg-slate-600/30 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400 font-medium">#{index + 1}</span>
                              <span className="text-slate-300">{event.event_name || `Event ${index + 1}`}</span>
                            </div>
                            {event.surface_type && (
                              <p className="text-xs text-slate-400 mt-1">Surface: {event.surface_type}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400">📍</span>
                      <div>
                        <p className="text-sm text-slate-400">Total Events</p>
                        <p className="text-lg font-semibold text-white">{rally.total_events}</p>
                      </div>
                    </div>
                    
                    {rally.total_tracks && (
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">🛤️</span>
                        <div>
                          <p className="text-sm text-slate-400">Total Tracks</p>
                          <p className="text-lg font-semibold text-white">{rally.total_tracks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-800/50">
          <div className="text-sm text-slate-400">
            Created by {rally.creator_name || 'Rally Admin'}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-all duration-200"
            >
              Close
            </button>
            
            {isRegistrationOpen ? (
              <button 
                onClick={onRegister}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Registreeri
              </button>
            ) : (
              <button 
                disabled
                className="px-6 py-2 bg-slate-600 text-slate-400 rounded-lg font-medium cursor-not-allowed"
              >
                Registreerimine suletud
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}