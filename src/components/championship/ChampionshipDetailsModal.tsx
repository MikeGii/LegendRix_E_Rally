// src/components/championship/ChampionshipDetailsModal.tsx - SAME TABLE IMPROVEMENTS AS LANDING PAGE
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
  const [selectedClass, setSelectedClass] = useState<string>('all')

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

  // Get unique classes for filter
  const availableClasses = Array.from(
    new Set(championshipResults?.participants?.map(p => p.class_name) || [])
  ).sort()

  // Get sorted rally data for headers (by etapp_number/date order)
  const sortedRallies = championshipResults?.participants?.[0]?.rally_scores
    ?.sort((a, b) => (a.etapp_number || a.round_number) - (b.etapp_number || b.round_number)) || []

  const handleAddRally = async (rallyId: string) => {
    try {
      const nextRoundNumber = Math.max(0, ...championshipRallies.map(cr => cr.round_number)) + 1
      
      await addRallyMutation.mutateAsync({
        championship_id: championshipId,
        rally_id: rallyId,
        round_number: nextRoundNumber,
        round_name: `${nextRoundNumber}. etapp`
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
        await removeRallyMutation.mutateAsync({ championship_id: championshipId, rally_id: rallyId })
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
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-white">Meistrivõistlust ei leitud</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Sulge
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  🏆 {championship.name}
                </h2>
                <p className="text-slate-400">
                  {championship.season_year} hooaeg • {championship.game_name}
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

            {/* Tab Navigation */}
            <div className="flex space-x-8 mt-6">
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
                Tulemused ({championshipResults?.participants?.length || 0})
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

                {/* Championship Rallies List */}
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                            Etapp
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                            Ralli nimi
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                            Kuupäev
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                            Osalejaid
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                            Staatus
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                            Tegevused
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {championshipRallies.map((rally, index) => (
                          <tr key={rally.rally_id} className={`hover:bg-slate-700/20 ${
                            index % 2 === 0 ? 'bg-slate-800/10' : ''
                          }`}>
                            <td className="px-4 py-3">
                              <span className="text-blue-400 font-medium">
                                {rally.etapp_number || rally.display_round_number || (index + 1)}. etapp
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-white font-medium">{rally.rally_name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-slate-300">{formatDate(rally.rally_date || '')}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-slate-300">-</span>
                            </td>
                            <td className="px-4 py-3 text-center">
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

            {/* RESULTS TAB - SAME AS LANDING PAGE TABLE */}
            {activeTab === 'results' && championshipResults && (
              <div>
                {/* Class Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedClass('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedClass === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    Kõik klassid ({championshipResults?.participants?.length || 0})
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
                      {className} ({championshipResults?.participants?.filter(p => p.class_name === className)?.length || 0})
                    </button>
                  ))}
                </div>

                {/* CHAMPIONSHIP RESULTS TABLE - EXACTLY SAME AS LANDING PAGE */}
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
                          {/* Individual etapp columns - COMPACT HEADERS */}
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
                            ? championshipResults.participants 
                            : championshipResults.participants.filter(p => p.class_name === selectedClass)

                          if (selectedClass === 'all') {
                            // Show all classes separated
                            const participantsByClass = filteredParticipants.reduce((acc, participant) => {
                              const className = participant.class_name
                              if (!acc[className]) {
                                acc[className] = []
                              }
                              acc[className].push(participant)
                              return acc
                            }, {} as Record<string, typeof championshipResults.participants>)

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
                                      
                                      {/* Individual Rally Scores */}
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
                                  
                                  {/* Individual Rally Scores */}
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