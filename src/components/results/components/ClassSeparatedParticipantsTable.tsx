// src/components/results/components/ClassSeparatedParticipantsTable.tsx - SIMPLIFIED: Removed participated logic, added delete buttons
'use client'

import _ from 'lodash'
import type { ParticipantResult } from '../hooks/useResultsState'
import { Trash2 } from 'lucide-react'

interface ClassSeparatedParticipantsTableProps {
  participants: any[]
  results: Record<string, ParticipantResult>
  editMode: boolean
  onUpdateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
  onClearResults: (participantId: string) => void
  onRemoveParticipant: (participant: any) => void
  isRemoving: boolean
}

export function ClassSeparatedParticipantsTable({
  participants,
  results,
  editMode,
  onUpdateResult,
  onClearResults,
  onRemoveParticipant,
  isRemoving
}: ClassSeparatedParticipantsTableProps) {
  // Group participants by class
  const participantsByClass = _.groupBy(participants, 'class_name')

  // Sort participants within each class by class position
  const sortParticipantsInClass = (classParticipants: any[]) => {
    return classParticipants.sort((a, b) => {
      const aResult = results[a.id]
      const bResult = results[b.id]
      
      // Participants with points, sorted by class position (ascending)
      const aHasPoints = aResult?.totalPoints > 0
      const bHasPoints = bResult?.totalPoints > 0
      
      if (aHasPoints && bHasPoints) {
        const aPos = aResult?.classPosition || 999
        const bPos = bResult?.classPosition || 999
        return aPos - bPos
      }
      if (aHasPoints && !bHasPoints) return -1
      if (!aHasPoints && bHasPoints) return 1
      
      // Participants without points, sorted alphabetically
      return (a.player_name || '').localeCompare(b.player_name || '')
    })
  }

  // Calculate stats for each class
  const calculateClassStats = (classParticipants: any[]) => {
    return {
      total: classParticipants.length
    }
  }

  // Calculate overall stats
  const stats = {
    total: participants.length
  }

  if (participants.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
        <div className="text-slate-400 text-lg">Sellel rallil pole veel osalejaid</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Osalejate tulemused</h2>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-slate-400">
              Kokku: <span className="text-white font-medium">{stats.total}</span>
            </div>
          </div>
        </div>
      </div>

      {Object.entries(participantsByClass).map(([className, classParticipants]) => {
        const sortedParticipants = sortParticipantsInClass(classParticipants)
        const classStats = calculateClassStats(classParticipants)

        return (
          <div key={className} className="space-y-4">
            {/* Class Header */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{className.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{className}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Table */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700/50">
                      <th className="text-left p-4 text-slate-300 font-medium">Koht (klass)</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Mängija</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Punktid</th>
                      {editMode && <th className="text-center p-4 text-slate-300 font-medium">Tegevused</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParticipants.map((participant, index) => {
                      const result = results[participant.id]
                      const isManualParticipant = participant.user_id === 'manual-participant'

                      return (
                        <tr 
                          key={participant.id} 
                          className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                        >
                          {/* Class Position */}
                          <td className="p-4">
                            {editMode ? (
                              <input
                                type="number"
                                min="1"
                                value={result?.classPosition || ''}
                                onChange={(e) => onUpdateResult(participant.id, 'classPosition', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="-"
                              />
                            ) : (
                              <span className="text-white font-medium">
                                {result?.classPosition || '-'}
                              </span>
                            )}
                          </td>

                          {/* Player Name */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-white font-medium">{participant.player_name}</span>
                              {isManualParticipant && (
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-md border border-purple-500/30">
                                  Käsitsi lisatud
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Points */}
                          <td className="p-4">
                            {editMode ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={result?.totalPoints || ''}
                                onChange={(e) => onUpdateResult(participant.id, 'totalPoints', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-24 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-white font-medium">
                                {result?.totalPoints || 0}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          {editMode && (
                            <td className="p-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => onClearResults(participant.id)}
                                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-all duration-200 text-sm"
                                  title="Tühjenda tulemused"
                                >
                                  Tühjenda
                                </button>
                                <button
                                  onClick={() => onRemoveParticipant(participant)}
                                  disabled={isRemoving}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                                  title="Eemalda osaleja"
                                >
                                  <Trash2 size={16} />
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
            </div>
          </div>
        )
      })}
    </div>
  )
}