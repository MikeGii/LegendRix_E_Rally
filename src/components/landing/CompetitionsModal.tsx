// src/components/landing/CompetitionsModal.tsx - Futuristic Theme with Enhanced Design
'use client'

import { useEffect, useState } from 'react'
import { PublicRally } from '@/hooks/usePublicRallies'

interface CompetitionsModalProps {
  isOpen: boolean
  onClose: () => void
  rallies: PublicRally[]
  isLoading: boolean
}

export function CompetitionsModal({ isOpen, onClose, rallies, isLoading }: CompetitionsModalProps) {
  const [selectedGame, setSelectedGame] = useState<string>('all')
  
  // Handle ESC key press and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Sort rallies by competition date
  const sortedRallies = [...rallies].sort((a, b) => {
    return new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime()
  })

  // Get unique games for filter
  const uniqueGames = Array.from(new Set(rallies.map(r => r.game_name))).sort()

  // Filter rallies by selected game
  const filteredRallies = selectedGame === 'all' 
    ? sortedRallies 
    : sortedRallies.filter(r => r.game_name === selectedGame)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl max-h-[80vh] flex">
        <div className="relative w-full tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] bg-black/95 flex flex-col">
          {/* Close button - enhanced with red styling and better positioning */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-xl bg-red-600/20 border-2 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 hover:text-red-300 transition-all duration-300 group shadow-[0_0_20px_rgba(255,0,64,0.3)]"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-modal-scrollbar">
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-red-500/30 p-6 z-10">
              <h2 className="text-3xl font-black text-white font-['Orbitron'] tracking-wider mb-1">
                EELSEISVAD <span className="text-red-500">VÕISTLUSED</span>
              </h2>
              <p className="text-gray-400">
                {isLoading ? (
                  <span className="animate-pulse">Laadin võistlusi...</span>
                ) : (
                  `Kokku ${filteredRallies.length} võistlust`
                )}
              </p>

              {/* Game Filter */}
              {!isLoading && uniqueGames.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGame('all')}
                    className={`px-4 py-2 rounded-lg font-['Orbitron'] text-sm uppercase tracking-wider transition-all duration-300 ${
                      selectedGame === 'all'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-red-500/30'
                    }`}
                  >
                    Kõik mängud
                  </button>
                  {uniqueGames.map(game => (
                    <button
                      key={game}
                      onClick={() => setSelectedGame(game)}
                      className={`px-4 py-2 rounded-lg font-['Orbitron'] text-sm uppercase tracking-wider transition-all duration-300 ${
                        selectedGame === game
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-red-500/30'
                      }`}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider">LAADIN VÕISTLUSI...</p>
                </div>
              ) : filteredRallies.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏁</span>
                  </div>
                  <p className="text-gray-400 text-lg">
                    {selectedGame === 'all' 
                      ? 'Eelseisvaid võistlusi ei leitud'
                      : `${selectedGame} võistlusi ei leitud`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRallies.map((rally, index) => (
                    <div 
                      key={rally.id}
                      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="tech-border rounded-xl">
                        <div className="p-6">
                          {/* Top row with game */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider">
                              {rally.game_name}
                            </div>
                          </div>

                          {/* Rally name */}
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                            {rally.name}
                          </h3>

                          {/* Rally details grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Competition date */}
                            <div className="flex items-center space-x-2">
                              <span className="text-red-400">📅</span>
                              <div>
                                <p className="text-gray-500 text-xs uppercase">Võistluse aeg</p>
                                <p className="text-gray-300">{formatDate(rally.competition_date)}</p>
                              </div>
                            </div>

                            {/* Registration deadline */}
                            <div className="flex items-center space-x-2">
                              <span className="text-red-400">⏰</span>
                              <div>
                                <p className="text-gray-500 text-xs uppercase">Registreerimine kuni</p>
                                <p className="text-gray-300">{formatDate(rally.registration_deadline)}</p>
                              </div>
                            </div>

                            {/* Participants */}
                            <div className="flex items-center space-x-2">
                              <span className="text-red-400">👥</span>
                              <div>
                                <p className="text-gray-500 text-xs uppercase">Osalejaid</p>
                                <p className="text-gray-300">
                                  {rally.registered_participants || 0}
                                  {rally.max_participants && ` / ${rally.max_participants}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description if available */}
                          {rally.description && (
                            <div className="mt-4 pt-4 border-t border-gray-800">
                              <p className="text-gray-400 text-sm leading-relaxed">
                                {rally.description}
                              </p>
                            </div>
                          )}

                          {/* Bottom gradient line that animates on hover */}
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/50 transition-all duration-300"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}