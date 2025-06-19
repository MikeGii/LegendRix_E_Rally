// src/components/results/components/ClassSeparatedParticipantsTable.tsx
// UPDATED: Added participation checkbox while preserving ALL existing functionality
'use client'

import React from 'react'

// Simple icon components to avoid external dependencies
const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="3,6 5,6 21,6"/>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,2h4a2,2 0 0,1 2,2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="m22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="m16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

interface ClassSeparatedParticipantsTableProps {
  participants: any[]
  results: Record<string, any>
  editMode: boolean
  onUpdateResult: (participantId: string, field: string, value: any) => void
  onRemoveParticipant?: (participantId: string) => void
  onShowAddParticipant?: () => void
}

export function ClassSeparatedParticipantsTable({ 
  participants, 
  results, 
  editMode, 
  onUpdateResult, 
  onRemoveParticipant,
  onShowAddParticipant 
}: ClassSeparatedParticipantsTableProps) {
  
  // Group participants by class
  const participantsByClass = React.useMemo(() => {
    const grouped: Record<string, any[]> = {}
    
    participants.forEach(participant => {
      const className = participant.class_name || 'Teadmata klass'
      if (!grouped[className]) {
        grouped[className] = []
      }
      grouped[className].push(participant)
    })

    // Sort participants within each class by class_position
    Object.keys(grouped).forEach(className => {
      grouped[className].sort((a, b) => {
        const aResult = results[a.id]
        const bResult = results[b.id]
        
        // Sort by class position if both have it
        if (aResult?.classPosition && bResult?.classPosition) {
          return aResult.classPosition - bResult.classPosition
        }
        // Sort by points if no class positions
        if (aResult?.totalPoints && bResult?.totalPoints) {
          return bResult.totalPoints - aResult.totalPoints
        }
        // Default sort by name
        return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
      })
    })

    return grouped
  }, [participants, results])

  // Handle participation checkbox change
  const handleParticipationChange = (participantId: string, participated: boolean) => {
    onUpdateResult(participantId, 'participated', participated)
  }

  // Calculate participation stats for display
  const getParticipationStats = () => {
    const total = participants.length
    const participated = Object.values(results).filter((r: any) => r.participated).length
    const withPoints = Object.values(results).filter((r: any) => r.totalPoints !== null && r.totalPoints > 0).length
    
    return { total, participated, withPoints }
  }

  const stats = getParticipationStats()

  if (participants.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
        <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">Osalejaid pole veel lisatud</p>
        {onShowAddParticipant && (
          <button
            onClick={onShowAddParticipant}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Lisa osaleja
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats with Participation */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            Kokku registreeritud: <span className="text-white font-medium">{stats.total}</span>
          </div>
          <div className="text-slate-400">
            Osales: <span className="text-green-400 font-medium">{stats.participated}</span>
          </div>
          <div className="text-slate-400">
            Punktidega: <span className="text-blue-400 font-medium">{stats.withPoints}</span>
          </div>
        </div>
      </div>

      {Object.entries(participantsByClass).map(([className, classParticipants]) => {
        const classStats = {
          total: classParticipants.length,
          participated: classParticipants.filter(p => results[p.id]?.participated).length,
          withPoints: classParticipants.filter(p => results[p.id]?.totalPoints > 0).length
        }

        return (
          <div key={className} className="space-y-4">
            {/* Class Header with participation stats */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{className.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{className}</h3>
                      <p className="text-slate-300 text-sm">
                        {classStats.participated}/{classStats.total} osales{classStats.withPoints > 0 ? `, ${classStats.withPoints} punktidega` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">Osalejaid: </span>
                    <span className="font-medium text-white">{classParticipants.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Table */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-center py-4 px-4 text-slate-400 font-medium">Koht</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium">Osaleja</th>
                      <th className="text-center py-4 px-4 text-slate-400 font-medium">
                        <div className="flex items-center justify-center space-x-1">
                          <span>Osales</span>
                          <span className="text-xs">✓</span>
                        </div>
                      </th>
                      <th className="text-right py-4 px-6 text-slate-400 font-medium">Punktid</th>
                      <th className="text-center py-4 px-6 text-slate-400 font-medium">Olek</th>
                      {editMode && (
                        <th className="text-center py-4 px-6 text-slate-400 font-medium">Toimingud</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {classParticipants.map((participant, index) => {
                      const result = results[participant.id] || {
                        participantId: participant.id,
                        playerName: participant.player_name || participant.user_name || 'Teadmata',
                        className: participant.class_name || 'Teadmata klass',
                        overallPosition: null,
                        classPosition: null,
                        totalPoints: null,
                        participated: participant.participated || false, // NEW: Load participation status
                        eventResults: {},
                        isModified: false
                      }

                      const isManual = participant.user_id === 'manual-participant'
                      const isModified = result.isModified

                      return (
                        <tr 
                          key={participant.id} 
                          className={`border-b border-slate-700/30 hover:bg-slate-800/20 transition-all duration-200 ${
                            isModified ? 'bg-blue-900/10 border-blue-500/30' : ''
                          }`}
                        >
                          {/* Class Position - UNCHANGED */}
                          <td className="py-4 px-4 text-center">
                            {editMode ? (
                              <input
                                type="number"
                                min="1"
                                value={result.classPosition || ''}
                                onChange={(e) => onUpdateResult(participant.id, 'classPosition', parseInt(e.target.value) || null)}
                                className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="—"
                              />
                            ) : (
                              <span className={`font-bold text-lg ${
                                result.classPosition === 1 ? 'text-yellow-400' :
                                result.classPosition === 2 ? 'text-slate-300' :
                                result.classPosition === 3 ? 'text-orange-400' :
                                'text-white'
                              }`}>
                                {result.classPosition ? `${result.classPosition}.` : '—'}
                              </span>
                            )}
                          </td>

                          {/* Player Name - UNCHANGED */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                result.classPosition === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                result.classPosition === 2 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                result.classPosition === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                'bg-slate-700'
                              }`}>
                                {result.playerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white font-medium">{result.playerName}</div>
                                <div className="text-xs text-slate-400">
                                  {isManual ? 'Käsitsi lisatud' : 'Registreeritud'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* NEW: Participation Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={result.participated || false}
                                  onChange={(e) => handleParticipationChange(participant.id, e.target.checked)}
                                  disabled={!editMode}
                                  className="sr-only"
                                />
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                                  ${result.participated 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'bg-transparent border-slate-500'
                                  }
                                  ${editMode ? 'cursor-pointer hover:border-green-400' : 'cursor-not-allowed opacity-70'}
                                `}>
                                  {result.participated && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </label>
                            </div>
                          </td>

                          {/* Total Points - UNCHANGED */}
                          <td className="py-4 px-6 text-right">
                            {editMode ? (
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={result.totalPoints || ''}
                                onChange={(e) => onUpdateResult(participant.id, 'totalPoints', parseFloat(e.target.value) || null)}
                                className="w-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="0.0"
                              />
                            ) : (
                              <span className={`font-bold text-lg ${
                                result.classPosition === 1 ? 'text-yellow-400' :
                                result.classPosition === 2 ? 'text-slate-300' :
                                result.classPosition === 3 ? 'text-orange-400' :
                                'text-white'
                              }`}>
                                {result.totalPoints?.toFixed(1) || '0.0'}
                              </span>
                            )}
                          </td>

                          {/* Status - UNCHANGED */}
                          <td className="py-4 px-6 text-center">
                            {participant.results_entered ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                Sisestatud
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Ootel
                              </span>
                            )}
                          </td>

                          {/* Actions - UNCHANGED */}
                          {editMode && (
                            <td className="py-4 px-6 text-center">
                              <div className="flex justify-center gap-2">
                                {onRemoveParticipant && (
                                  <button
                                    onClick={() => onRemoveParticipant(participant.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Eemalda osaleja"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Class Summary - UPDATED with participation */}
              <div className="border-t border-slate-700/50 p-4 bg-slate-800/20">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-slate-400">
                    Klass: <span className="text-white font-medium">{className}</span>
                  </div>
                  <div className="text-slate-400">
                    Osalejaid: <span className="text-white font-medium">{classParticipants.length}</span>
                  </div>
                  <div className="text-slate-400">
                    Osales: <span className="text-green-400 font-medium">{classStats.participated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}