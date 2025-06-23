// src/components/championship/participant-tabs/LinkedParticipantsTab.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ManualParticipant, LinkedResult } from '../ParticipantLinkingInterface'

interface LinkedParticipantsTabProps {
  linkedParticipants: ManualParticipant[]
  onRefreshData: () => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function LinkedParticipantsTab({
  linkedParticipants,
  onRefreshData,
  isLoading,
  setIsLoading
}: LinkedParticipantsTabProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<ManualParticipant | null>(null)
  const [participantResults, setParticipantResults] = useState<LinkedResult[]>([])
  const [editingParticipant, setEditingParticipant] = useState<ManualParticipant | null>(null)
  const [editedName, setEditedName] = useState('')
  const [editedCanonicalName, setEditedCanonicalName] = useState('')

  const loadParticipantResults = async (participantId: string) => {
    try {
      const { data: results, error } = await supabase
        .from('rally_results')
        .select(`
          id,
          rally_id,
          participant_name,
          class_name,
          total_points,
          manual_participant_id,
          rallies!inner(name, competition_date)
        `)
        .eq('manual_participant_id', participantId)
        .order('rallies(competition_date)', { ascending: false })

      if (error) throw error

      const formattedResults = results.map(r => ({
        id: r.id,
        rally_id: r.rally_id,
        rally_name: (r.rallies as any)?.name || 'Unknown Rally',
        participant_name: r.participant_name,
        class_name: r.class_name,
        total_points: r.total_points || 0,
        competition_date: (r.rallies as any)?.competition_date || '',
        manual_participant_id: r.manual_participant_id
      }))

      setParticipantResults(formattedResults)
    } catch (error) {
      console.error('Error loading participant results:', error)
    }
  }

  const handleSelectParticipant = (participant: ManualParticipant) => {
    setSelectedParticipant(participant)
    loadParticipantResults(participant.id)
    setEditingParticipant(null)
  }

  const startEditing = (participant: ManualParticipant) => {
    setEditingParticipant(participant)
    setEditedName(participant.display_name)
    setEditedCanonicalName(participant.canonical_name)
  }

  const saveParticipantEdit = async () => {
    if (!editingParticipant || !editedName.trim() || !editedCanonicalName.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('manual_participants')
        .update({
          display_name: editedName.trim(),
          canonical_name: editedCanonicalName.trim()
        })
        .eq('id', editingParticipant.id)

      if (error) throw error

      await onRefreshData()
      setEditingParticipant(null)
      
      // Update selected participant if it was the edited one
      if (selectedParticipant?.id === editingParticipant.id) {
        setSelectedParticipant({
          ...selectedParticipant,
          display_name: editedName.trim(),
          canonical_name: editedCanonicalName.trim()
        })
      }

      alert('Osaleja andmed salvestatud!')
    } catch (error) {
      console.error('Error updating participant:', error)
      alert('Viga osaleja andmete salvestamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const unlinkResult = async (resultId: string) => {
    if (!confirm('Kas oled kindel, et tahad selle tulemuse sidumise eemaldada?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('rally_results')
        .update({ manual_participant_id: null })
        .eq('id', resultId)

      if (error) throw error

      await onRefreshData()
      if (selectedParticipant) {
        await loadParticipantResults(selectedParticipant.id)
      }

      alert('Tulemuse sidumine eemaldatud!')
    } catch (error) {
      console.error('Error unlinking result:', error)
      alert('Viga tulemuse sidumise eemaldamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteParticipant = async (participantId: string, participantName: string) => {
    if (!confirm(`Kas oled kindel, et tahad kustutada osaleja "${participantName}"?\n\nSee toimingu käigus:\n- Kõik tema tulemused muutuvad sidumata\n- Kõik tema aliased kustutatakse\n- Seda toimingut ei saa tagasi võtta`)) return

    setIsLoading(true)
    try {
      // First unlink all rally results
      await supabase
        .from('rally_results')
        .update({ manual_participant_id: null })
        .eq('manual_participant_id', participantId)

      // Delete aliases
      await supabase
        .from('participant_aliases')
        .delete()
        .eq('manual_participant_id', participantId)

      // Delete participant
      const { error } = await supabase
        .from('manual_participants')
        .delete()
        .eq('id', participantId)

      if (error) throw error

      await onRefreshData()
      setSelectedParticipant(null)
      setParticipantResults([])

      alert('Osaleja kustutatud!')
    } catch (error) {
      console.error('Error deleting participant:', error)
      alert('Viga osaleja kustutamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const mergeParticipants = async (sourceId: string, targetId: string, sourceName: string, targetName: string) => {
    if (!confirm(`Kas oled kindel, et tahad ühendada osaleja "${sourceName}" osaleja "${targetName}" alla?\n\nSelle toimingu käigus:\n- Kõik "${sourceName}" tulemused lähevad "${targetName}" alla\n- "${sourceName}" aliased lähevad "${targetName}" alla\n- "${sourceName}" kustutatakse\n- Seda toimingut ei saa tagasi võtta`)) return

    setIsLoading(true)
    try {
      // Move all rally results to target participant
      await supabase
        .from('rally_results')
        .update({ manual_participant_id: targetId })
        .eq('manual_participant_id', sourceId)

      // Move aliases to target participant
      const { data: sourceAliases } = await supabase
        .from('participant_aliases')
        .select('alias_name, used_count')
        .eq('manual_participant_id', sourceId)

      if (sourceAliases && sourceAliases.length > 0) {
        // Insert aliases to target (ignore duplicates)
        for (const alias of sourceAliases) {
          await supabase
            .from('participant_aliases')
            .upsert({
              manual_participant_id: targetId,
              alias_name: alias.alias_name,
              used_count: alias.used_count
            }, {
              onConflict: 'manual_participant_id,alias_name',
              ignoreDuplicates: true
            })
        }

        // Delete old aliases
        await supabase
          .from('participant_aliases')
          .delete()
          .eq('manual_participant_id', sourceId)
      }

      // Delete source participant
      await supabase
        .from('manual_participants')
        .delete()
        .eq('id', sourceId)

      await onRefreshData()
      setSelectedParticipant(null)
      setParticipantResults([])

      alert('Osalejad ühendatud!')
    } catch (error) {
      console.error('Error merging participants:', error)
      alert('Viga osalejate ühendamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE')
  }

  const [mergeMode, setMergeMode] = useState(false)
  const [mergeTarget, setMergeTarget] = useState<ManualParticipant | null>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Linked Participants List */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Seotud osalejad ({linkedParticipants.length})</h3>
            <button
              onClick={() => {
                setMergeMode(!mergeMode)
                setMergeTarget(null)
              }}
              className={`px-3 py-1 text-sm rounded border ${
                mergeMode
                  ? 'bg-orange-600/20 text-orange-400 border-orange-600/30'
                  : 'bg-blue-600/20 text-blue-400 border-blue-600/30'
              }`}
            >
              {mergeMode ? 'Tühista ühendamine' : 'Ühenda osalejad'}
            </button>
          </div>
          <p className="text-slate-400 text-sm">
            {mergeMode ? 'Vali kaks osalejat ühendamiseks' : 'Kliki osalejale, et näha tema tulemusi'}
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-1 p-2">
            {linkedParticipants.map((participant) => (
              <div
                key={participant.id}
                onClick={() => {
                  if (mergeMode) {
                    if (!mergeTarget) {
                      setMergeTarget(participant)
                    } else if (mergeTarget.id !== participant.id) {
                      mergeParticipants(participant.id, mergeTarget.id, participant.display_name, mergeTarget.display_name)
                      setMergeMode(false)
                      setMergeTarget(null)
                    }
                  } else {
                    handleSelectParticipant(participant)
                  }
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  mergeMode && mergeTarget?.id === participant.id
                    ? 'bg-orange-500/20 border border-orange-500/50'
                    : selectedParticipant?.id === participant.id && !mergeMode
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'bg-slate-700/30 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-white">{participant.display_name}</div>
                    {participant.canonical_name !== participant.display_name && (
                      <div className="text-xs text-slate-500">Kanoonline: {participant.canonical_name}</div>
                    )}
                    <div className="text-sm text-slate-400">
                      {participant.total_rallies} rallit • {participant.total_results} tulemust
                    </div>
                    <div className="text-xs text-slate-500">
                      Aliased: {participant.aliases.length > 0 ? participant.aliases.join(', ') : 'Puuduvad'}
                    </div>
                  </div>
                  {!mergeMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditing(participant)
                      }}
                      className="px-2 py-1 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded text-xs hover:bg-gray-600/30"
                    >
                      Muuda
                    </button>
                  )}
                </div>
                {mergeTarget?.id === participant.id && (
                  <div className="mt-2 text-xs text-orange-400">
                    Sihtkoht valitud - vali teine osaleja ühendamiseks
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Participant Details */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Osaleja andmed</h3>
        </div>
        
        <div className="p-6">
          {editingParticipant ? (
            <div className="space-y-4">
              <h4 className="font-medium text-white">Redigeeri osalejat</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Kuvatav nimi
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kuvatav nimi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Kanoonline nimi
                  </label>
                  <input
                    type="text"
                    value={editedCanonicalName}
                    onChange={(e) => setEditedCanonicalName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kanoonline nimi..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={saveParticipantEdit}
                    disabled={!editedName.trim() || !editedCanonicalName.trim() || isLoading}
                    className="px-3 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded hover:bg-green-600/30 disabled:opacity-50"
                  >
                    Salvesta
                  </button>
                  <button
                    onClick={() => setEditingParticipant(null)}
                    className="px-3 py-2 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded hover:bg-gray-600/30"
                  >
                    Tühista
                  </button>
                </div>
              </div>
            </div>
          ) : !selectedParticipant ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👈</div>
              <p className="text-slate-400">Vali vasakult osaleja</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">{selectedParticipant.display_name}</h4>
                {selectedParticipant.canonical_name !== selectedParticipant.display_name && (
                  <div className="text-sm text-slate-400 mb-2">
                    Kanoonline: {selectedParticipant.canonical_name}
                  </div>
                )}
                <div className="text-sm text-slate-300 space-y-1">
                  <div>Rallisid: {selectedParticipant.total_rallies}</div>
                  <div>Tulemusi: {selectedParticipant.total_results}</div>
                  <div>Aliased: {selectedParticipant.aliases.length > 0 ? selectedParticipant.aliases.join(', ') : 'Puuduvad'}</div>
                  <div>Viimane rally: {selectedParticipant.recent_rally}</div>
                  <div>Loodud: {formatDate(selectedParticipant.created_at)}</div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => startEditing(selectedParticipant)}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded text-sm hover:bg-blue-600/30"
                    disabled={isLoading}
                  >
                    Muuda andmeid
                  </button>
                  <button
                    onClick={() => deleteParticipant(selectedParticipant.id, selectedParticipant.display_name)}
                    className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-sm hover:bg-red-600/30"
                    disabled={isLoading}
                  >
                    Kustuta osaleja
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h5 className="font-medium text-white">Tulemused ({participantResults.length})</h5>
                {participantResults.map((result) => (
                  <div key={result.id} className="bg-slate-700/20 rounded p-3 flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{result.rally_name}</div>
                      <div className="text-sm text-slate-400">
                        {result.participant_name} • {result.class_name} • {result.total_points}p
                      </div>
                      <div className="text-xs text-slate-500">{formatDate(result.competition_date)}</div>
                    </div>
                    <button
                      onClick={() => unlinkResult(result.id)}
                      className="px-2 py-1 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded text-xs hover:bg-orange-600/30"
                      disabled={isLoading}
                    >
                      Eemalda seos
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}