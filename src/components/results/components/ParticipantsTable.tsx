// src/components/results/components/ParticipantsTable.tsx
import type { ParticipantResult } from '../hooks/useResultsState'

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
        <button
          onClick={onShowAddParticipant}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <span className="mr-2">➕</span>
          Lisa esimene osaleja
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-900/50">
          <tr>
            <th className="text-left py-4 px-6 text-slate-400 font-medium border-b border-slate-700/50">
              Koht
            </th>
            <th className="text-left py-4 px-6 text-slate-400 font-medium border-b border-slate-700/50">
              Mängija nimi
            </th>
            <th className="text-left py-4 px-6 text-slate-400 font-medium border-b border-slate-700/50">
              Klass
            </th>
            <th className="text-right py-4 px-6 text-slate-400 font-medium border-b border-slate-700/50">
              Punktid
            </th>
            <th className="text-center py-4 px-6 text-slate-400 font-medium border-b border-slate-700/50">
              Staatus
            </th>
            {editMode && (
              <th className="text-center py-4 px-6 text-slate-400 font-medium border-b border-slate-700/50">
                Toimingud
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => {
            const result = results[participant.id]
            const isManual = participant.user_id === 'manual-participant'
            
            if (!result) return null

            return (
              <tr key={participant.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-all duration-200">
                {/* Position */}
                <td className="py-4 px-6">
                  {editMode ? (
                    <input
                      type="number"
                      min="1"
                      value={result.overallPosition || ''}
                      onChange={(e) => onUpdateResult(participant.id, 'overallPosition', parseInt(e.target.value) || null)}
                      className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="—"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {result.overallPosition || '—'}
                    </span>
                  )}
                </td>

                {/* Player Name */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-white font-medium">
                        {result.playerName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {isManual ? 'Käsitsi lisatud' : 'Registreeritud'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Class */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {result.className}
                  </span>
                </td>

                {/* Points */}
                <td className="py-4 px-6 text-right">
                  {editMode ? (
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={result.totalPoints || ''}
                      onChange={(e) => onUpdateResult(participant.id, 'totalPoints', parseFloat(e.target.value) || null)}
                      className="w-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {result.totalPoints?.toFixed(1) || '0.0'}
                    </span>
                  )}
                </td>
                {/* Status */}
                <td className="py-4 px-6 text-center">
                {participant.results_entered ? (  // FIXED: Use participant.results_entered instead of result.overallPosition
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ Valmis
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Ootab
                    </span>
                )}
                </td>
                
                {/* Actions */}
                {editMode && (
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Clear Results Button */}
                      <button
                        onClick={() => onClearResults(participant.id)}
                        className="text-orange-400 hover:text-orange-300 text-sm p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
                        title="Tühjenda tulemused"
                      >
                        🗑️
                      </button>
                      
                      {/* Remove Participant Button */}
                      <button
                        onClick={() => onRemoveParticipant(participant)}
                        disabled={isRemoving}
                        className="text-red-400 hover:text-red-300 text-sm p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title={isManual ? "Eemalda käsitsi lisatud osaleja" : "Eemalda registreeritud osaleja"}
                      >
                        {isRemoving ? '⏳' : '❌'}
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
  )
}