// src/hooks/useChampionshipResults.ts - SAFE VERSION: Better type handling
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ChampionshipParticipant {
  participant_key: string          
  participant_type: 'registered' | 'manual_linked' | 'manual_unlinked'
  participant_name: string         
  user_id?: string                 
  manual_participant_id?: string   
  class_name: string
  rally_scores: ChampionshipRallyScore[]
  total_rally_points: number       
  total_extra_points: number       
  total_overall_points: number     
  rounds_participated: number
  championship_position?: number
  is_linked: boolean               
}

export interface ChampionshipRallyScore {
  rally_id: string
  rally_name: string
  round_number: number
  etapp_number: number      
  competition_date: string  
  rally_points: number      // total_points andmebaasist
  extra_points: number      // extra_points andmebaasist
  overall_points: number    // PEAMINE: See kuvatakse tabelis!
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

// Type definitions for database function returns
interface DatabaseStanding {
  participant_name: string
  user_id: string | null
  class_name: string
  total_rally_points: number
  total_extra_points: number
  total_overall_points: number
  rounds_participated: number
  championship_position: number
  is_linked: boolean
  manual_participant_id: string | null
}

interface DatabaseRallyScore {
  rally_id: string
  rally_name: string
  competition_date: string
  round_number: number
  etapp_number: number
  total_points: number
  extra_points: number
  overall_points: number
  class_position: number | null
  participated: boolean
}

export function useChampionshipResults(championshipId: string) {
  return useQuery({
    queryKey: ['championship-results', championshipId],
    queryFn: async (): Promise<ChampionshipResults | null> => {
      if (!championshipId) return null

      console.log('🔄 Calculating championship results with extra points support...')

      try {
        // Get championship info
        const { data: championship, error: championshipError } = await supabase
          .from('championships')
          .select('id, name')
          .eq('id', championshipId)
          .single()

        if (championshipError) throw championshipError

        // Try the new database function first
        try {
          const { data: standings, error: standingsError } = await supabase
            .rpc('get_championship_standings', {
              championship_id_param: championshipId
            }) as { data: DatabaseStanding[] | null, error: any }

          if (!standingsError && standings) {
            console.log('✅ Using new database functions')
            return await processWithDatabaseFunctions(championshipId, championship.name, standings)
          }
        } catch (funcError) {
          console.warn('⚠️ New functions not available, using legacy method')
        }

        // Fallback to legacy calculation
        console.log('🔄 Using legacy calculation method...')
        return await calculateLegacyResults(championshipId, championship.name)

      } catch (error) {
        console.error('Error calculating championship results:', error)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

async function processWithDatabaseFunctions(
  championshipId: string, 
  championshipName: string, 
  standings: DatabaseStanding[]
): Promise<ChampionshipResults> {
  const participants: ChampionshipParticipant[] = []
  
  for (const standing of standings) {
    try {
      // Get detailed rally scores for this participant
      const { data: rallyScores, error: scoresError } = await supabase
        .rpc('get_participant_rally_scores', {
          championship_id_param: championshipId,
          participant_name_param: standing.participant_name,
          class_name_param: standing.class_name
        }) as { data: DatabaseRallyScore[] | null, error: any }

      if (scoresError) {
        console.error('Error loading rally scores for participant:', standing.participant_name, scoresError)
        continue
      }

      // Determine participant type and key
      let participantType: 'registered' | 'manual_linked' | 'manual_unlinked'
      let participantKey: string

      if (standing.user_id) {
        participantType = 'registered'
        participantKey = `user_${standing.user_id}_${standing.class_name}`
      } else if (standing.manual_participant_id) {
        participantType = 'manual_linked'
        participantKey = `manual_${standing.manual_participant_id}_${standing.class_name}`
      } else {
        participantType = 'manual_unlinked'
        participantKey = `unlinked_${standing.participant_name}_${standing.class_name}`
      }

      // ✅ PARANDUS: Õige overall_points arvutamine
      const transformedScores: ChampionshipRallyScore[] = (rallyScores || []).map(score => {
        const rallyPoints = score.total_points || 0  // Rally punktid
        const extraPoints = score.extra_points || 0  // Lisa punktid
        const overallPoints = rallyPoints + extraPoints  // KOGUPUNKTID
        
        return {
          rally_id: score.rally_id,
          rally_name: score.rally_name,
          round_number: score.round_number,
          etapp_number: Number(score.etapp_number),
          competition_date: score.competition_date,
          rally_points: rallyPoints,
          extra_points: extraPoints,
          overall_points: overallPoints,  // ✅ See kuvatakse tabelis!
          participated: overallPoints > 0 || score.participated, // Osales kui on punkte või märgitud
          class_position: score.class_position || undefined
        }
      })

      participants.push({
        participant_key: participantKey,
        participant_type: participantType,
        participant_name: standing.participant_name,
        user_id: standing.user_id || undefined,
        manual_participant_id: standing.manual_participant_id || undefined,
        class_name: standing.class_name,
        rally_scores: transformedScores,
        total_rally_points: standing.total_rally_points || 0,
        total_extra_points: standing.total_extra_points || 0,
        total_overall_points: standing.total_overall_points || 0,
        rounds_participated: standing.rounds_participated || 0,
        championship_position: standing.championship_position || undefined,
        is_linked: standing.is_linked || false
      })
    } catch (participantError) {
      console.error(`Error processing participant ${standing.participant_name}:`, participantError)
      continue
    }
  }

  const linkedCount = participants.filter(p => p.is_linked).length
  const unlinkedCount = participants.filter(p => !p.is_linked).length
  const maxRounds = participants.length > 0 ? Math.max(...participants.map(p => p.rally_scores.length)) : 0

  const warnings: string[] = []
  if (unlinkedCount > 0) {
    warnings.push(`${unlinkedCount} unlinked participants found`)
  }

  return {
    championship_id: championshipId,
    championship_name: championshipName,
    participants: participants,
    total_rounds: maxRounds,
    linked_participants: linkedCount,
    unlinked_participants: unlinkedCount,
    warnings: warnings
  }
}

async function calculateLegacyResults(championshipId: string, championshipName: string): Promise<ChampionshipResults> {
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
      championship_name: championshipName,
      participants: [],
      total_rounds: 0,
      linked_participants: 0,
      unlinked_participants: 0,
      warnings: ['No rallies found in championship']
    }
  }

  // Sort rallies by date and assign etapp numbers
  const sortedRallies = championshipRallies
    .map(cr => ({
      ...cr,
      rally_name: (cr.rallies as any)?.name || 'Unknown Rally',
      competition_date: (cr.rallies as any)?.competition_date || new Date().toISOString()
    }))
    .sort((a, b) => new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime())
    .map((rally, index) => ({
      ...rally,
      etapp_number: index + 1
    }))

  // Get all rally results
  const rallyIds = sortedRallies.map(r => r.rally_id)

  // ✅ PARANDUS: Laadi kõik vajalikud väljad
  const { data: allResults, error: resultsError } = await supabase
    .from('rally_results')
    .select(`
      rally_id,
      participant_name,
      user_id,
      manual_participant_id,
      class_name,
      total_points,
      extra_points,
      class_position
    `)
    .in('rally_id', rallyIds)
    .not('class_position', 'is', null)

  if (resultsError) throw resultsError

  // Group participants and calculate totals
  const participantMap = new Map<string, ChampionshipParticipant>()
  let linkedCount = 0
  let unlinkedCount = 0
  const warnings: string[] = []

  const results = allResults || []
  results.forEach(result => {
    // Determine participant identification
    let participantKey: string
    let participantType: 'registered' | 'manual_linked' | 'manual_unlinked'
    let isLinked: boolean

    if (result.user_id) {
      participantKey = `user_${result.user_id}_${result.class_name}`
      participantType = 'registered'
      isLinked = true
    } else if (result.manual_participant_id) {
      participantKey = `manual_${result.manual_participant_id}_${result.class_name}`
      participantType = 'manual_linked'
      isLinked = true
    } else {
      participantKey = `unlinked_${result.participant_name}_${result.class_name}`
      participantType = 'manual_unlinked'
      isLinked = false
      warnings.push(`Unlinked participant: ${result.participant_name}`)
    }

    if (!participantMap.has(participantKey)) {
      participantMap.set(participantKey, {
        participant_key: participantKey,
        participant_type: participantType,
        participant_name: result.participant_name,
        user_id: result.user_id || undefined,
        manual_participant_id: result.manual_participant_id || undefined,
        class_name: result.class_name,
        rally_scores: [],
        total_rally_points: 0,
        total_extra_points: 0,
        total_overall_points: 0,
        rounds_participated: 0,
        is_linked: isLinked
      })

      if (isLinked) linkedCount++
      else unlinkedCount++
    }
  })

  // Add rally scores for each participant
  participantMap.forEach(participant => {
    sortedRallies.forEach(rally => {
      const rallyResult = results.find(r => 
        r.rally_id === rally.rally_id && 
        r.participant_name === participant.participant_name &&
        r.class_name === participant.class_name
      )

      // ✅ PARANDUS: Arvuta overall_points õigesti
      const rallyPoints = rallyResult?.total_points || 0
      const extraPoints = rallyResult?.extra_points || 0
      const overallPoints = rallyPoints + extraPoints  // KOGUPUNKTID
      const participated = !!rallyResult && overallPoints > 0

      participant.rally_scores.push({
        rally_id: rally.rally_id,
        rally_name: rally.rally_name,
        round_number: rally.round_number,
        etapp_number: rally.etapp_number,
        competition_date: rally.competition_date,
        rally_points: rallyPoints,
        extra_points: extraPoints,
        overall_points: overallPoints,  // ✅ PEAMINE - see kuvatakse tabelis!
        participated: participated,
        class_position: rallyResult?.class_position || undefined
      })

      if (participated) {
        participant.total_rally_points += rallyPoints
        participant.total_extra_points += extraPoints
        participant.total_overall_points += overallPoints  // ✅ Kogupunktide summa
        participant.rounds_participated++
      }
    })
  })

  // Calculate championship positions by class
  const participantsByClass = new Map<string, ChampionshipParticipant[]>()
  participantMap.forEach(participant => {
    if (!participantsByClass.has(participant.class_name)) {
      participantsByClass.set(participant.class_name, [])
    }
    const classArray = participantsByClass.get(participant.class_name)
    if (classArray) {
      classArray.push(participant)
    }
  })

  // ✅ PARANDUS: Sort each class and assign positions
  participantsByClass.forEach(classParticipants => {
    if (classParticipants && classParticipants.length > 0) {
      classParticipants.sort((a, b) => {
        // Kõigepealt overall points
        if (b.total_overall_points !== a.total_overall_points) {
          return b.total_overall_points - a.total_overall_points
        }
        // Siis extra points kui overall võrdne
        if (b.total_extra_points !== a.total_extra_points) {
          return b.total_extra_points - a.total_extra_points
        }
        // Lõpuks osaluste arv
        return b.rounds_participated - a.rounds_participated
      })

      classParticipants.forEach((participant, index) => {
        participant.championship_position = index + 1
      })
    }
  })

  return {
    championship_id: championshipId,
    championship_name: championshipName,
    participants: Array.from(participantMap.values()),
    total_rounds: sortedRallies.length,
    linked_participants: linkedCount,
    unlinked_participants: unlinkedCount,
    warnings: warnings
  }
}