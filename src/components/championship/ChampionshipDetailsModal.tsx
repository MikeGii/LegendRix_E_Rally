// src/components/championship/ChampionshipDetailsModal.tsx - FIXED: Updated for new 3-point system
'use client'

import { useState, useEffect } from 'react'
import { useChampionshipResults, ChampionshipParticipant } from '@/hooks/useChampionshipResults'
import { useCompleteChampionship, useReopenChampionship } from '@/hooks/useChampionshipManagement'

interface ChampionshipDetailsModalProps {
  championshipId: string
  onClose: () => void
  onSuccess: () => void
}

export function ChampionshipDetailsModal({ championshipId, onClose, onSuccess }: ChampionshipDetailsModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  
  const { data: results, isLoading, error, refetch } = useChampionshipResults(championshipId)
  const completeChampionshipMutation = useCompleteChampionship()
  const reopenChampionshipMutation = useReopenChampionship()

  // Auto-refresh every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  if (!results) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCompleteChampionship = async () => {
    if (window.confirm(`Kas olete kindel, et soovite meistrivõistluse "${results.championship_name}" lõpetatuks märkida?`)) {
      try {
        await completeChampionshipMutation.mutateAsync(championshipId)
        setShowCompleted(true)
        refetch()
      } catch (error) {
        console.error('Error completing championship:', error)
        alert('Viga meistrivõistluse lõpetamisel')
      }
    }
  }

  const handleReopenChampionship = async () => {
    if (window.confirm(`Kas olete kindel, et soovite meistrivõistluse "${results.championship_name}" uuesti avada?`)) {
      try {
        await reopenChampionshipMutation.mutateAsync(championshipId)
        setShowCompleted(false)
        refetch()
      } catch (error) {
        console.error('Error reopening championship:', error)
        alert('Viga meistrivõistluse taasavamisel')
      }
    }
  }

  // Get unique classes
  const availableClasses = Array.from(
    new Set(results.participants?.map(p => p.class_name) || [])
  ).sort()

  // Get sorted rally data for headers
  const sortedRallies = results.participants?.[0]?.rally_scores
    ?.map(rs => ({
      rally_id: rs.rally_id,
      rally_name: rs.rally_name,
      etapp_number: rs.etapp_number,
      competition_date: rs.competition_date
    }))
    .sort((a, b) => (a.etapp_number || 0) - (b.etapp_number || 0)) || []

  // Filter participants by class
  const filteredParticipants = selectedClass === 'all' 
    ? results.participants || []
    : (results.participants || []).filter(p => p.class_name === selectedClass)

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="text-white">Laadin andmeid...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="text-red-400">Viga andmete laadimisel</div>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-600 rounded">
            Sulge
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={handleBackdropClick}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{results.championship_name}</h2>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>📊 {results.participants?.length || 0} osalejat</span>
                  <span>🏁 {results.total_rounds} etappi</span>
                  <span>🔗 {results.linked_participants} registreeritud</span>
                  <span>📝 {results.unlinked_participants} käsitsi lisatud</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!showCompleted ? (
                <button
                  onClick={handleCompleteChampionship}
                  disabled={completeChampionshipMutation.isPending}
                  className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                >
                  {completeChampionshipMutation.isPending ? 'Lõpetan...' : '🏁 Märgi lõpetatuks'}
                </button>
              ) : (
                <button
                  onClick={handleReopenChampionship}
                  disabled={reopenChampionshipMutation.isPending}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                >
                  {reopenChampionshipMutation.isPending ? 'Avan...' : '🔄 Ava uuesti'}
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 font-medium">Klass:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedClass('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedClass === 'all'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  Kõik klassid ({filteredParticipants.length})
                </button>
                {availableClasses.map(className => {
                  const classCount = (results.participants || []).filter(p => p.class_name === className).length
                  return (
                    <button
                      key={className}
                      onClick={() => setSelectedClass(className)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedClass === className
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                      }`}
                    >
                      {className} ({classCount})
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-800/90 backdrop-blur">
                    <tr className="border-b border-slate-700">
                      <th className="sticky left-0 z-20 bg-slate-800/90 px-3 py-3 text-left font-medium text-slate-300 border-r border-slate-600">
                        Koht
                      </th>
                      <th className="sticky left-[60px] z-20 bg-slate-800/90 px-3 py-3 text-left font-medium text-slate-300 border-r border-slate-600">
                        Osaleja
                      </th>
                      {selectedClass === 'all' && (
                        <th className="sticky left-[220px] z-20 bg-slate-800/90 px-3 py-3 text-left font-medium text-slate-300 border-r border-slate-600">
                          Klass
                        </th>
                      )}
                      
                      {/* Rally Headers */}
                      {sortedRallies.map((rally) => (
                        <th key={rally.rally_id} className="px-2 py-3 text-center font-medium text-slate-300 min-w-[80px]">
                          <div className="flex flex-col">
                            <span className="text-xs">Etapp {rally.etapp_number}</span>
                            <span className="text-xs text-slate-400 truncate max-w-[70px]">{rally.rally_name}</span>
                          </div>
                        </th>
                      ))}
                      
                      {/* Points Columns */}
                      <th className="px-3 py-3 text-center font-medium text-slate-300 bg-green-500/10">
                        Rally Punktid
                      </th>
                      <th className="px-3 py-3 text-center font-medium text-slate-300 bg-orange-500/10">
                        Lisa Punktid
                      </th>
                      <th className="px-3 py-3 text-center font-medium text-slate-300 bg-blue-500/10">
                        Kokku Punktid
                      </th>
                      <th className="px-3 py-3 text-center font-medium text-slate-300">
                        Etappe
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      if (selectedClass === 'all') {
                        // Group by class and show all
                        const groupedByClass = new Map<string, ChampionshipParticipant[]>()
                        filteredParticipants.forEach(participant => {
                          if (!groupedByClass.has(participant.class_name)) {
                            groupedByClass.set(participant.class_name, [])
                          }
                          groupedByClass.get(participant.class_name)!.push(participant)
                        })

                        const rows: JSX.Element[] = []
                        
                        Array.from(groupedByClass.entries())
                          .sort(([a], [b]) => a.localeCompare(b))
                          .forEach(([className, classParticipants]) => {
                            // Sort participants within class
                            const sortedParticipants = classParticipants.sort((a, b) => {
                              const posA = a.championship_position || 999
                              const posB = b.championship_position || 999
                              if (posA !== posB) return posA - posB
                              if (a.total_overall_points !== b.total_overall_points) return b.total_overall_points - a.total_overall_points
                              return b.rounds_participated - a.rounds_participated
                            })

                            sortedParticipants.forEach((participant, index) => {
                              const isEven = rows.length % 2 === 0
                              rows.push(
                                <tr 
                                  key={`${participant.participant_name}-${participant.class_name}`}
                                  className={`hover:bg-slate-700/30 transition-colors ${
                                    isEven ? 'bg-slate-800/20' : 'bg-slate-700/20'
                                  }`}
                                >
                                  {/* Position */}
                                  <td className="sticky left-0 z-10 bg-slate-800/20 px-3 py-2 border-r border-slate-600">
                                    <div className="flex items-center justify-center">
                                      {participant.championship_position === 1 && '🥇'}
                                      {participant.championship_position === 2 && '🥈'}
                                      {participant.championship_position === 3 && '🥉'}
                                      {participant.championship_position > 3 && (
                                        <span className="text-white font-bold">
                                          {participant.championship_position}.
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  
                                  {/* Name */}
                                  <td className="sticky left-[60px] z-10 bg-slate-800/20 px-3 py-2 border-r border-slate-600">
                                    <span className="text-white font-medium">{participant.participant_name}</span>
                                  </td>
                                  
                                  {/* Class */}
                                  <td className="sticky left-[220px] z-10 bg-slate-800/20 px-3 py-2 text-slate-300 text-sm border-r border-slate-600">
                                    {participant.class_name}
                                  </td>
                                  
                                  {/* Rally Scores */}
                                  {sortedRallies.map((rally) => {
                                    const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                                    return (
                                      <td key={rally.rally_id} className="px-2 py-2 text-center">
                                        {rallyScore?.participated ? (
                                          <div className="flex flex-col">
                                            <span className="text-white font-medium text-sm">{rallyScore.overall_points}</span>
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
                                  
                                  {/* Points Columns */}
                                  <td className="px-3 py-2 text-center bg-green-500/5">
                                    <span className="text-green-400 font-medium">{participant.total_rally_points}</span>
                                  </td>
                                  <td className="px-3 py-2 text-center bg-orange-500/5">
                                    <span className="text-orange-400 font-medium">{participant.total_extra_points}</span>
                                  </td>
                                  <td className="px-3 py-2 text-center bg-blue-500/5">
                                    <span className="text-blue-400 font-bold text-lg">{participant.total_overall_points}</span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className="text-slate-300">{participant.rounds_participated}</span>
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
                          if (a.total_overall_points !== b.total_overall_points) return b.total_overall_points - a.total_overall_points
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
                              {/* Position */}
                              <td className="sticky left-0 z-10 bg-slate-800/20 px-3 py-2 border-r border-slate-600">
                                <div className="flex items-center justify-center">
                                  {participant.championship_position === 1 && '🥇'}
                                  {participant.championship_position === 2 && '🥈'}
                                  {participant.championship_position === 3 && '🥉'}
                                  {participant.championship_position > 3 && (
                                    <span className="text-white font-bold">
                                      {participant.championship_position}.
                                    </span>
                                  )}
                                </div>
                              </td>
                              
                              {/* Name */}
                              <td className="sticky left-[60px] z-10 bg-slate-800/20 px-3 py-2 border-r border-slate-600">
                                <span className="text-white font-medium">{participant.participant_name}</span>
                              </td>
                              
                              {/* Rally Scores */}
                              {sortedRallies.map((rally) => {
                                const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                                return (
                                  <td key={rally.rally_id} className="px-2 py-2 text-center">
                                    {rallyScore?.participated ? (
                                      <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm">{rallyScore.overall_points}</span>
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
                              
                              {/* Points Columns */}
                              <td className="px-3 py-2 text-center bg-green-500/5">
                                <span className="text-green-400 font-medium">{participant.total_rally_points}</span>
                              </td>
                              <td className="px-3 py-2 text-center bg-orange-500/5">
                                <span className="text-orange-400 font-medium">{participant.total_extra_points}</span>
                              </td>
                              <td className="px-3 py-2 text-center bg-blue-500/5">
                                <span className="text-blue-400 font-bold text-lg">{participant.total_overall_points}</span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="text-slate-300">{participant.rounds_participated}</span>
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

          {/* Footer with Warnings */}
          {results.warnings && results.warnings.length > 0 && (
            <div className="p-6 border-t border-slate-700">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2">⚠️ Hoiatused:</h4>
                <ul className="text-yellow-200 text-sm space-y-1">
                  {results.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}