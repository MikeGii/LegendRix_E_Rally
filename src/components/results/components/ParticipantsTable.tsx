// src/components/results/components/ParticipantsTable.tsx - FIXED: Removed isModified references
'use client'

import type { ParticipantResult } from '../hooks/useResultsState'
import { Trash2 } from 'lucide-react'

interface ParticipantsTableProps {
  participants: any[]
  results: Record<string, ParticipantResult>
  editMode: boolean
  isRemoving: boolean
  onUpdateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
  onClearResults: (participantId: string) => void
  onRemoveParticipant: (participant: any) => void
  onShowAddParticipant: () => void
}

export function ParticipantsTable({
  participants,
  results,
  editMode,
  isRemoving,
  onUpdateResult,
  onClearResults,
  onRemoveParticipant,
  onShowAddParticipant
}: ParticipantsTableProps) {
  if (participants.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-slate-500">👥</span>
        </div>
        <h4 className="text-lg font-medium text-white mb-2">Osalejaid pole</h4>
        <p className="text-slate-400 mb-4 max-w-md mx-auto">
          Lisa osalejaid käsitsi või oodata, et kasutajad registreeriksid rallile.
        </p>
        {editMode && (
          <button
            onClick={onShowAddParticipant}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-200"
          >
            Lisa esimene osaleja
          </button>
        )}
      </div>
    )
  }

  // Sort participants for display using overall points and extra points tiebreaker
  const sortedParticipants = [...participants].sort((a, b) => {
    const aResult = results[a.id]
    const bResult = results[b.id]
    
    // Participants with overall points, sorted by overall points (descending), then extra points (descending)
    const aHasPoints = aResult?.overallPoints > 0
    const bHasPoints = bResult?.overallPoints > 0
    
    if (aHasPoints && bHasPoints) {
      const overallPointsDiff = (bResult.overallPoints || 0) - (aResult.overallPoints || 0)
      if (overallPointsDiff !== 0) {
        return overallPointsDiff
      }
      // Tiebreaker: extra points (higher is better)
      return (bResult.extraPoints || 0) - (aResult.extraPoints || 0)
    }
    if (aHasPoints && !bHasPoints) return -1
    if (!aHasPoints && bHasPoints) return 1
    
    // Participants without points, sorted alphabetically
    return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
  })

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-300 font-medium">Koht (üldine)</th>
              <th className="text-left p-4 text-slate-300 font-medium">Koht (klass)</th>
              <th className="text-left p-4 text-slate-300 font-medium">Mängija</th>
              <th className="text-left p-4 text-slate-300 font-medium">Klass</th>
              <th className="text-left p-4 text-slate-300 font-medium">Punktid</th>
              <th className="text-left p-4 text-slate-300 font-medium">Lisa punktid</th>
              <th className="text-left p-4 text-slate-300 font-medium">Kokku punktid</th>
              {editMode && <th className="text-center p-4 text-slate-300 font-medium">Tegevused</th>}
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map((participant) => {
              const result = results[participant.id]
              const isManualParticipant = participant.user_id === 'manual-participant'

              return (
                <tr 
                  key={participant.id} 
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  {/* Overall Position */}
                  <td className="p-4">
                    {editMode ? (
                      <input
                        type="number"
                        min="1"
                        value={result?.overallPosition || ''}
                        onChange={(e) => onUpdateResult(participant.id, 'overallPosition', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="-"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {result?.overallPosition || '-'}
                      </span>
                    )}
                  </td>

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
                      <span className="text-slate-300">
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

                  {/* Class */}
                  <td className="p-4">
                    <span className="text-slate-300">{participant.class_name}</span>
                  </td>

                  {/* Standard Points */}
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

                  {/* Extra Points */}
                  <td className="p-4">
                    {editMode ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={result?.extraPoints || ''}
                        onChange={(e) => onUpdateResult(participant.id, 'extraPoints', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-24 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-center focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="0"
                        title="Lisa punktid (nt WRC powerstage punktid)"
                      />
                    ) : (
                      <span className="text-yellow-400 font-medium">
                        {result?.extraPoints || 0}
                      </span>
                    )}
                  </td>

                  {/* Overall Points (Standard + Extra) */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-green-400 font-bold text-lg">
                        {result?.overallPoints || 0}
                      </span>
                      {(result?.totalPoints || 0) > 0 || (result?.extraPoints || 0) > 0 ? (
                        <span className="text-xs text-slate-400">
                          {result?.totalPoints || 0} + {result?.extraPoints || 0}
                        </span>
                      ) : null}
                    </div>
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
  )
}