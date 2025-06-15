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
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          <span className="text-lg">➕</span>
          Lisa esimene osaleja
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-center py-4 px-4 text-slate-400 font-medium">
                Koht
              </th>
              <th className="text-center py-4 px-4 text-slate-400 font-medium">
                Koht klassis
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">
                Osaleja
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">
                Klass
              </th>
              <th className="text-right py-4 px-6 text-slate-400 font-medium">
                Punktid
              </th>
              <th className="text-center py-4 px-6 text-slate-400 font-medium">
                Olek
              </th>
              {editMode && (
                <th className="text-center py-4 px-6 text-slate-400 font-medium">
                  Toimingud
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => {
              const result = results[participant.id] || {
                participantId: participant.id,
                playerName: participant.player_name || participant.user_name || 'Unknown',
                className: participant.class_name || 'Unknown Class',
                overallPosition: null,
                classPosition: null,
                totalPoints: null,
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
                  {/* Overall Position */}
                  <td className="py-4 px-4 text-center">
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
                      <span className={`font-medium ${
                        result.overallPosition === 1 ? 'text-yellow-400' :
                        result.overallPosition === 2 ? 'text-slate-300' :
                        result.overallPosition === 3 ? 'text-orange-400' :
                        'text-white'
                      }`}>
                        {result.overallPosition || '—'}
                      </span>
                    )}
                  </td>

                  {/* Class Position */}
                  <td className="py-4 px-4 text-center">
                    {editMode ? (
                      <input
                        type="number"
                        min="1"
                        value={result.classPosition || ''}
                        onChange={(e) => onUpdateResult(participant.id, 'classPosition', parseInt(e.target.value) || null)}
                        className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        placeholder="—"
                      />
                    ) : (
                      <span className={`font-medium ${
                        result.classPosition === 1 ? 'text-green-400' :
                        result.classPosition === 2 ? 'text-blue-400' :
                        result.classPosition === 3 ? 'text-purple-400' :
                        'text-slate-300'
                      }`}>
                        {result.classPosition || '—'}
                      </span>
                    )}
                  </td>

                  {/* Player Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        result.overallPosition === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        result.overallPosition === 2 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                        result.overallPosition === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        'bg-slate-700'
                      }`}>
                        {result.playerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {result.playerName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {isManual ? 'Käsitsi lisatud' : 'Registreeritud'}
                          {isModified && <span className="text-blue-400 ml-2">• Muudetud</span>}
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
                      <span className={`font-medium text-lg ${
                        result.overallPosition === 1 ? 'text-yellow-400' :
                        result.overallPosition === 2 ? 'text-slate-300' :
                        result.overallPosition === 3 ? 'text-orange-400' :
                        'text-white'
                      }`}>
                        {result.totalPoints?.toFixed(1) || '0.0'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 text-center">
                    {participant.results_entered ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        ✓ Sisestatud
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        ⏳ Ootel
                      </span>
                    )}
                  </td>

                  {/* Actions (Edit Mode Only) */}
                  {editMode && (
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        {/* Clear Results Button */}
                        <button
                          onClick={() => onClearResults(participant.id)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
                          title="Nulli tulemused"
                        >
                          <span className="text-sm">🗑️</span>
                        </button>

                        {/* Remove Participant Button */}
                        <button
                          onClick={() => onRemoveParticipant(participant)}
                          disabled={isRemoving}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Eemalda osaleja"
                        >
                          <span className="text-sm">❌</span>
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

      {/* Summary Footer */}
      <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Kokku osalejaid: <span className="text-white font-medium">{participants.length}</span></span>
          <span>Tulemustega: <span className="text-green-400 font-medium">
            {participants.filter(p => p.results_entered).length}
          </span></span>
          <span>Ootel: <span className="text-yellow-400 font-medium">
            {participants.filter(p => !p.results_entered).length}
          </span></span>
          {editMode && (
            <span>Muudetud: <span className="text-blue-400 font-medium">
              {Object.values(results).filter(r => r.isModified).length}
            </span></span>
          )}
        </div>
      </div>
    </div>
  )
}