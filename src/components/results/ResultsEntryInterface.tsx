// src/components/results/ResultsEntryInterface.tsx - COMPLETE CLEAN VERSION
'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { RallyParticipant, RallyEvent, resultsKeys } from '@/hooks/useResultsManagement'

interface ResultsEntryInterfaceProps {
  rallyId: string
  participants: RallyParticipant[]
  events: RallyEvent[]
  isLoading: boolean
}

interface ParticipantResult {
  participantId: string
  playerName: string
  className: string
  overallPosition: number | null
  totalPoints: number | null
  eventResults: Record<string, number>
}

interface ManualParticipant {
  playerName: string
  className: string
}

interface RallyClass {
  id: string
  class_name: string
}

export function ResultsEntryInterface({ 
  rallyId, 
  participants, 
  events, 
  isLoading 
}: ResultsEntryInterfaceProps) {
  const [results, setResults] = useState<Record<string, ParticipantResult>>({})
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [newParticipant, setNewParticipant] = useState<ManualParticipant>({
    playerName: '',
    className: ''
  })
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()

  // Load rally classes for manual participants
  const { data: rallyClasses = [] } = useQuery({
    queryKey: ['rally-classes', rallyId],
    queryFn: async (): Promise<RallyClass[]> => {
      if (!rallyId) return []
      
      const { data, error } = await supabase
        .from('rally_classes')
        .select(`
          id,
          class:game_classes(name)
        `)
        .eq('rally_id', rallyId)
        .eq('is_active', true)

      if (error) {
        console.error('Error loading rally classes:', error)
        return []
      }

      return (data || []).map((rc: any) => ({
        id: rc.id,
        class_name: rc.class?.name || 'Unknown Class'
      }))
    },
    enabled: !!rallyId
  })

  // Initialize results with participant data
  useEffect(() => {
    const initialResults: Record<string, ParticipantResult> = {}
    
    participants.forEach(participant => {
      initialResults[participant.id] = {
        participantId: participant.id,
        playerName: participant.player_name || participant.user_name,
        className: participant.class_name,
        overallPosition: participant.overall_position,
        totalPoints: participant.total_points,
        eventResults: {}
      }
    })
    
    setResults(initialResults)
  }, [participants])

  // Set default class when rally classes load
  useEffect(() => {
    if (rallyClasses.length > 0 && !newParticipant.className) {
      setNewParticipant(prev => ({
        ...prev,
        className: rallyClasses[0].class_name
      }))
    }
  }, [rallyClasses, newParticipant.className])

  // Add manual participant mutation
  const addManualParticipantMutation = useMutation({
    mutationFn: async (participant: ManualParticipant) => {
      console.log('🔄 Adding manual participant:', participant)
      
      const { data, error } = await supabase
        .from('rally_results')
        .insert({
          rally_id: rallyId,
          user_id: null, // NULL for manual participants
          registration_id: null,
          participant_name: participant.playerName,
          class_name: participant.className,
          overall_position: null,
          total_points: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding manual participant:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      setNewParticipant({ playerName: '', className: rallyClasses[0]?.class_name || '' })
      setShowAddParticipant(false)
    }
  })

  // Save results mutation
    const saveResultsMutation = useMutation({
    mutationFn: async () => {
        console.log('🔄 Saving rally results...')
        
        const updates = Object.values(results).filter(result => 
        result.overallPosition !== null || result.totalPoints !== null
        )

        if (updates.length === 0) {
        throw new Error('Ei ole tulemusi salvestamiseks')
        }

        for (const result of updates) {
        const participant = participants.find(p => p.id === result.participantId)
        if (!participant) continue

        const isManualParticipant = participant.user_id === 'manual-participant'
        
        try {
            if (isManualParticipant) {
            // For manual participants: check if record exists first, then update or insert
            const { data: existing, error: checkError } = await supabase
                .from('rally_results')
                .select('id')
                .eq('rally_id', rallyId)
                .eq('participant_name', result.playerName)
                .is('user_id', null)
                .single()

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError
            }

            if (existing) {
                // Update existing manual participant
                const { error } = await supabase
                .from('rally_results')
                .update({
                    class_name: result.className,
                    overall_position: result.overallPosition,
                    total_points: result.totalPoints,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)

                if (error) {
                console.error('Error updating manual participant result:', result.playerName, error)
                throw error
                }
            } else {
                // Insert new manual participant result
                const { error } = await supabase
                .from('rally_results')
                .insert({
                    rally_id: rallyId,
                    user_id: null,
                    registration_id: null,
                    participant_name: result.playerName,
                    class_name: result.className,
                    overall_position: result.overallPosition,
                    total_points: result.totalPoints,
                    updated_at: new Date().toISOString()
                })

                if (error) {
                console.error('Error inserting manual participant result:', result.playerName, error)
                throw error
                }
            }
            } else {
            // For registered participants: check if record exists first, then update or insert
            const { data: existing, error: checkError } = await supabase
                .from('rally_results')
                .select('id')
                .eq('rally_id', rallyId)
                .eq('user_id', participant.user_id)
                .single()

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError
            }

            if (existing) {
                // Update existing registered participant
                const { error } = await supabase
                .from('rally_results')
                .update({
                    overall_position: result.overallPosition,
                    total_points: result.totalPoints,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)

                if (error) {
                console.error('Error updating registered participant result:', result.playerName, error)
                throw error
                }
            } else {
                // Insert new registered participant result
                const { error } = await supabase
                .from('rally_results')
                .insert({
                    rally_id: rallyId,
                    user_id: participant.user_id,
                    registration_id: participant.id,
                    participant_name: null,
                    class_name: null, // Class comes from registration for registered participants
                    overall_position: result.overallPosition,
                    total_points: result.totalPoints,
                    updated_at: new Date().toISOString()
                })

                if (error) {
                console.error('Error inserting registered participant result:', result.playerName, error)
                throw error
                }
            }
            }
        } catch (error) {
            console.error('Error saving result for:', result.playerName, error)
            throw error
        }
        }

        // Update rally results status
        await supabase
        .from('rally_results_status')
        .upsert({
            rally_id: rallyId,
            results_completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })

        return updates.length
    },
    onSuccess: (count) => {
        queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
        queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
        setEditMode(false)
        console.log(`✅ Saved results for ${count} participants`)
    }
    })

  const updateResult = (participantId: string, field: keyof ParticipantResult, value: any) => {
    setResults(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [field]: value
      }
    }))
  }

  const calculatePositionsFromPoints = () => {
    const resultsArray = Object.values(results)
      .filter(r => r.totalPoints !== null && r.totalPoints > 0)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))

    resultsArray.forEach((result, index) => {
      updateResult(result.participantId, 'overallPosition', index + 1)
    })
  }

  const addManualParticipant = () => {
    if (newParticipant.playerName.trim() && newParticipant.className.trim()) {
      addManualParticipantMutation.mutate(newParticipant)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Tulemuste sisestamine</h3>
            <p className="text-slate-400 text-sm">
              Sisesta osalejate kohad ja punktid.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddParticipant(!showAddParticipant)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">➕</span>
              Lisa osaleja
            </button>
            
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                editMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {editMode ? '✅ Valmis' : '✏️ Muuda'}
            </button>
            
            {editMode && (
              <>
                <button
                  onClick={calculatePositionsFromPoints}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  📊 Arvuta kohad
                </button>
                
                <button
                  onClick={() => saveResultsMutation.mutate()}
                  disabled={saveResultsMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {saveResultsMutation.isPending ? '💾 Salvestab...' : '💾 Salvesta'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Add Manual Participant Form */}
        {showAddParticipant && (
          <div className="border-t border-slate-700/50 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Lisa käsitsi osaleja</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mängijanimi
                </label>
                <input
                  type="text"
                  value={newParticipant.playerName}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, playerName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Sisesta mängijanimi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Klass
                </label>
                <select
                  value={newParticipant.className}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, className: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  {rallyClasses.map(cls => (
                    <option key={cls.id} value={cls.class_name}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={addManualParticipant}
                  disabled={!newParticipant.playerName.trim() || !newParticipant.className.trim() || addManualParticipantMutation.isPending}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {addManualParticipantMutation.isPending ? 'Lisab...' : 'Lisa'}
                </button>
              </div>
            </div>
            
            {rallyClasses.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Rallil pole klasse konfigureeritud. Mine Rally Management lehele ja lisa klassid.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Osalejad ({participants.length})
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Registreeritud kasutajad ja käsitsi lisatud osalejad
              </p>
            </div>
            
            {participants.length > 0 && (
              <div className="text-sm">
                <span className="text-green-400 font-medium">
                  {participants.filter(p => p.results_entered).length}
                </span>
                <span className="text-slate-400"> / </span>
                <span className="text-slate-300">{participants.length}</span>
                <span className="text-slate-400"> tulemust sisestatud</span>
              </div>
            )}
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-slate-500">👥</span>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">Osalejaid pole</h4>
            <p className="text-slate-400 mb-4 max-w-md mx-auto">
              Lisa osalejaid käsitsi või oodata, et kasutajad registreeriksid rallile.
            </p>
            <button
              onClick={() => setShowAddParticipant(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <span className="mr-2">➕</span>
              Lisa esimene osaleja
            </button>
          </div>
        ) : (
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
                {participants
                  .sort((a, b) => {
                    const aResult = results[a.id]
                    const bResult = results[b.id]
                    
                    if (aResult?.overallPosition && bResult?.overallPosition) {
                      return aResult.overallPosition - bResult.overallPosition
                    }
                    if (aResult?.overallPosition && !bResult?.overallPosition) return -1
                    if (!aResult?.overallPosition && bResult?.overallPosition) return 1
                    return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
                  })
                  .map((participant) => {
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
                              value={result.overallPosition || ''}
                              onChange={(e) => updateResult(participant.id, 'overallPosition', parseInt(e.target.value) || null)}
                              className="w-16 px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                              placeholder="0"
                              min="1"
                              step="1"
                            />
                          ) : result.overallPosition ? (
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                result.overallPosition === 1 
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                : result.overallPosition === 2 
                                ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30'
                                : result.overallPosition === 3 
                                ? 'bg-amber-600/20 text-amber-500 border border-amber-600/30'
                                : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                              }`}>
                                {result.overallPosition}
                              </span>
                              {result.overallPosition <= 3 && (
                                <span className="ml-3 text-lg">
                                  {result.overallPosition === 1 ? '🥇' : result.overallPosition === 2 ? '🥈' : '🥉'}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 ml-4">-</span>
                          )}
                        </td>
                        
                        {/* Player Name */}
                        <td className="py-4 px-6">
                          <div className="font-medium text-white font-mono">
                            {result.playerName}
                          </div>
                          {isManual && (
                            <div className="text-xs text-amber-400 mt-1">
                              Käsitsi lisatud
                            </div>
                          )}
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
                              value={result.totalPoints || ''}
                              onChange={(e) => updateResult(participant.id, 'totalPoints', parseInt(e.target.value) || null)}
                              className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-right focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                              placeholder="0"
                              min="0"
                              step="1"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {result.totalPoints || '-'}
                            </span>
                          )}
                        </td>
                        
                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          {result.overallPosition && result.totalPoints ? (
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
                            <button
                              onClick={() => {
                                updateResult(participant.id, 'overallPosition', null)
                                updateResult(participant.id, 'totalPoints', null)
                              }}
                              className="text-red-400 hover:text-red-300 text-sm p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Tühjenda tulemused"
                            >
                              🗑️
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {saveResultsMutation.error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-400 text-lg mr-3">❌</span>
            <div>
              <p className="text-red-400 font-medium">Viga tulemuste salvestamisel</p>
              <p className="text-red-300 text-sm mt-1">{saveResultsMutation.error.message}</p>
            </div>
          </div>
        </div>
      )}

      {saveResultsMutation.isSuccess && !saveResultsMutation.isPending && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-400 text-lg mr-3">✅</span>
            <p className="text-green-400 font-medium">Tulemused edukalt salvestatud!</p>
          </div>
        </div>
      )}
    </div>
  )
}