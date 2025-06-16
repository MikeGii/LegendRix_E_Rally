// src/hooks/useChampionshipResults.ts - FIXED VERSION with Date Sorting
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
  etapp_number: number      // Estonian "etapp" number based on date order
  competition_date: string  // Rally date for reference
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

      console.log('🔄 Calculating championship results with date-based etapp ordering...')

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

        // FIXED: Sort rallies by competition_date and assign etapp numbers
        const sortedChampionshipRallies = championshipRallies
          .map(cr => {
            // Handle the rallies property correctly based on Supabase return type
            const rally = (cr as any).rallies
            return {
              ...cr,
              rally_name: rally?.name || 'Unknown Rally',
              competition_date: rally?.competition_date || '1970-01-01'
            }
          })
          .sort((a, b) => {
            const dateA = new Date(a.competition_date).getTime()
            const dateB = new Date(b.competition_date).getTime()
            return dateA - dateB // Earliest date first
          })
          .map((rally, index) => ({
            ...rally,
            etapp_number: index + 1, // 1st etapp = earliest rally
            round_number: index + 1   // Update round_number to match date order
          }))

        console.log(`📅 Sorted ${sortedChampionshipRallies.length} rallies by competition date`)

        // Get all rally results for these rallies with participant linking
        const rallyIds = sortedChampionshipRallies.map(cr => cr.rally_id)
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
            total_rounds: sortedChampionshipRallies.length,
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
            // Registered user - automatic linking by user_id
            participantKey = `user_${result.user_id}_${result.class_name}`
            participantType = 'registered'
            participantName = (result.users as any)?.player_name || result.participant_name
            isLinked = true
            linkedCount++
          } else if (result.manual_participant_id) {
            // Manual linked participant
            participantKey = `manual_${result.manual_participant_id}_${result.class_name}`
            participantType = 'manual_linked'
            participantName = (result.manual_participants as any)?.display_name || result.participant_name
            isLinked = true
            linkedCount++
          } else {
            // Manual unlinked participant
            participantKey = `unlinked_${result.participant_name}_${result.class_name}`
            participantType = 'manual_unlinked'
            participantName = result.participant_name
            isLinked = false
            unlinkedCount++
            warnings.push(`Sidumata osaleja: ${result.participant_name}`)
          }

          const participantClassKey = participantKey

          // Create participant if doesn't exist
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

        // Add rally scores for each participant using sorted rallies
        participantMap.forEach((participant) => {
          sortedChampionshipRallies.forEach(cr => {
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
              rally_name: cr.rally_name || 'Unknown Rally',
              round_number: cr.round_number,
              etapp_number: cr.etapp_number,           // NEW: Date-based etapp number
              competition_date: cr.competition_date || '', // NEW: Rally date
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

        // Sort each class and assign championship positions
        Object.values(participantsByClass).forEach(classParticipants => {
          classParticipants.sort((a, b) => {
            if (b.total_points !== a.total_points) {
              return b.total_points - a.total_points
            }
            return b.rounds_participated - a.rounds_participated
          })

          classParticipants.forEach((participant, index) => {
            participant.championship_position = index + 1
          })
        })

        const finalResults = Array.from(participantMap.values())
        console.log(`✅ Championship results calculated for ${finalResults.length} participants with date-ordered etapps`)
        
        return {
          championship_id: championshipId,
          championship_name: championship.name,
          participants: finalResults,
          total_rounds: sortedChampionshipRallies.length,
          linked_participants: linkedCount,
          unlinked_participants: unlinkedCount,
          warnings: warnings
        }

      } catch (error) {
        console.error('Error calculating championship results:', error)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}