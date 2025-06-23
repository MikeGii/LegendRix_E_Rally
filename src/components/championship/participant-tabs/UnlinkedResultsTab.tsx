// src/components/championship/participant-tabs/UnlinkedResultsTab.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UnlinkedResult, ManualParticipant, PotentialMatch } from '../ParticipantLinkingInterface'

interface UnlinkedResultsTabProps {
  unlinkedResults: UnlinkedResult[]
  linkedParticipants: ManualParticipant[]
  selectedChampionship: string
  championshipRallies: Record<string, string[]>
  onRefreshData: () => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function UnlinkedResultsTab({
  unlinkedResults,
  linkedParticipants,
  selectedChampionship,
  championshipRallies,
  onRefreshData,
  isLoading,
  setIsLoading
}: UnlinkedResultsTabProps) {
  const [selectedResult, setSelectedResult] = useState<UnlinkedResult | null>(null)
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [isAutoLinking, setIsAutoLinking] = useState(false)

  const calculateSimilarity = (str1: string, str2: string): number => {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ')
    const s1 = normalize(str1)
    const s2 = normalize(str2)
    
    if (s1 === s2) return 1.0
    if (s1.length === 0 || s2.length === 0) return 0.0
    
    const longer = s1.length > s2.length ? s1 : s2
    const shorter = s1.length > s2.length ? s2 : s1
    const editDistance = levenshteinDistance(s1, s2)
    return (longer.length - editDistance) / longer.length
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  const findPotentialMatches = async (participantName: string) => {
    try {
      // Get aliases for better matching
      const { data: aliases } = await supabase
        .from('participant_aliases')
        .select('manual_participant_id, alias_name')

      const matches: PotentialMatch[] = []

      // Check against existing participants
      linkedParticipants.forEach(participant => {
        // Check display name similarity
        const displaySimilarity = calculateSimilarity(participantName, participant.display_name)
        if (displaySimilarity > 0.6) {
          matches.push({
            manual_participant_id: participant.id,
            canonical_name: participant.canonical_name,
            display_name: participant.display_name,
            similarity_score: displaySimilarity
          })
        }

        // Check canonical name similarity
        const canonicalSimilarity = calculateSimilarity(participantName, participant.canonical_name)
        if (canonicalSimilarity > 0.6 && !matches.find(m => m.manual_participant_id === participant.id)) {
          matches.push({
            manual_participant_id: participant.id,
            canonical_name: participant.canonical_name,
            display_name: participant.display_name,
            similarity_score: canonicalSimilarity
          })
        }

        // Check exact alias matches
        const participantAliases = aliases?.filter(a => a.manual_participant_id === participant.id) || []
        participantAliases.forEach(alias => {
          if (alias.alias_name.toLowerCase().trim() === participantName.toLowerCase().trim()) {
            const existingMatch = matches.find(m => m.manual_participant_id === participant.id)
            if (existingMatch) {
              existingMatch.alias_match = true
              existingMatch.similarity_score = 1.0
            } else {
              matches.push({
                manual_participant_id: participant.id,
                canonical_name: participant.canonical_name,
                display_name: participant.display_name,
                similarity_score: 1.0,
                alias_match: true
              })
            }
          }
        })
      })

      // Sort by similarity score (best matches first)
      matches.sort((a, b) => b.similarity_score - a.similarity_score)
      setPotentialMatches(matches)
    } catch (error) {
      console.error('Error finding potential matches:', error)
      setPotentialMatches([])
    }
  }

  const handleSelectResult = async (result: UnlinkedResult) => {
    setSelectedResult(result)
    setIsCreatingNew(false)
    setNewParticipantName(result.participant_name)
    await findPotentialMatches(result.participant_name)
  }

  const linkToExistingParticipant = async (manualParticipantId: string) => {
    if (!selectedResult) return

    setIsLoading(true)
    try {
      // Link the result
      const { error: linkError } = await supabase
        .from('rally_results')
        .update({ manual_participant_id: manualParticipantId })
        .eq('id', selectedResult.id)

      if (linkError) throw linkError

      // Add alias if it doesn't exist
      const { error: aliasError } = await supabase
        .from('participant_aliases')
        .upsert({
          manual_participant_id: manualParticipantId,
          alias_name: selectedResult.participant_name,
          used_count: 1
        }, {
          onConflict: 'manual_participant_id,alias_name',
          ignoreDuplicates: true
        })

      if (aliasError && !aliasError.message.includes('duplicate')) {
        console.warn('Alias creation warning:', aliasError)
      }

      await onRefreshData()
      setSelectedResult(null)
      setPotentialMatches([])
      
    } catch (error) {
      console.error('Error linking participant:', error)
      alert('Viga osalejate sidemisel. Palun proovi uuesti.')
    } finally {
      setIsLoading(false)
    }
  }

  const createNewParticipant = async () => {
    if (!selectedResult || !newParticipantName.trim()) return

    setIsLoading(true)
    try {
      // Create new manual participant
      const { data: newParticipant, error: createError } = await supabase
        .from('manual_participants')
        .insert({
          canonical_name: newParticipantName.trim(),
          display_name: newParticipantName.trim(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (createError) throw createError

      // Link the result
      const { error: linkError } = await supabase
        .from('rally_results')
        .update({ manual_participant_id: newParticipant.id })
        .eq('id', selectedResult.id)

      if (linkError) throw linkError

      // Add alias if different from canonical name
      if (selectedResult.participant_name.trim() !== newParticipantName.trim()) {
        await supabase
          .from('participant_aliases')
          .insert({
            manual_participant_id: newParticipant.id,
            alias_name: selectedResult.participant_name,
            used_count: 1
          })
      }

      await onRefreshData()
      setSelectedResult(null)
      setPotentialMatches([])
      setIsCreatingNew(false)
      setNewParticipantName('')
      
    } catch (error) {
      console.error('Error creating participant:', error)
      alert('Viga uue osaleja loomisel. Palun proovi uuesti.')
    } finally {
      setIsLoading(false)
    }
  }

  const autoLinkResults = async () => {
    if (!confirm('Kas oled kindel, et tahad kõiki tulemusi automaatselt siduda? See võib luua valesid seoseid.')) return

    setIsAutoLinking(true)
    let linkedCount = 0
    let createdCount = 0

    try {
      for (const result of unlinkedResults) {
        // Find exact alias matches first
        const { data: exactAliasMatch } = await supabase
          .from('participant_aliases')
          .select('manual_participant_id')
          .eq('alias_name', result.participant_name)
          .single()

        if (exactAliasMatch) {
          // Link to existing participant via alias match
          await supabase
            .from('rally_results')
            .update({ manual_participant_id: exactAliasMatch.manual_participant_id })
            .eq('id', result.id)
          linkedCount++
          continue
        }

        // Find high similarity matches
        let bestMatch: PotentialMatch | null = null
        linkedParticipants.forEach(participant => {
          const similarity = Math.max(
            calculateSimilarity(result.participant_name, participant.display_name),
            calculateSimilarity(result.participant_name, participant.canonical_name)
          )
          if (similarity > 0.9 && (!bestMatch || similarity > bestMatch.similarity_score)) {
            bestMatch = {
              manual_participant_id: participant.id,
              canonical_name: participant.canonical_name,
              display_name: participant.display_name,
              similarity_score: similarity
            }
          }
        })

        if (bestMatch) {
          // Link to existing participant
          await supabase
            .from('rally_results')
            .update({ manual_participant_id: bestMatch.manual_participant_id })
            .eq('id', result.id)

          // Add alias
          await supabase
            .from('participant_aliases')
            .upsert({
              manual_participant_id: bestMatch.manual_participant_id,
              alias_name: result.participant_name,
              used_count: 1
            }, {
              onConflict: 'manual_participant_id,alias_name',
              ignoreDuplicates: true
            })
          linkedCount++
        } else {
          // Create new participant
          const { data: newParticipant } = await supabase
            .from('manual_participants')
            .insert({
              canonical_name: result.participant_name,
              display_name: result.participant_name,
              created_by: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single()

          if (newParticipant) {
            await supabase
              .from('rally_results')
              .update({ manual_participant_id: newParticipant.id })
              .eq('id', result.id)
            createdCount++
          }
        }
      }

      alert(`Automaatne sidumine lõpetatud!\nSeotud: ${linkedCount}\nLoodud: ${createdCount}`)
      await onRefreshData()
    } catch (error) {
      console.error('Auto-link error:', error)
      alert('Viga automaatsel sidemisel. Palun proovi uuesti.')
    } finally {
      setIsAutoLinking(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Unlinked Results List */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Sidumata tulemused ({unlinkedResults.length})</h3>
            {unlinkedResults.length > 0 && (
              <button
                onClick={autoLinkResults}
                disabled={isAutoLinking || isLoading}
                className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded text-sm hover:bg-blue-600/30 disabled:opacity-50"
              >
                {isAutoLinking ? 'Sidub...' : 'Auto-sidumine'}
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm">Need tulemused ei ole veel osaleja kontoga seotud</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-4">
          {unlinkedResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-slate-400">Kõik tulemused on seotud!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unlinkedResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className={`bg-slate-700/30 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedResult?.id === result.id
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="font-medium text-white">{result.participant_name}</div>
                  <div className="text-sm text-slate-400">
                    {result.rally_name} • {result.class_name} • {result.total_points} p
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(result.competition_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Linking Interface */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Sidumine</h3>
        </div>
        
        <div className="p-6">
          {!selectedResult ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👈</div>
              <p className="text-slate-400">Vali vasakult tulemus sidumiseks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Result Info */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Valitud tulemus</h4>
                <div className="text-sm text-slate-300">
                  <div>Nimi: {selectedResult.participant_name}</div>
                  <div>Rally: {selectedResult.rally_name}</div>
                  <div>Klass: {selectedResult.class_name}</div>
                  <div>Punktid: {selectedResult.total_points}</div>
                </div>
              </div>

              {/* Potential Matches */}
              {potentialMatches.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Võimalikud vasted:</h4>
                  {potentialMatches.map((match) => (
                    <div
                      key={match.manual_participant_id}
                      className="bg-slate-700/20 rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-white font-medium flex items-center">
                          {match.display_name}
                          {match.alias_match && (
                            <span className="ml-2 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                              ALIAS
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          Sarnasus: {Math.round(match.similarity_score * 100)}%
                        </div>
                      </div>
                      <button
                        onClick={() => linkToExistingParticipant(match.manual_participant_id)}
                        className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded text-sm hover:bg-green-600/30"
                        disabled={isLoading}
                      >
                        Sidumine
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Create New Participant */}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">Loo uus osaleja</h4>
                  <button
                    onClick={() => setIsCreatingNew(!isCreatingNew)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {isCreatingNew ? 'Tühista' : 'Redigeeri nime'}
                  </button>
                </div>
                
                {isCreatingNew ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Osaleja nimi..."
                    />
                    <button
                      onClick={createNewParticipant}
                      disabled={!newParticipantName.trim() || isLoading}
                      className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 disabled:opacity-50"
                    >
                      Loo uus osaleja
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={createNewParticipant}
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30"
                  >
                    Loo "{selectedResult.participant_name}" nimega osaleja
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}