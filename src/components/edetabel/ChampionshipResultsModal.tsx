// src/components/edetabel/ChampionshipResultsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useChampionshipResults, ChampionshipParticipant } from '@/hooks/useChampionshipResults'
import { ClickablePlayerName } from '../player/ClickablePlayerName'

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
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
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

  // Get sorted rally data for headers (by etapp_number/date order)
  const sortedRallies = results?.participants?.[0]?.rally_scores
    ?.map(rs => ({
      rally_id: rs.rally_id,
      rally_name: rs.rally_name,
      etapp_number: rs.etapp_number
    }))
    .sort((a, b) => (a.etapp_number || 0) - (b.etapp_number || 0)) || []

  // Helper functions matching RallyResultsModal exactly
  const getPositionColor = (position: number | null): string => {
    if (!position) return 'text-slate-400'
    if (position === 1) return 'text-yellow-400'
    if (position === 2) return 'text-slate-300'
    if (position === 3) return 'text-orange-400'
    return 'text-slate-400'
  }

  const getPodiumIcon = (position: number | null): string => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return ''
  }

  // Class priority for sorting (Pro > Semi-Pro > others)
  const getClassPriority = (className: string): number => {
    if (className?.toLowerCase().includes('pro') && !className?.toLowerCase().includes('semi')) return 1
    if (className?.toLowerCase().includes('semi')) return 2
    return 3
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" onClick={handleBackdropClick}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-6xl bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl max-h-[95vh] flex flex-col"
          onClick={handleModalClick}
        >
          
          {/* FIXED Header */}
          <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Rally Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  🏆 {championshipName}
                </h2>
                <p className="text-slate-400">Meistrivõistluste koondtulemused</p>
              </div>
              
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Class Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setSelectedClass('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedClass === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                Kõik klassid ({results?.participants?.length || 0})
              </button>
              {availableClasses.map((className) => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedClass === className
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {className} ({results?.participants?.filter(p => p.class_name === className)?.length || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-400 text-sm">Laen tulemusi...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-400 mb-2">❌ Viga tulemuste laadimisel</div>
                <p className="text-slate-400 text-sm">{error.message}</p>
              </div>
            ) : !results || results.participants.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-slate-400 text-sm">Tulemusi ei leitud</span>
              </div>
            ) : (
              <div className="bg-slate-900/50">
                {selectedClass === 'all' ? (
                  // ALL CLASSES VIEW - EXACT COPY of RallyResultsModal structure
                  <div>
                    {/* Table Header - More compact columns with even distribution */}
                    <div className="sticky top-0 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      <div className="grid gap-1 py-2 px-3 justify-items-center" style={{gridTemplateColumns: `60px 1fr 80px ${sortedRallies.map(() => '40px').join(' ')} 60px`}}>
                        <div className="text-center">Koht</div>
                        <div className="text-left">Osaleja</div>
                        <div className="text-center">Klass</div>
                        {sortedRallies.map((rally, index) => (
                          <div key={rally.rally_id} className="text-center">
                            E{index + 1}
                          </div>
                        ))}
                        <div className="text-center">Punktid</div>
                      </div>
                    </div>

                    {/* Class Sections */}
                    {(() => {
                      // Group participants by class
                      const resultsByClass: Record<string, ChampionshipParticipant[]> = {}
                      results.participants.forEach(participant => {
                        const className = participant.class_name || 'Määramata'
                        if (!resultsByClass[className]) {
                          resultsByClass[className] = []
                        }
                        resultsByClass[className].push(participant)
                      })

                      // Sort each class by championship position
                      Object.keys(resultsByClass).forEach(className => {
                        resultsByClass[className].sort((a, b) => {
                          const aPos = a.championship_position || 999
                          const bPos = b.championship_position || 999
                          return aPos - bPos
                        })
                      })

                      // Sort classes by priority (Pro first, then Semi-Pro, then others)
                      const sortedClasses = Object.keys(resultsByClass).sort((a, b) => {
                        const aPriority = getClassPriority(a)
                        const bPriority = getClassPriority(b)
                        return aPriority - bPriority
                      })

                      return sortedClasses.map((className, classIndex) => {
                        const classResults = resultsByClass[className]
                        const classPriority = getClassPriority(className)
                        
                        return (
                          <div key={className}>
                            {/* Class Separator Header - EXACT copy from RallyResultsModal */}
                            <div className="sticky top-[32px] bg-slate-800/90 backdrop-blur border-y border-slate-600/30 px-3 py-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold text-sm ${
                                    classPriority === 1 ? 'text-yellow-400' : 
                                    classPriority === 2 ? 'text-blue-400' : 'text-white'
                                  }`}>
                                    📊 {className.toUpperCase()}
                                    {classPriority === 1 && ' (PRO)'}
                                    {classPriority === 2 && ' (SEMI-PRO)'}
                                  </span>
                                  <span className="text-slate-400 text-xs">({classResults.length} osalejat)</span>
                                </div>
                                <div className="text-slate-400 text-xs">
                                  Parim: {classResults[0]?.total_points || '0'} punkti
                                </div>
                              </div>
                            </div>

                            {/* Class Results */}
                            <div className="divide-y divide-slate-700/20">
                              {classResults.map((participant, index) => {
                                const position = participant.championship_position || (index + 1)
                                const isTopPerformer = position <= 3
                                
                                return (
                                  <div 
                                    key={participant.participant_key}
                                    className={`grid gap-1 py-2 px-3 text-sm hover:bg-slate-800/30 transition-colors ${
                                      isTopPerformer ? 'bg-slate-800/20' : 'bg-slate-700/10'
                                    }`}
                                    style={{gridTemplateColumns: sortedRallies.length <= 15 ? `1fr 2fr 1fr ${sortedRallies.map(() => '1fr').join(' ')} 1fr` : `60px 1fr 80px ${sortedRallies.map(() => '40px').join(' ')} 60px`}}
                                  >
                                    {/* Position - Clean, no medals */}
                                    <div className="text-center flex items-center justify-center">
                                      <span className={`font-bold ${getPositionColor(position)}`}>
                                        {position || '-'}
                                      </span>
                                    </div>

                                    {/* Participant Name - Using ClickablePlayerName component */}
                                    <div className="justify-self-start w-full flex items-center">
                                      <ClickablePlayerName 
                                        playerName={participant.participant_name} 
                                        className="text-white font-medium hover:text-blue-400" 
                                        onModalOpen={() => setIsPlayerModalOpen(true)} 
                                        onModalClose={() => setIsPlayerModalOpen(false)} 
                                      />
                                    </div>

                                    {/* Class */}
                                    <div className="text-slate-300 text-sm text-center flex items-center justify-center">
                                      {participant.class_name}
                                    </div>

                                    {/* ALL Individual Rally Scores */}
                                    {sortedRallies.map((rally) => {
                                      const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                                      return (
                                        <div key={rally.rally_id} className="text-center flex items-center justify-center">
                                          {rallyScore?.participated ? (
                                            <div className="flex flex-col">
                                              <span className="text-white font-medium text-xs">{rallyScore.points}</span>
                                              {rallyScore.class_position && (
                                                <span className="text-xs text-slate-400">{rallyScore.class_position}.</span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-slate-500 text-xs">-</span>
                                          )}
                                        </div>
                                      )
                                    })}

                                    {/* Total Points */}
                                    <div className="text-center flex items-center justify-center">
                                      <span className={`font-bold text-sm ${getPositionColor(position)}`}>
                                        {participant.total_points}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                ) : (
                  // SINGLE CLASS VIEW - EXACT grid structure from RallyResultsModal
                  <div>
                    {/* Table Header */}
                    <div className="sticky top-0 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      <div className="grid gap-1 py-2 px-3" style={{gridTemplateColumns: sortedRallies.length <= 15 ? `1fr 2fr 1fr ${sortedRallies.map(() => '1fr').join(' ')} 1fr` : `60px 1fr 80px ${sortedRallies.map(() => '40px').join(' ')} 60px`}}>
                        <div className="text-center flex items-center justify-center">Koht</div>
                        <div className="text-left flex items-center">Osaleja</div>
                        <div className="text-center flex items-center justify-center">Klass</div>
                        {sortedRallies.map((rally, index) => (
                          <div key={rally.rally_id} className="text-center flex items-center justify-center">
                            E{index + 1}
                          </div>
                        ))}
                        <div className="text-center flex items-center justify-center">Punktid</div>
                      </div>
                    </div>

                    {/* Results Rows */}
                    <div className="divide-y divide-slate-700/30">
                      {(() => {
                        // Filter participants by selected class
                        const filteredParticipants = selectedClass === 'all' 
                          ? results.participants || []
                          : results.participants?.filter(p => p.class_name === selectedClass) || []

                        return filteredParticipants.map((participant, index) => {
                          const position = participant.championship_position || (index + 1)
                          const isTopPerformer = position <= 3
                          
                          return (
                            <div 
                              key={participant.participant_key}
                              className={`grid gap-1 py-2 px-3 text-sm hover:bg-slate-800/30 transition-colors ${
                                isTopPerformer ? 'bg-slate-800/20' : ''
                              }`}
                              style={{gridTemplateColumns: sortedRallies.length <= 15 ? `1fr 2fr 1fr ${sortedRallies.map(() => '1fr').join(' ')} 1fr` : `60px 1fr 80px ${sortedRallies.map(() => '40px').join(' ')} 60px`}}
                            >
                              {/* Position - Clean, no medals */}
                              <div className="text-center flex items-center justify-center">
                                <span className={`font-bold ${getPositionColor(position)}`}>
                                  {position || '-'}
                                </span>
                              </div>

                              {/* Participant Name - Using ClickablePlayerName component */}
                              <div className="justify-self-start w-full flex items-center">
                                <ClickablePlayerName 
                                  playerName={participant.participant_name} 
                                  className="text-white font-medium hover:text-blue-400" 
                                  onModalOpen={() => setIsPlayerModalOpen(true)} 
                                  onModalClose={() => setIsPlayerModalOpen(false)} 
                                />
                              </div>

                              {/* Class */}
                              <div className="text-slate-300 text-sm text-center flex items-center justify-center">
                                {participant.class_name}
                              </div>

                              {/* ALL Individual Rally Scores */}
                              {sortedRallies.map((rally) => {
                                const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                                return (
                                  <div key={rally.rally_id} className="text-center flex items-center justify-center">
                                    {rallyScore?.participated ? (
                                      <div className="flex flex-col">
                                        <span className="text-white font-medium text-xs">{rallyScore.points}</span>
                                        {rallyScore.class_position && (
                                          <span className="text-xs text-slate-400">{rallyScore.class_position}.</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-500 text-xs">-</span>
                                    )}
                                  </div>
                                )
                              })}

                              {/* Total Points */}
                              <div className="text-center flex items-center justify-center">
                                <span className={`font-bold text-sm ${getPositionColor(position)}`}>
                                  {participant.total_points}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      })()}
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
