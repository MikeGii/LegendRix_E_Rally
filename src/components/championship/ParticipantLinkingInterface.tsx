// src/components/championship/ParticipantLinkingInterface.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UnlinkedResultsTab } from './participant-tabs/UnlinkedResultsTab'
import { LinkedParticipantsTab } from './participant-tabs/LinkedParticipantsTab'
import { ManageAliasesTab } from './participant-tabs/ManageAliasesTab'

export interface ManualParticipant {
  id: string
  canonical_name: string
  display_name: string
  created_at: string
  total_rallies: number
  total_results: number
  aliases: string[]
  recent_rally: string
}

export interface LinkedResult {
  id: string
  rally_id: string
  rally_name: string
  participant_name: string
  class_name: string
  total_points: number
  competition_date: string
  manual_participant_id: string
}

export interface UnlinkedResult {
  id: string
  rally_id: string
  rally_name: string
  participant_name: string
  class_name: string
  total_points: number
  competition_date: string
}

export interface PotentialMatch {
  manual_participant_id: string
  canonical_name: string
  display_name: string
  similarity_score: number
  alias_match?: boolean
}

export function ParticipantLinkingInterface() {
  const [activeTab, setActiveTab] = useState<'unlinked' | 'linked' | 'manage'>('unlinked')
  const [selectedChampionship, setSelectedChampionship] = useState<string>('all')
  const [championshipRallies, setChampionshipRallies] = useState<Record<string, string[]>>({})
  const [championships, setChampionships] = useState<Array<{id: string, name: string}>>([])
  
  // Data states
  const [unlinkedResults, setUnlinkedResults] = useState<UnlinkedResult[]>([])
  const [linkedParticipants, setLinkedParticipants] = useState<ManualParticipant[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadChampionships()
  }, [])

  useEffect(() => {
    loadUnlinkedResults()
    loadLinkedParticipants()
  }, [selectedChampionship, championshipRallies])

  const loadChampionships = async () => {
    try {
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
      const championshipsData: Array<{id: string, name: string}> = []

      championships?.forEach(championship => {
        ralliesMap[championship.id] = championship.championship_rallies?.map(cr => cr.rally_id) || []
        championshipsData.push({
          id: championship.id,
          name: championship.name
        })
      })

      setChampionshipRallies(ralliesMap)
      setChampionships(championshipsData)
    } catch (error) {
      console.error('Error loading championships:', error)
    }
  }

  const loadUnlinkedResults = async () => {
    try {
      let rallyIds: string[] = []
      
      if (selectedChampionship === 'all') {
        const { data: allRallies } = await supabase.from('rallies').select('id')
        rallyIds = allRallies?.map(r => r.id) || []
      } else {
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

  const loadLinkedParticipants = async () => {
    try {
      const { data: participants, error } = await supabase
        .from('manual_participants')
        .select(`
          id,
          canonical_name,
          display_name,
          created_at
        `)
        .order('display_name')

      if (error) throw error

      const { data: aliases } = await supabase
        .from('participant_aliases')
        .select('manual_participant_id, alias_name')

      const participantsWithStats = await Promise.all(
        (participants || []).map(async (participant) => {
          const { data: results, count } = await supabase
            .from('rally_results')
            .select(`
              rally_id,
              rallies(name, competition_date)
            `, { count: 'exact' })
            .eq('manual_participant_id', participant.id)

          const uniqueRallies = new Set(results?.map(r => r.rally_id)).size

          const recentResult = results?.sort((a, b) => 
            new Date((b.rallies as any)?.competition_date || 0).getTime() - 
            new Date((a.rallies as any)?.competition_date || 0).getTime()
          )[0]

          const participantAliases = aliases?.filter(a => a.manual_participant_id === participant.id).map(a => a.alias_name) || []

          return {
            ...participant,
            total_rallies: uniqueRallies,
            total_results: count || 0,
            aliases: participantAliases,
            recent_rally: (recentResult?.rallies as any)?.name || 'None'
          }
        })
      )

      setLinkedParticipants(participantsWithStats)
    } catch (error) {
      console.error('Error loading linked participants:', error)
    }
  }

  const refreshData = async () => {
    await Promise.all([
      loadUnlinkedResults(),
      loadLinkedParticipants()
    ])
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Osalejate haldus</h2>
        <p className="text-slate-400 mb-4">
          Halda osalejate sidumist ja aliaseid. Paranda valesid sidumisi ja loo uusi aliaseid.
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
            {championships.map((championship) => (
              <option key={championship.id} value={championship.id}>
                {championship.name} ({championshipRallies[championship.id]?.length || 0} rallid)
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-700/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('unlinked')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'unlinked'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Sidumata ({unlinkedResults.length})
          </button>
          <button
            onClick={() => setActiveTab('linked')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'linked'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Seotud ({linkedParticipants.length})
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'manage'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Halda aliaseid
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'unlinked' && (
        <UnlinkedResultsTab
          unlinkedResults={unlinkedResults}
          linkedParticipants={linkedParticipants}
          selectedChampionship={selectedChampionship}
          championshipRallies={championshipRallies}
          onRefreshData={refreshData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      {activeTab === 'linked' && (
        <LinkedParticipantsTab
          linkedParticipants={linkedParticipants}
          onRefreshData={refreshData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      {activeTab === 'manage' && (
        <ManageAliasesTab
          linkedParticipants={linkedParticipants}
          onRefreshData={refreshData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  )
}