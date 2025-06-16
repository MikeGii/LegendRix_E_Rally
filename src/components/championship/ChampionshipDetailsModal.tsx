// src/components/championship/ChampionshipDetailsModal.tsx
'use client'

import { useState } from 'react'
import { 
  useChampionships, 
  useChampionshipRallies, 
  useAddRallyToChampionship, 
  useRemoveRallyFromChampionship
} from '@/hooks/useChampionshipManagement'
import { useChampionshipResults } from '@/hooks/useChampionshipResults'
import { useApprovedRallies } from '@/hooks/useApprovedRallies'

interface ChampionshipDetailsModalProps {
  championshipId: string
  onClose: () => void
  onSuccess: () => void
}

export function ChampionshipDetailsModal({ championshipId, onClose, onSuccess }: ChampionshipDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'rallies' | 'results'>('rallies')
  const [showAddRally, setShowAddRally] = useState(false)

  // Data hooks
  const { data: championships = [] } = useChampionships()
  const { data: championshipRallies = [], refetch: refetchRallies } = useChampionshipRallies(championshipId)
  const { data: championshipResults } = useChampionshipResults(championshipId)
  const { data: availableRallies = [] } = useApprovedRallies()
  
  // Mutations
  const addRallyMutation = useAddRallyToChampionship()
  const removeRallyMutation = useRemoveRallyFromChampionship()

  const championship = championships.find(c => c.id === championshipId)

  // Get rallies not yet in championship
  const usedRallyIds = championshipRallies.map(cr => cr.rally_id)
  const unusedRallies = availableRallies.filter(rally => !usedRallyIds.includes(rally.id))

  const handleAddRally = async (rallyId: string) => {
    try {
      const nextRoundNumber = Math.max(0, ...championshipRallies.map(cr => cr.round_number)) + 1
      
      await addRallyMutation.mutateAsync({
        championship_id: championshipId,
        rally_id: rallyId,
        round_number: nextRoundNumber,
        round_name: `${nextRoundNumber}. ring`
      })
      
      setShowAddRally(false)
      refetchRallies()
      
    } catch (error) {
      console.error('Error adding rally:', error)
      alert('Ralli lisamine ebaõnnestus. Palun proovi uuesti.')
    }
  }

  const handleRemoveRally = async (rallyId: string, rallyName: string) => {
    if (confirm(`Kas oled kindel, et soovid eemaldada ralli "${rallyName}" sellest meistrivõistlusest?`)) {
      try {
        await removeRallyMutation.mutateAsync({
          championship_id: championshipId,
          rally_id: rallyId
        })
        
        refetchRallies()
        
      } catch (error) {
        console.error('Error removing rally:', error)
        alert('Ralli eemaldamine ebaõnnestus. Palun proovi uuesti.')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!championship) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{championship.name}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                <span>🏆 Hooaeg: {championship.season_year}</span>
                <span>🏁 {championshipRallies.length} rallid</span>
                {championship.is_active ? (
                  <span className="text-green-400">✅ Aktiivne</span>
                ) : (
                  <span className="text-orange-400">⏳ Ootab kinnitust</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-6">
            <button
              onClick={() => setActiveTab('rallies')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === 'rallies'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Rallid
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Tulemused
            </button>
          </div>
        </div>

        {/* Rallies Tab */}
        {activeTab === 'rallies' && (
          <div className="p-6">
            {/* Add Rally Button */}
            {!championship.is_active && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAddRally(true)}
                  disabled={unusedRallies.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  ➕ Lisa ralli
                </button>
                {unusedRallies.length === 0 && (
                  <p className="text-slate-400 text-sm mt-2">
                    Kõik saadaolevad rallid on juba lisatud
                  </p>
                )}
              </div>
            )}

            {/* Championship Rallies */}
            {championshipRallies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏁</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Pole rallisid</h3>
                <p className="text-slate-400">Lisa rallid, et luua meistrivõistlus</p>
              </div>
            ) : (
              <div className="space-y-4">
                {championshipRallies.map((championshipRally) => (
                  <div
                    key={championshipRally.id}
                    className="bg-slate-700/30 border border-slate-600 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                            {championshipRally.round_number}. ring
                          </span>
                          <h4 className="font-medium text-white">{championshipRally.rally_name}</h4>
                        </div>
                        <div className="text-sm text-slate-400">
                          📅 {championshipRally.rally_date ? formatDate(championshipRally.rally_date) : 'Kuupäev teadmata'}
                        </div>
                      </div>
                      
                      {!championship.is_active && (
                        <button
                          onClick={() => handleRemoveRally(championshipRally.rally_id, championshipRally.rally_name)}
                          disabled={removeRallyMutation.isPending}
                          className="px-3 py-1 text-sm bg-red-600/20 text-red-400 border border-red-600/30 rounded hover:bg-red-600/30 transition-colors disabled:opacity-50"
                        >
                          Eemalda
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Rally Modal */}
            {showAddRally && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-xl font-bold text-white">Lisa ralli meistrivõistlustesse</h3>
                  </div>
                  
                  <div className="p-6">
                    {unusedRallies.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-400">Kõik saadaolevad rallid on juba lisatud</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unusedRallies.map((rally) => (
                          <div
                            key={rally.id}
                            className="p-4 bg-slate-700/30 border border-slate-600 rounded-xl hover:bg-slate-700/50 cursor-pointer transition-colors"
                            onClick={() => handleAddRally(rally.id)}
                          >
                            <h4 className="font-medium text-white mb-1">{rally.name}</h4>
                            <div className="text-sm text-slate-400">
                              📅 {formatDate(rally.competition_date)} • 
                              🎮 {rally.game_name} • 
                              👥 {rally.total_participants} osalejat
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 border-t border-slate-700/50">
                    <button
                      onClick={() => setShowAddRally(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Sulge
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="p-6">
            {championshipResults ? championshipResults.participants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Pole tulemusi</h3>
                <p className="text-slate-400">
                  {championshipRallies.length === 0 
                    ? 'Lisa esmalt rallid meistrivõistlustesse'
                    : 'Tulemused arvutatakse automaatselt rallide lõppemisel'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Championship Results Summary */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Meistrivõistluse kokkuvõte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{championshipResults.participants.length}</div>
                      <div className="text-sm text-slate-400">Osalejat kokku</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {championshipResults.participants.filter(r => r.rounds_participated > 0).length}
                      </div>
                      <div className="text-sm text-slate-400">Aktiivseid osalejaid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{championshipRallies.length}</div>
                      <div className="text-sm text-slate-400">Rallid kokku</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {Array.from(new Set(championshipResults.participants.map(r => r.class_name))).length}
                      </div>
                      <div className="text-sm text-slate-400">Klassi</div>
                    </div>
                  </div>
                </div>

                {/* Warning for unlinked participants */}
                {championshipResults.participants.some(r => !r.is_linked) && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-orange-400 text-lg">⚠️</span>
                      <div>
                        <h4 className="text-orange-400 font-medium">Hoiatus: Sidumata osalejad</h4>
                        <p className="text-orange-300/80 text-sm mt-1">
                          Mõned osalejad pole veel seotud. Mine "Osalejate sidumine" lehele, et siduda duplikaadid.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Championship Results Table */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-600">
                    <h3 className="text-lg font-semibold text-white">Koondtulemused klassiti</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                            Koht klassis
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                            Osaleja
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                            Klass
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                            Osalenud rallid
                          </th>
                          {championshipRallies.map((rally) => (
                            <th key={rally.id} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                              {rally.round_number}. ring
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                            Kokku
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {(() => {
                          // Group participants by class for display
                          const participantsByClass = championshipResults.participants.reduce((acc, participant) => {
                            const className = participant.class_name
                            if (!acc[className]) {
                              acc[className] = []
                            }
                            acc[className].push(participant)
                            return acc
                          }, {} as Record<string, typeof championshipResults.participants>)

                          const rows: JSX.Element[] = []
                          
                          Object.keys(participantsByClass)
                            .sort((a, b) => a.localeCompare(b))
                            .forEach((className, classIndex) => {
                              // Add class header row
                              rows.push(
                                <tr key={`class-header-${className}`} className="bg-slate-600/50">
                                  <td colSpan={5 + championshipRallies.length} className="px-4 py-3">
                                    <div className="font-bold text-white text-lg">
                                      🏆 {className}
                                    </div>
                                  </td>
                                </tr>
                              )

                              // Add participants for this class
                              participantsByClass[className].forEach((result, participantIndex) => {
                                rows.push(
                                  <tr key={`${result.participant_name}-${result.class_name}`} className="hover:bg-slate-700/20">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center">
                                        <span className="text-2xl">
                                          {result.championship_position === 1 && '🥇'}
                                          {result.championship_position === 2 && '🥈'}
                                          {result.championship_position === 3 && '🥉'}
                                          {result.championship_position > 3 && (
                                            <span className="text-white font-bold text-lg">
                                              {result.championship_position}.
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-white">{result.participant_name}</span>
                                        {!result.is_linked && (
                                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                            Sidumata
                                          </span>
                                        )}
                                        {result.participant_type === 'registered' && (
                                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                            Registreeritud
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300 text-sm">
                                      {result.class_name}
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-300">
                                      {result.rounds_participated}/{championshipRallies.length}
                                    </td>
                                    {championshipRallies.map((rally) => {
                                      const rallyScore = result.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                                      return (
                                        <td key={rally.id} className="px-4 py-3 text-center">
                                          {rallyScore?.participated ? (
                                            <div className="flex flex-col">
                                              <span className="text-white font-medium">{rallyScore.points}</span>
                                              {rallyScore.class_position && (
                                                <span className="text-xs text-slate-400">({rallyScore.class_position}. koht)</span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-slate-500">-</span>
                                          )}
                                        </td>
                                      )
                                    })}
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex flex-col">
                                        <span className={`font-bold text-lg ${
                                          result.championship_position === 1 ? 'text-yellow-400' :
                                          result.championship_position === 2 ? 'text-gray-300' :
                                          result.championship_position === 3 ? 'text-amber-600' :
                                          'text-blue-400'
                                        }`}>
                                          {result.total_points}
                                        </span>
                                        <span className="text-xs text-slate-400">punkti</span>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })

                              // Add spacing between classes (except last one)
                              if (classIndex < Object.keys(participantsByClass).length - 1) {
                                rows.push(
                                  <tr key={`class-spacing-${className}`} className="bg-slate-800/20">
                                    <td colSpan={5 + championshipRallies.length} className="py-2"></td>
                                  </tr>
                                )
                              }
                            })

                          return rows
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-slate-400">Laen tulemusi...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}