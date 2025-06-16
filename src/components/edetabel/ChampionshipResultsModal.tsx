'use client'

import { useState, useEffect } from 'react'
import { useChampionshipResults, ChampionshipParticipant } from '@/hooks/useChampionshipResults'

interface ChampionshipResultsModalProps {
  isOpen: boolean
  onClose: () => void
  championshipId: string
  championshipName: string
}

export function ChampionshipResultsModal({ 
  isOpen, 
  onClose, 
  championshipId, 
  championshipName 
}: ChampionshipResultsModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const { data: results, isLoading, error } = useChampionshipResults(championshipId)

  // Reset class filter when championship changes
  useEffect(() => {
    setSelectedClass('all')
  }, [championshipId])

  if (!isOpen) return null

  const handleBackdropClick = () => {
    onClose()
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Get unique classes
  const availableClasses = Array.from(
    new Set(results?.participants?.map(p => p.class_name) || [])
  ).sort()

  // Filter participants by class
  const filteredParticipants = selectedClass === 'all' 
    ? results?.participants || []
    : results?.participants?.filter(p => p.class_name === selectedClass) || []

  // Sort by championship position (or total points if viewing all classes)
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (selectedClass === 'all') {
      // In multi-class view, sort by total points descending
      return b.total_points - a.total_points
    } else {
      // In single class view, sort by championship position
      return (a.championship_position || 999) - (b.championship_position || 999)
    }
  })

  const getPodiumIcon = (position: number): string => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return ''
    }
  }

  const getPositionColor = (position: number): string => {
    switch (position) {
      case 1: return 'text-yellow-400 font-bold'
      case 2: return 'text-slate-300 font-bold'
      case 3: return 'text-amber-600 font-bold'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-5xl bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden"
          onClick={handleModalClick}
        >
          
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  🏆 {championshipName}
                </h2>
                <p className="text-slate-400">
                  Meistrivõistluse lõplik edetabel
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Championship Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{results?.total_rounds || 0}</div>
                <div className="text-xs text-slate-400">Etappi kokku</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">{results?.participants?.length || 0}</div>
                <div className="text-xs text-slate-400">Osalejaid</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">{availableClasses.length}</div>
                <div className="text-xs text-slate-400">Klassi</div>
              </div>
            </div>

            {/* Class Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedClass('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedClass === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Kõik klassid ({results?.participants?.length || 0})
              </button>
              
              {availableClasses.map(className => {
                const classCount = results?.participants?.filter(p => p.class_name === className).length || 0
                return (
                  <button
                    key={className}
                    onClick={() => setSelectedClass(className)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedClass === className
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {className} ({classCount})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-slate-700/30 rounded h-16"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-400 mb-2">❌ Viga tulemuste laadimisel</div>
                <p className="text-slate-400 text-sm">{error.message}</p>
              </div>
            ) : sortedParticipants.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-slate-400 text-lg mb-2">📊</div>
                <p className="text-slate-400">Tulemusi ei leitud</p>
              </div>
            ) : (
              <div className="p-6">
                
                {/* SIMPLIFIED RESULTS TABLE */}
                <div className="bg-slate-800/20 rounded-xl border border-slate-700/50 overflow-hidden">
                  
                  {/* Table Header */}
                  <div className="sticky top-0 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 text-xs font-medium text-slate-400 uppercase tracking-wide">
                    <div className="grid grid-cols-12 gap-2 py-3 px-4">
                      <div className="col-span-1 text-center">Koht</div>
                      <div className="col-span-4">Osaleja</div>
                      <div className="col-span-2">Klass</div>
                      <div className="col-span-2 text-center">Etapid</div>
                      <div className="col-span-2 text-right">Punktid</div>
                      <div className="col-span-1 text-center">🏆</div>
                    </div>
                  </div>

                  {/* Results Rows */}
                  <div className="divide-y divide-slate-700/30 max-h-[60vh] overflow-y-auto">
                    {sortedParticipants.map((participant, index) => {
                      const position = selectedClass === 'all' ? index + 1 : participant.championship_position
                      const isTopPerformer = position && position <= 3
                      
                      return (
                        <div 
                          key={participant.participant_key}
                          className={`grid grid-cols-12 gap-2 py-3 px-4 text-sm hover:bg-slate-800/30 transition-colors ${
                            isTopPerformer ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                          }`}
                        >
                          {/* Position */}
                          <div className="col-span-1 text-center">
                            <span className={getPositionColor(position || 999)}>
                              {position || '-'}
                            </span>
                          </div>

                          {/* Participant Name */}
                          <div className="col-span-4 flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white">
                              {participant.participant_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium truncate">
                              {participant.participant_name}
                            </span>
                          </div>

                          {/* Class */}
                          <div className="col-span-2">
                            <span className="text-slate-300 text-xs truncate">
                              {participant.class_name}
                            </span>
                          </div>

                          {/* Etapps Participated */}
                          <div className="col-span-2 text-center">
                            <span className="text-slate-400 text-xs">
                              {participant.rounds_participated}/{results?.total_rounds || 0} etappi
                            </span>
                          </div>

                          {/* Total Points */}
                          <div className="col-span-2 text-right">
                            <span className={`font-bold ${getPositionColor(position || 999)}`}>
                              {participant.total_points.toFixed(1)}
                            </span>
                          </div>

                          {/* Podium Icon */}
                          <div className="col-span-1 text-center">
                            <span className="text-sm">
                              {getPodiumIcon(position || 999)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Championship Summary */}
                {results && results.participants.length > 0 && (
                  <div className="mt-6 p-4 bg-slate-800/20 rounded-lg border border-slate-700/30">
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Meistrivõistluse kokkuvõte</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
                      <div>
                        <span className="text-green-400 font-medium">{results.linked_participants}</span> seotud osalejat
                      </div>
                      <div>
                        <span className="text-orange-400 font-medium">{results.unlinked_participants}</span> sidumata osalejat
                      </div>
                      <div>
                        <span className="text-blue-400 font-medium">{results.total_rounds}</span> etappi kokku
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">{availableClasses.length}</span> erinevat klassi
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}