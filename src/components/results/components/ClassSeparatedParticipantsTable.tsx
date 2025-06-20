// src/components/results/components/ClassSeparatedParticipantsTable.tsx
// FINAL FIX: Correct sorting - participants first, non-participants last without positions

'use client'

import React from 'react'
import { getParticipantStatus } from '../utils/classBasedCalculations'

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
  
  // Group participants by class with FIXED SORTING
  const participantsByClass = React.useMemo(() => {
    const grouped: Record<string, any[]> = {}
    
    participants.forEach(participant => {
      const className = participant.class_name || 'Teadmata klass'
      if (!grouped[className]) {
        grouped[className] = []
      }
      grouped[className].push(participant)
    })

    // FIXED SORTING: Participants first (by position/points), then non-participants (alphabetical)
    Object.keys(grouped).forEach(className => {
      grouped[className].sort((a, b) => {
        const aResult = results[a.id]
        const bResult = results[b.id]
        
        // CRITICAL: Separate participants from non-participants
        const aParticipated = aResult?.participated
        const bParticipated = bResult?.participated
        
        // 1. Participants always come before non-participants
        if (aParticipated && !bParticipated) return -1
        if (!aParticipated && bParticipated) return 1
        
        if (aParticipated && bParticipated) {
          // Both participated - sort by class position, then points, then name
          if (aResult?.classPosition && bResult?.classPosition) {
            return aResult.classPosition - bResult.classPosition
          }
          if (aResult?.classPosition && !bResult?.classPosition) return -1
          if (!aResult?.classPosition && bResult?.classPosition) return 1
          
          // Sort by points if no positions
          if (aResult?.totalPoints && bResult?.totalPoints) {
            return bResult.totalPoints - aResult.totalPoints
          }
          if (aResult?.totalPoints && !bResult?.totalPoints) return -1
          if (!aResult?.totalPoints && bResult?.totalPoints) return 1
          
          // Fallback to name
          return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
        }
        
        if (!aParticipated && !bParticipated) {
          // Both didn't participate - sort alphabetically
          return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
        }
        
        // Fallback
        return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
      })
    })

    return grouped
  }, [participants, results])

  // Handle participation checkbox change
  const handleParticipationChange = (participantId: string, participated: boolean) => {
    onUpdateResult(participantId, 'participated', participated)
    
    // If unchecking participation, clear positions and points
    if (!participated) {
      onUpdateResult(participantId, 'totalPoints', null)
      onUpdateResult(participantId, 'overallPosition', null)
      onUpdateResult(participantId, 'classPosition', null)
    }
  }

  // Calculate participation stats for display
  const getParticipationStats = () => {
    const total = participants.length
    const participated = Object.values(results).filter((r: any) => r.participated).length
    const withPoints = Object.values(results).filter((r: any) => r.participated && r.totalPoints !== null && r.totalPoints > 0).length
    
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
          withPoints: classParticipants.filter(p => results[p.id]?.participated && results[p.id]?.totalPoints > 0).length
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
                        {classStats.participated}/{classStats.total} osales{classStats.withPoints > 0 ? 
                          `, ${classStats.withPoints} punktidega` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Participants Table */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-center py-4 px-4 text-slate-400 font-medium text-sm">
                        Koht
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                        Osaleja
                      </th>
                      <th className="text-center py-4 px-4 text-slate-400 font-medium text-sm">
                        Osales
                      </th>
                      <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                        Punktid
                      </th>
                      <th className="text-center py-4 px-6 text-slate-400 font-medium text-sm">
                        Olek
                      </th>
                      {editMode && onRemoveParticipant && (
                        <th className="text-center py-4 px-6 text-slate-400 font-medium text-sm">
                          Toimingud
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {classParticipants.map((participant, index) => {
                      const result = results[participant.id] || {
                        participantId: participant.id,
                        playerName: participant.player_name || participant.user_name || 'Tundmatu',
                        className: participant.class_name || 'Tundmata klass',
                        overallPosition: null,
                        classPosition: null,
                        totalPoints: null,
                        participated: false,
                        eventResults: {},
                        isModified: false
                      }

                      const isManual = participant.user_id === 'manual-participant'
                      const status = getParticipantStatus(result.participated, result.totalPoints)

                      return (
                        <tr 
                          key={participant.id} 
                          className={`border-b border-slate-700/30 hover:bg-slate-800/20 transition-all duration-200 ${
                            result.isModified ? 'bg-blue-900/10 border-blue-500/30' : ''
                          }`}
                        >
                          {/* Position - FIXED: Only show for participants */}
                          <td className="py-4 px-4 text-center">
                            {result.participated && result.classPosition ? (
                              <span className={`font-bold text-lg ${
                                result.classPosition === 1 ? 'text-yellow-400' :
                                result.classPosition === 2 ? 'text-slate-300' :
                                result.classPosition === 3 ? 'text-orange-400' :
                                'text-white'
                              }`}>
                                {result.classPosition}.
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          {/* Participant Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-white ${
                                result.participated && result.classPosition === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                result.participated && result.classPosition === 2 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                result.participated && result.classPosition === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
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

                          {/* Participation Checkbox */}
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

                          {/* Total Points */}
                          <td className="py-4 px-6 text-right">
                            {editMode ? (
                              <input
                                type="number"
                                value={result.totalPoints || ''}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? null : parseFloat(e.target.value)
                                  onUpdateResult(participant.id, 'totalPoints', value)
                                }}
                                disabled={!result.participated}
                                className={`w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  !result.participated ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                placeholder="0.0"
                                step="0.1"
                                min="0"
                              />
                            ) : (
                              <span className={`font-bold text-lg ${
                                result.participated && result.classPosition === 1 ? 'text-yellow-400' :
                                result.participated && result.classPosition === 2 ? 'text-slate-300' :
                                result.participated && result.classPosition === 3 ? 'text-orange-400' :
                                'text-white'
                              }`}>
                                {result.participated ? (result.totalPoints?.toFixed(1) || '0.0') : '—'}
                              </span>
                            )}
                          </td>

                          {/* Status - IMPROVED with participation awareness */}
                          <td className="py-4 px-6 text-center">
                            {status === 'Sisestatud' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                Sisestatud
                              </span>
                            ) : status === 'Ei osale' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                Ei osale
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Ootel
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          {editMode && onRemoveParticipant && (
                            <td className="py-4 px-6 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => onRemoveParticipant(participant.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Eemalda osaleja"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Class Summary */}
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