// src/components/landing/CompetitionsModal.tsx
'use client'

import { useEffect } from 'react'
import { TransformedRally } from '@/hooks/useOptimizedRallies'

interface CompetitionsModalProps {
  isOpen: boolean
  onClose: () => void
  rallies: TransformedRally[]
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
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Laen võistlusi...</p>
              </div>
            </div>
          ) : sortedRallies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-slate-500">🏁</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Tulevasi võistlusi ei ole</h3>
              <p className="text-slate-400">
                Kontrollige hiljem uute rallide väljakuulutamiste jaoks!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRallies.map((rally) => (
                <div
                  key={rally.id}
                  className="bg-slate-700/30 backdrop-blur-xl rounded-xl border border-slate-600/50 p-6 hover:bg-slate-700/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    {/* Rally Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* Rally Name & Status */}
                      <div className="md:col-span-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-blue-400 text-lg">🏁</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{rally.name}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Game Name */}
                      <div className="md:col-span-1">
                        <div className="text-center md:text-left">
                          <p className="text-sm text-slate-400">Mäng</p>
                          <p className="text-sm font-medium text-slate-300">{rally.game_name}</p>
                        </div>
                      </div>

                      {/* Rally Type */}
                      <div className="md:col-span-1">
                        <div className="text-center md:text-left">
                          <p className="text-sm text-slate-400">Tüüp</p>
                          <p className="text-sm font-medium text-slate-300">{rally.game_type_name}</p>
                        </div>
                      </div>

                      {/* Countries/Events */}
                      <div className="md:col-span-1">
                        <div className="text-center md:text-left">
                          <p className="text-sm text-slate-400">Riigid</p>
                          <div className="text-sm font-medium text-slate-300">
                            {rally.events && rally.events.length > 0 ? (
                              <div className="space-y-1">
                                {rally.events.map((event, index) => (
                                  <div key={index} className="text-xs">
                                    {event.event_name || `Event ${index + 1}`}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span>{rally.total_events || 0} riiki</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Competition Date */}
                      <div className="md:col-span-1">
                        <div className="text-center md:text-left">
                          <p className="text-sm text-slate-400">Võistluse kuupäev</p>
                          <p className="text-sm font-medium text-slate-300">
                            {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Registered Participants */}
                      <div className="md:col-span-1">
                        <div className="text-center md:text-left">
                          <p className="text-sm text-slate-400">Registreerunud</p>
                          <div className="flex items-center justify-center md:justify-start space-x-2">
                            <span className="text-sm font-medium text-green-400">
                              {rally.registered_participants || 0}
                            </span>
                            <span className="text-xs text-slate-500">
                              / {rally.max_participants || '∞'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {rally.description && (
                    <div className="mt-4 pt-4 border-t border-slate-600/30">
                      <p className="text-slate-300 text-sm line-clamp-2">{rally.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-800/50">
          <div className="text-sm text-slate-400">
            Kokku {sortedRallies.length} tulevast võistlust
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-all duration-200"
          >
            Sulge
          </button>
        </div>
      </div>
    </div>
  )
}