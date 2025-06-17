// src/components/edetabel/ChampionshipResultsModal.tsx - REMOVED ETAPID COLUMN FOR MORE SPACE
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

  // Get sorted rally data for headers (by etapp_number/date order)
  const sortedRallies = results?.participants?.[0]?.rally_scores
    ?.sort((a, b) => (a.etapp_number || a.round_number) - (b.etapp_number || b.round_number)) || []

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
          className="relative w-full max-w-7xl bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] flex flex-col"
          onClick={handleModalClick}
        >
          
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-6 border-b border-slate-700">
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
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                Kõik klassid ({results?.participants?.length || 0})
              </button>
              {availableClasses.map(className => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Laen tulemusi...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-400 mb-2">❌ Viga tulemuste laadimisel</div>
                <p className="text-slate-400 text-sm">{error.message}</p>
              </div>
            ) : !results || results.participants.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-slate-400 text-lg mb-2">📊</div>
                <p className="text-slate-400">Tulemusi ei leitud</p>
              </div>
            ) : (
              <div className="p-6">
                
                {/* DETAILED CHAMPIONSHIP RESULTS TABLE - WITHOUT ETAPID COLUMN */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-600">
                    <h3 className="text-lg font-semibold text-white">Koondtulemused klassiti</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          {/* Sticky columns for participant info */}
                          <th className="sticky left-0 z-10 bg-slate-700/50 px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase border-r border-slate-600">
                            Koht
                          </th>
                          <th className="sticky left-[60px] z-10 bg-slate-700/50 px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase border-r border-slate-600 min-w-[160px]">
                            Osaleja
                          </th>
                          <th className="sticky left-[220px] z-10 bg-slate-700/50 px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase border-r border-slate-600 min-w-[100px]">
                            Klass
                          </th>
                          {/* Individual etapp columns - MORE SPACE NOW */}
                          {sortedRallies.map((rally, index) => (
                            <th key={rally.rally_id} className="px-2 py-2 text-center text-xs font-medium text-slate-300 uppercase min-w-[60px]">
                              E{index + 1}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-center text-xs font-medium text-slate-300 uppercase">
                            Punktid
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {(() => {
                          // Filter participants by selected class
                          const filteredParticipants = selectedClass === 'all' 
                            ? results.participants 
                            : results.participants.filter(p => p.class_name === selectedClass)

                          if (selectedClass === 'all') {
                            // Show all classes separated
                            const participantsByClass = filteredParticipants.reduce((acc, participant) => {
                              const className = participant.class_name
                              if (!acc[className]) {
                                acc[className] = []
                              }
                              acc[className].push(participant)
                              return acc
                            }, {} as Record<string, typeof results.participants>)

                            const rows: JSX.Element[] = []
                            
                            // Sort classes alphabetically
                            Object.keys(participantsByClass)
                              .sort((a, b) => a.localeCompare(b))
                              .forEach((className) => {
                                // Add class header row
                                rows.push(
                                  <tr key={`class-header-${className}`} className="bg-slate-600/50">
                                    <td colSpan={4 + sortedRallies.length} className="px-3 py-2 sticky left-0 z-10 bg-slate-600/50">
                                      <div className="font-bold text-white text-base">
                                        🏆 {className}
                                      </div>
                                    </td>
                                  </tr>
                                )

                                // Sort participants by championship position
                                const sortedParticipants = participantsByClass[className].sort((a, b) => {
                                  const posA = a.championship_position || 999
                                  const posB = b.championship_position || 999
                                  if (posA !== posB) return posA - posB
                                  if (a.total_points !== b.total_points) return b.total_points - a.total_points
                                  return b.rounds_participated - a.rounds_participated
                                })

                                // Add participants for this class with alternating row colors
                                sortedParticipants.forEach((participant, index) => {
                                  const isEven = index % 2 === 0
                                  rows.push(
                                    <tr 
                                      key={`${participant.participant_name}-${participant.class_name}`} 
                                      className={`hover:bg-slate-700/30 transition-colors ${
                                        isEven ? 'bg-slate-800/20' : 'bg-slate-700/20'
                                      }`}
                                    >
                                      {/* Position - Sticky */}
                                      <td className="sticky left-0 z-10 bg-slate-800/20 px-3 py-1.5 border-r border-slate-600">
                                        <div className="flex items-center justify-center">
                                          <span className="text-lg">
                                            {participant.championship_position === 1 && '🥇'}
                                            {participant.championship_position === 2 && '🥈'}
                                            {participant.championship_position === 3 && '🥉'}
                                            {participant.championship_position > 3 && (
                                              <span className="text-white font-bold">
                                                {participant.championship_position}.
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      </td>
                                      
                                      {/* Participant Name - Sticky */}
                                      <td className="sticky left-[60px] z-10 bg-slate-800/20 px-3 py-1.5 border-r border-slate-600">
                                        <span className="text-white font-medium">{participant.participant_name}</span>
                                      </td>
                                      
                                      {/* Class - Sticky */}
                                      <td className="sticky left-[220px] z-10 bg-slate-800/20 px-3 py-1.5 text-slate-300 text-sm border-r border-slate-600">
                                        {participant.class_name}
                                      </td>
                                      
                                      {/* Individual Rally Scores - NO ETAPID COLUMN ANYMORE */}
                                      {sortedRallies.map((rally) => {
                                        const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                                        return (
                                          <td key={rally.rally_id} className="px-2 py-1.5 text-center">
                                            {rallyScore?.participated ? (
                                              <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{rallyScore.points}</span>
                                                {rallyScore.class_position && (
                                                  <span className="text-xs text-slate-400">{rallyScore.class_position}.</span>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-slate-500">-</span>
                                            )}
                                          </td>
                                        )
                                      })}
                                      
                                      {/* Total Points */}
                                      <td className="px-3 py-1.5 text-center">
                                        <span className="text-white font-bold text-base">{participant.total_points}</span>
                                      </td>
                                    </tr>
                                  )
                                })
                              })

                            return rows
                          } else {
                            // Show single class
                            const sortedParticipants = filteredParticipants.sort((a, b) => {
                              const posA = a.championship_position || 999
                              const posB = b.championship_position || 999
                              if (posA !== posB) return posA - posB
                              if (a.total_points !== b.total_points) return b.total_points - a.total_points
                              return b.rounds_participated - a.rounds_participated
                            })

                            return sortedParticipants.map((participant, index) => {
                              const isEven = index % 2 === 0
                              return (
                                <tr 
                                  key={`${participant.participant_name}-${participant.class_name}`} 
                                  className={`hover:bg-slate-700/30 transition-colors ${
                                    isEven ? 'bg-slate-800/20' : 'bg-slate-700/20'
                                  }`}
                                >
                                  {/* Position - Sticky */}
                                  <td className="sticky left-0 z-10 bg-slate-800/20 px-3 py-1.5 border-r border-slate-600">
                                    <div className="flex items-center justify-center">
                                      <span className="text-lg">
                                        {participant.championship_position === 1 && '🥇'}
                                        {participant.championship_position === 2 && '🥈'}
                                        {participant.championship_position === 3 && '🥉'}
                                        {participant.championship_position > 3 && (
                                          <span className="text-white font-bold">
                                            {participant.championship_position}.
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  
                                  {/* Participant Name - Sticky */}
                                  <td className="sticky left-[60px] z-10 bg-slate-800/20 px-3 py-1.5 border-r border-slate-600">
                                    <span className="text-white font-medium">{participant.participant_name}</span>
                                  </td>
                                  
                                  {/* Class - Sticky */}
                                  <td className="sticky left-[220px] z-10 bg-slate-800/20 px-3 py-1.5 text-slate-300 text-sm border-r border-slate-600">
                                    {participant.class_name}
                                  </td>
                                  
                                  {/* Individual Rally Scores - NO ETAPID COLUMN */}
                                  {sortedRallies.map((rally) => {
                                    const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                                    return (
                                      <td key={rally.rally_id} className="px-2 py-1.5 text-center">
                                        {rallyScore?.participated ? (
                                          <div className="flex flex-col">
                                            <span className="text-white font-medium text-sm">{rallyScore.points}</span>
                                            {rallyScore.class_position && (
                                              <span className="text-xs text-slate-400">{rallyScore.class_position}.</span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-slate-500">-</span>
                                        )}
                                      </td>
                                    )
                                  })}
                                  
                                  {/* Total Points */}
                                  <td className="px-3 py-1.5 text-center">
                                    <span className="text-white font-bold text-base">{participant.total_points}</span>
                                  </td>
                                </tr>
                              )
                            })
                          }
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}