// src/components/championship/ParticipantLinkingInterface.tsx - CLEAN COMPLETE VERSION
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ManualParticipant {
  id: string
  canonical_name: string
  display_name: string
  created_at: string
  total_rallies: number
}

interface UnlinkedResult {
  id: string
  rally_id: string
  rally_name: string
  participant_name: string
  class_name: string
  total_points: number
  competition_date: string
}

interface ParticipantMatch {
  manual_participant_id: string
  canonical_name: string
  display_name: string
  similarity_score: number
}

export function ParticipantLinkingInterface() {
  const [manualParticipants, setManualParticipants] = useState<ManualParticipant[]>([])
  const [unlinkedResults, setUnlinkedResults] = useState<UnlinkedResult[]>([])
  const [selectedResult, setSelectedResult] = useState<UnlinkedResult | null>(null)
  const [potentialMatches, setPotentialMatches] = useState<ParticipantMatch[]>([])
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoLinking, setIsAutoLinking] = useState(false)
  const [selectedChampionship, setSelectedChampionship] = useState<string>('all')
  const [championshipRallies, setChampionshipRallies] = useState<Record<string, string[]>>({})

  // Load data on mount
  useEffect(() => {
    loadChampionshipRallies()
    loadManualParticipants()
    loadUnlinkedResults()
  }, [selectedChampionship])

  const loadChampionshipRallies = async () => {
    try {
      // Get all championships with their rallies
      const { data: championships, error } = await supabase
        .from('championships')
        .select(`
          id,
          name,
          championship_rallies!inner(rally_id)
        `)
        .order('name')

      if (error) throw error

      const ralliesMap: Record<string, string[]> = {}
      championships?.forEach(championship => {
        ralliesMap[championship.id] = championship.championship_rallies?.map(cr => cr.rally_id) || []
      })

      setChampionshipRallies(ralliesMap)
    } catch (error) {
      console.error('Error loading championship rallies:', error)
    }
  }

  const loadManualParticipants = async () => {
    try {
      // Get manual participants with proper rally count
      const { data: participants, error } = await supabase
        .from('manual_participants')
        .select('*')
        .order('display_name')

      if (error) throw error

      // Get rally counts for each participant
      const participantsWithCounts = await Promise.all(
        (participants || []).map(async (participant) => {
          const { count, error: countError } = await supabase
            .from('rally_results')
            .select('id', { count: 'exact' })
            .eq('manual_participant_id', participant.id)

          if (countError) {
            console.error('Error counting rallies for participant:', participant.id, countError)
            return { ...participant, total_rallies: 0 }
          }

          return { ...participant, total_rallies: count || 0 }
        })
      )

      setManualParticipants(participantsWithCounts)
    } catch (error) {
      console.error('Error loading manual participants:', error)
    }
  }

  const loadUnlinkedResults = async () => {
    try {
      let rallyIds: string[] = []
      
      if (selectedChampionship === 'all') {
        // Get all rally IDs
        const { data: allRallies, error: ralliesError } = await supabase
          .from('rallies')
          .select('id')
          
        if (ralliesError) throw ralliesError
        rallyIds = allRallies?.map(r => r.id) || []
      } else {
        // Get rally IDs for selected championship only
        rallyIds = championshipRallies[selectedChampionship] || []
      }

      if (rallyIds.length === 0) {
        setUnlinkedResults([])
        return
      }

      const { data, error } = await supabase
        .from('rally_results')
        .select(`
          id,
          rally_id,
          participant_name,
          class_name,
          total_points,
          rallies!inner(name, competition_date)
        `)
        .in('rally_id', rallyIds)
        .is('user_id', null)
        .is('manual_participant_id', null)
        .not('participant_name', 'is', null)
        .order('participant_name')

      if (error) throw error

      const unlinked = data.map(r => ({
        id: r.id,
        rally_id: r.rally_id,
        rally_name: (r.rallies as any)?.name || 'Unknown Rally',
        participant_name: r.participant_name,
        class_name: r.class_name,
        total_points: r.total_points,
        competition_date: (r.rallies as any)?.competition_date || ''
      }))

      setUnlinkedResults(unlinked)
    } catch (error) {
      console.error('Error loading unlinked results:', error)
    }
  }

  const findPotentialMatches = async (participantName: string) => {
    try {
      // Only look for matches within the same championship context
      let rallyIds: string[] = []
      
      if (selectedChampionship === 'all') {
        // Get all rally IDs
        const { data: allRallies } = await supabase
          .from('rallies')
          .select('id')
        rallyIds = allRallies?.map(r => r.id) || []
      } else {
        // Get rally IDs for selected championship only
        rallyIds = championshipRallies[selectedChampionship] || []
      }

      if (rallyIds.length === 0) {
        setPotentialMatches([])
        return
      }

      // Find manual participants who have results in the same championship rallies
      const { data: manualParticipantsInChampionship, error } = await supabase
        .from('manual_participants')
        .select(`
          id,
          canonical_name,
          display_name,
          rally_results!inner(rally_id)
        `)
        .in('rally_results.rally_id', rallyIds)

      if (error) throw error

      // Calculate similarity and create matches
      const matches = (manualParticipantsInChampionship || []).map(mp => ({
        manual_participant_id: mp.id,
        canonical_name: mp.canonical_name,
        display_name: mp.display_name,
        similarity_score: calculateSimilarity(participantName, mp.display_name)
      })).filter(match => match.similarity_score > 0.5) // Only show matches with >50% similarity
        .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by best match first

      setPotentialMatches(matches)
    } catch (error) {
      console.error('Error finding matches:', error)
      setPotentialMatches([])
    }
  }

  // String similarity function (Jaro-Winkler approximation)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ')
    const s1 = normalize(str1)
    const s2 = normalize(str2)
    
    if (s1 === s2) return 1.0
    if (s1.length === 0 || s2.length === 0) return 0.0
    
    // Simple similarity calculation
    const longer = s1.length > s2.length ? s1 : s2
    const shorter = s1.length > s2.length ? s2 : s1
    
    if (longer.length === 0) return 1.0
    
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

  const autoLinkParticipants = async () => {
    setIsAutoLinking(true)
    let linkedCount = 0
    const processedResults = new Set<string>() // Track processed results
    
    try {
      // Process each unlinked result
      for (const result of unlinkedResults) {
        // Skip if already processed
        if (processedResults.has(result.id)) continue
        
        // Find potential matches with 90%+ similarity
        const matches = manualParticipants.filter(mp => 
          calculateSimilarity(result.participant_name, mp.display_name) >= 0.9
        )
        
        if (matches.length === 1) {
          // Auto-link if exactly one match with 90%+ similarity
          console.log(`Auto-linking ${result.participant_name} to ${matches[0].display_name}`)
          
          const { error } = await supabase
            .from('rally_results')
            .update({ manual_participant_id: matches[0].id })
            .eq('id', result.id)
            .is('manual_participant_id', null) // Only update if not already linked

          if (!error) {
            processedResults.add(result.id)
            linkedCount++
          } else {
            console.error('Error linking result:', error)
          }
        }
      }
      
      if (linkedCount > 0) {
        alert(`Automaatselt seoti ${linkedCount} osalejat!`)
        await loadUnlinkedResults()
        await loadManualParticipants()
      } else {
        alert('Ei leitud automaatselt seotavaid osalejaid (90%+ sarnasus).')
      }
      
    } catch (error) {
      console.error('Auto-link error:', error)
      alert('Viga automaatsel sidemisel. Palun proovi uuesti.')
    } finally {
      setIsAutoLinking(false)
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
      const { error } = await supabase
        .from('rally_results')
        .update({ manual_participant_id: manualParticipantId })
        .eq('id', selectedResult.id)

      if (error) throw error

      // Add alias if new
      await supabase
        .from('participant_aliases')
        .upsert({
          manual_participant_id: manualParticipantId,
          alias_name: selectedResult.participant_name
        }, {
          onConflict: 'alias_name',
          ignoreDuplicates: true
        })

      // Refresh data
      await loadUnlinkedResults()
      await loadManualParticipants()
      
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

      // Refresh data
      await loadUnlinkedResults()
      await loadManualParticipants()
      
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Osalejate sidumine</h2>
        <p className="text-slate-400 mb-4">
          Seo käsitsi sisestatud osalejad meistrivõistluste jaoks. 
          See tagab, et sama isiku tulemused erinevatest rallidest liidetakse õigesti kokku.
        </p>

        {/* Championship Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meistrivõistlus
          </label>
          <select
            value={selectedChampionship}
            onChange={(e) => setSelectedChampionship(e.target.value)}
            className="w-full max-w-md px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Kõik rallid</option>
            {Object.entries(championshipRallies).map(([championshipId, rallyIds]) => (
              <option key={championshipId} value={championshipId}>
                Meistrivõistlus ({rallyIds.length} rallid)
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-500 mt-1">
            ⚠️ Oluline: Osalejaid saab siduda ainult sama meistrivõistluse rallidest
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{manualParticipants.length}</div>
            <div className="text-blue-300 text-sm">Seotud osalejat</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-400">{unlinkedResults.length}</div>
            <div className="text-orange-300 text-sm">Sidumata tulemust</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {unlinkedResults.length === 0 ? '✓' : '⚠️'}
            </div>
            <div className="text-green-300 text-sm">
              {unlinkedResults.length === 0 ? 'Kõik seotud' : 'Vajab tööd'}
            </div>
          </div>
        </div>
        
        {/* Auto-link Button */}
        {unlinkedResults.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={autoLinkParticipants}
              disabled={isAutoLinking}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed"
            >
              {isAutoLinking ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Sidun automaatselt...
                </>
              ) : (
                <>
                  🤖 Seo automaatselt (90%+ sarnasus)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unlinked Results */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Sidumata tulemused</h3>
            <p className="text-slate-400 text-sm mt-1">Kliki tulemusele, et alustada sidumist</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {unlinkedResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-slate-400">Kõik tulemused on seotud!</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {unlinkedResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedResult?.id === result.id
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
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
            <h3 className="text-lg font-semibold text-white">Seo osaleja</h3>
          </div>
          
          <div className="p-6">
            {!selectedResult ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👈</div>
                <p className="text-slate-400">Vali vasakult sidumata tulemus</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Selected Result Info */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Valitud tulemus:</h4>
                  <div className="text-sm text-slate-300">
                    <div><strong>{selectedResult.participant_name}</strong></div>
                    <div>{selectedResult.rally_name}</div>
                    <div>{selectedResult.class_name} • {selectedResult.total_points} punkti</div>
                  </div>
                </div>

                {/* Potential Matches */}
                {potentialMatches.length > 0 && (
                  <div>
                    <h5 className="font-medium text-white mb-3">Võimalikud vasted:</h5>
                    <div className="space-y-2">
                      {potentialMatches.map((match) => (
                        <div
                          key={match.manual_participant_id}
                          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                        >
                          <div>
                            <div className="text-white font-medium">{match.display_name}</div>
                            <div className="text-sm text-slate-400">
                              Sarnasus: {Math.round(match.similarity_score * 100)}%
                            </div>
                          </div>
                          <button
                            onClick={() => linkToExistingParticipant(match.manual_participant_id)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded hover:bg-green-600/30 transition-colors disabled:opacity-50"
                          >
                            Seo
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create New Participant */}
                <div className="border-t border-slate-700 pt-6">
                  <h5 className="font-medium text-white mb-3">Või loo uus osaleja:</h5>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      placeholder="Osaleja nimi"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={createNewParticipant}
                      disabled={isLoading || !newParticipantName.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
                    >
                      {isLoading ? 'Loob...' : 'Loo uus'}
                    </button>
                  </div>
                </div>

                {/* Cancel */}
                <button
                  onClick={() => {
                    setSelectedResult(null)
                    setPotentialMatches([])
                    setIsCreatingNew(false)
                  }}
                  className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Tühista
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Participants Overview */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Seotud osalejad</h3>
          <p className="text-slate-400 text-sm mt-1">Kõik käsitsi sisestatud osalejad, kes on seotud</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Nimi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Rallide arv
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Loodud
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {manualParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-slate-700/20">
                  <td className="px-6 py-4 text-white font-medium">
                    {participant.display_name}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {participant.total_rallies} rallid
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {formatDate(participant.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}