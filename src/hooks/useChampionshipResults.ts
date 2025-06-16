// src/hooks/useChampionshipResults.ts - Updated with participant linking
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ChampionshipParticipant {
  participant_key: string          // Unique identifier for grouping
  participant_type: 'registered' | 'manual_linked' | 'manual_unlinked'
  participant_name: string         // Display name
  user_id?: string                 // For registered participants
  manual_participant_id?: string   // For linked manual participants
  class_name: string
  rally_scores: ChampionshipRallyScore[]
  total_points: number
  rounds_participated: number
  championship_position?: number
  is_linked: boolean               // Whether manual participant is properly linked
}

export interface ChampionshipRallyScore {
  rally_id: string
  rally_name: string
  round_number: number
  points: number
  participated: boolean
  class_position?: number
}

export interface ChampionshipResults {
  championship_id: string
  championship_name: string
  participants: ChampionshipParticipant[]
  total_rounds: number
  linked_participants: number
  unlinked_participants: number
  warnings: string[]
}

export function useChampionshipResults(championshipId: string) {
  return useQuery({
    queryKey: ['championship-results', championshipId],
    queryFn: async (): Promise<ChampionshipResults | null> => {
      if (!championshipId) return null

      console.log('🔄 Calculating championship results with participant linking...')

      try {
        // Get championship info
        const { data: championship, error: championshipError } = await supabase
          .from('championships')
          .select('id, name')
          .eq('id', championshipId)
          .single()

        if (championshipError) throw championshipError

        // Get championship rallies
        const { data: championshipRallies, error: ralliesError } = await supabase
          .from('championship_rallies')
          .select(`
            rally_id,
            round_number,
            rallies!inner(name, competition_date)
          `)
          .eq('championship_id', championshipId)
          .eq('is_active', true)
          .order('round_number')

        if (ralliesError) throw ralliesError

        if (!championshipRallies || championshipRallies.length === 0) {
          return {
            championship_id: championshipId,
            championship_name: championship.name,
            participants: [],
            total_rounds: 0,
            linked_participants: 0,
            unlinked_participants: 0,
            warnings: ['Meistrivõistluses pole rallisid']
          }
        }

        // Get all rally results for these rallies with participant linking
        const rallyIds = championshipRallies.map(cr => cr.rally_id)
        const { data: allResults, error: resultsError } = await supabase
          .from('rally_results')
          .select(`
            rally_id,
            user_id,
            manual_participant_id,
            participant_name,
            class_name,
            total_points,
            class_position,
            users!rally_results_user_id_fkey(player_name),
            manual_participants!left(display_name, canonical_name)
          `)
          .in('rally_id', rallyIds)
          .not('class_position', 'is', null) // Only results with positions

        if (resultsError) throw resultsError

        if (!allResults || allResults.length === 0) {
          return {
            championship_id: championshipId,
            championship_name: championship.name,
            participants: [],
            total_rounds: championshipRallies.length,
            linked_participants: 0,
            unlinked_participants: 0,
            warnings: ['Rallidel pole tulemusi']
          }
        }

        // Process participants with proper linking
        const participantMap = new Map<string, ChampionshipParticipant>()
        const warnings: string[] = []
        let linkedCount = 0
        let unlinkedCount = 0

        allResults.forEach(result => {
          // Determine participant identification
          let participantKey: string
          let participantType: 'registered' | 'manual_linked' | 'manual_unlinked'
          let participantName: string
          let isLinked: boolean

          if (result.user_id) {
            // Registered participant
            participantKey = `user_${result.user_id}`
            participantType = 'registered'
            participantName = (result.users as any)?.player_name || 'Registered User'
            isLinked = true
          } else if (result.manual_participant_id) {
            // Linked manual participant
            participantKey = `manual_${result.manual_participant_id}`
            participantType = 'manual_linked'
            participantName = (result.manual_participants as any)?.display_name || result.participant_name || 'Unknown'
            isLinked = true
          } else {
            // Unlinked manual participant
            participantKey = `unlinked_${result.participant_name}_${result.class_name}`
            participantType = 'manual_unlinked'
            participantName = result.participant_name || 'Unknown'
            isLinked = false
            
            // Add warning for unlinked participant
            if (!warnings.includes(`Sidumata osaleja: ${participantName}`)) {
              warnings.push(`Sidumata osaleja: ${participantName} - võib olla duplikaat`)
            }
          }

          // Count linked vs unlinked
          if (isLinked) {
            linkedCount++
          } else {
            unlinkedCount++
          }

          // Create unique key for participant + class combination
          const participantClassKey = `${participantKey}_${result.class_name}`

          // Initialize participant if not exists
          if (!participantMap.has(participantClassKey)) {
            participantMap.set(participantClassKey, {
              participant_key: participantKey,
              participant_type: participantType,
              participant_name: participantName,
              user_id: result.user_id,
              manual_participant_id: result.manual_participant_id,
              class_name: result.class_name || 'Unknown Class',
              rally_scores: [],
              total_points: 0,
              rounds_participated: 0,
              is_linked: isLinked
            })
          }
        })

        // Add rally scores for each participant
        participantMap.forEach((participant) => {
          championshipRallies.forEach(cr => {
            const rallyResult = allResults.find(r => {
              // Match by participant key and rally
              if (participant.user_id && r.user_id === participant.user_id) {
                return r.rally_id === cr.rally_id && r.class_name === participant.class_name
              } else if (participant.manual_participant_id && r.manual_participant_id === participant.manual_participant_id) {
                return r.rally_id === cr.rally_id && r.class_name === participant.class_name
              } else if (!participant.is_linked) {
                // For unlinked participants, match by name and class
                return r.rally_id === cr.rally_id && 
                       r.participant_name === participant.participant_name &&
                       r.class_name === participant.class_name &&
                       !r.user_id && !r.manual_participant_id
              }
              return false
            })

            const participated = !!rallyResult
            const points = rallyResult?.total_points || 0

            participant.rally_scores.push({
              rally_id: cr.rally_id,
              rally_name: (cr.rallies as any)?.name || 'Unknown Rally',
              round_number: cr.round_number,
              points: points,
              participated: participated,
              class_position: rallyResult?.class_position || undefined
            })

            if (participated) {
              participant.total_points += points
              participant.rounds_participated++
            }
          })
        })

        // Convert to array and sort by class first, then by total points
        const participants = Array.from(participantMap.values())

        // Group participants by class
        const participantsByClass = participants.reduce((acc, participant) => {
          const className = participant.class_name
          if (!acc[className]) {
            acc[className] = []
          }
          acc[className].push(participant)
          return acc
        }, {} as Record<string, ChampionshipParticipant[]>)

        // Sort each class by total points and assign class positions
        Object.keys(participantsByClass).forEach(className => {
          participantsByClass[className].sort((a, b) => {
            // Primary sort: total points (descending)
            if (b.total_points !== a.total_points) {
              return b.total_points - a.total_points
            }
            // Secondary sort: more rounds participated (descending)
            if (b.rounds_participated !== a.rounds_participated) {
              return b.rounds_participated - a.rounds_participated
            }
            // Tertiary sort: alphabetical by name
            return a.participant_name.localeCompare(b.participant_name)
          })

          // Assign championship positions within each class
          participantsByClass[className].forEach((participant, index) => {
            participant.championship_position = index + 1
          })
        })

        // Flatten back to single array, sorted by class name then by position
        const sortedParticipants = Object.keys(participantsByClass)
          .sort((a, b) => a.localeCompare(b)) // Sort class names alphabetically
          .flatMap(className => participantsByClass[className])

        // Add warnings for unlinked participants
        if (unlinkedCount > 0) {
          warnings.unshift(`${unlinkedCount} sidumata osalejat - võimalikud duplikaadid`)
        }

        const result: ChampionshipResults = {
          championship_id: championshipId,
          championship_name: championship.name,
          participants: sortedParticipants,
          total_rounds: championshipRallies.length,
          linked_participants: linkedCount,
          unlinked_participants: unlinkedCount,
          warnings
        }

        console.log(`✅ Championship results calculated:`, {
          participants: sortedParticipants.length,
          classes: Object.keys(participantsByClass).length,
          linked: linkedCount,
          unlinked: unlinkedCount,
          warnings: warnings.length
        })

        return result

      } catch (error) {
        console.error('Error calculating championship results:', error)
        throw error
      }
    },
    enabled: !!championshipId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to get participants that need linking
export function useUnlinkedParticipants() {
  return useQuery({
    queryKey: ['unlinked-participants'],
    queryFn: async () => {
      console.log('🔄 Loading unlinked participants...')

      const { data, error } = await supabase
        .from('rally_results')
        .select(`
          id,
          rally_id,
          participant_name,
          class_name,
          total_points,
          rallies(name, competition_date)
        `)
        .is('user_id', null)
        .is('manual_participant_id', null)
        .not('participant_name', 'is', null)
        .order('participant_name')

      if (error) throw error

      return data || []
    },
    staleTime: 30 * 1000, // 30 seconds - this data changes frequently
  })
}

// Hook to get manual participants overview
export function useManualParticipants() {
  return useQuery({
    queryKey: ['manual-participants'],
    queryFn: async () => {
      console.log('🔄 Loading manual participants...')

      const { data, error } = await supabase
        .from('manual_participants')
        .select(`
          *,
          rally_results(count)
        `)
        .order('display_name')

      if (error) throw error

      return (data || []).map(p => ({
        ...p,
        total_rallies: p.rally_results?.length || 0
      }))
    },
    staleTime: 60 * 1000, // 1 minute
  })
}