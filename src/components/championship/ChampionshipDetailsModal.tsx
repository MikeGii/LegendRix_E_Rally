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
      // ✅ Use a temporary round_number (will be sorted by date anyway)
      const nextRoundNumber = Math.max(0, ...championshipRallies.map(cr => cr.round_number)) + 1
      
      await addRallyMutation.mutateAsync({
        championship_id: championshipId,
        rally_id: rallyId,
        round_number: nextRoundNumber,
        round_name: `${nextRoundNumber}. etapp` // ✅ Use Estonian terminology
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
    return new Date(dateString).toLocaleDateString('et-EE')
  }

  if (!championship) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{championship.name}</h2>
                <p className="text-slate-400 mt-1">
                  Hooaeg: {championship.season_year} • {championshipRallies.length} etappi
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mt-4">
              <button
                onClick={() => setActiveTab('rallies')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'rallies'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Etapid ({championshipRallies.length})
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Tulemused
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* RALLIES TAB */}
            {activeTab === 'rallies' && (
              <div className="space-y-6">
                
                {/* Add Rally Section */}
                {!showAddRally ? (
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Meistrivõistluse etapid</h3>
                    <button
                      onClick={() => setShowAddRally(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ➕ Lisa etapp
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white">Lisa uus etapp</h4>
                      <button
                        onClick={() => setShowAddRally(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {unusedRallies.length === 0 ? (
                      <p className="text-slate-400">Kõik kinnitatud rallid on juba lisatud.</p>
                    ) : (
                      <div className="space-y-2">
                        {unusedRallies.map(rally => (
                          <div
                            key={rally.id}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-white">{rally.name}</div>
                              <div className="text-sm text-slate-400">
                                {formatDate(rally.competition_date)} • {rally.total_participants} osalejat
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddRally(rally.id)}
                              disabled={addRallyMutation.isPending}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Lisa
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ FIXED: Championship Rallies List - Sorted by Date */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-600">
                    <h3 className="text-lg font-semibold text-white">Etappide nimekiri (kuupäeva järjekorras)</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Etapid on järjestatud võistluse kuupäeva järgi, mitte lisamise järjekorras
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Etapp</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Ralli nimi</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Kuupäev</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Staatus</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase">Tegevused</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {championshipRallies.map((rally) => (
                          <tr key={rally.id} className="hover:bg-slate-700/20">
                            <td className="px-4 py-3">
                              <span className="font-bold text-blue-400">
                                {rally.etapp_number || rally.display_round_number}. etapp
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-white">{rally.rally_name}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {rally.rally_date ? formatDate(rally.rally_date) : 'Pole määratud'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rally.rally_status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : rally.rally_status === 'active'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {rally.rally_status === 'completed' ? 'Lõppenud' :
                                 rally.rally_status === 'active' ? 'Aktiivne' : 'Ootel'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleRemoveRally(rally.rally_id, rally.rally_name)}
                                disabled={removeRallyMutation.isPending}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Eemalda
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* RESULTS TAB */}
            {activeTab === 'results' && championshipResults && (
              <div className="space-y-6">
                
                {/* ✅ FIXED: Championship Results Table - Sorted by Points */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-600">
                    <h3 className="text-lg font-semibold text-white">Koondtulemused klassiti</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Osalejad on järjestatud punkte arvestades, mitte tähestiku järjekorras
                    </p>
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
                            Osalenud etapid
                          </th>
                          {/* ✅ FIXED: Show etapp headers in date order */}
                          {championshipRallies.map((rally) => (
                            <th key={rally.id} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                              {rally.etapp_number || rally.display_round_number}. etapp
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                            Kokku
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {(() => {
                          // ✅ FIXED: Group participants by class and sort by championship position
                          const participantsByClass = championshipResults.participants.reduce((acc, participant) => {
                            const className = participant.class_name
                            if (!acc[className]) {
                              acc[className] = []
                            }
                            acc[className].push(participant)
                            return acc
                          }, {} as Record<string, typeof championshipResults.participants>)

                          const rows: JSX.Element[] = []
                          
                          // ✅ Sort classes alphabetically
                          Object.keys(participantsByClass)
                            .sort((a, b) => a.localeCompare(b))
                            .forEach((className) => {
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

                              // ✅ FIXED: Sort participants by championship_position, NOT alphabetically
                              const sortedParticipants = participantsByClass[className].sort((a, b) => {
                                // Primary: Sort by championship position
                                const posA = a.championship_position || 999
                                const posB = b.championship_position || 999
                                if (posA !== posB) {
                                  return posA - posB
                                }
                                // Secondary: Sort by total points (descending)
                                if (a.total_points !== b.total_points) {
                                  return b.total_points - a.total_points
                                }
                                // Tertiary: Sort by rounds participated
                                return b.rounds_participated - a.rounds_participated
                              })

                              // Add participants for this class
                              sortedParticipants.forEach((result) => {
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
                                    {/* ✅ FIXED: Show rally scores in date order */}
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
                                      <span className="text-white font-bold text-lg">{result.total_points}</span>
                                    </td>
                                  </tr>
                                )
                              })
                            })

                          return rows
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Championship Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{championshipResults.participants.length}</div>
                    <div className="text-blue-300 text-sm">Osalejaid kokku</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{championshipResults.linked_participants}</div>
                    <div className="text-green-300 text-sm">Seotud osalejat</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">{championshipResults.unlinked_participants}</div>
                    <div className="text-orange-300 text-sm">Sidumata osalejat</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{championshipRallies.length}</div>
                    <div className="text-purple-300 text-sm">Etappi kokku</div>
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