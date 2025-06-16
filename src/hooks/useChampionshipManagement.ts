// src/hooks/useChampionshipManagement.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Championship {
  id: string
  name: string
  description?: string
  season_year: number
  game_id?: string
  game_type_id?: string
  is_active: boolean
  created_at: string
  created_by?: string
  updated_at: string
  activated_at?: string
  activated_by?: string
  // Joined data
  game_name?: string
  game_type_name?: string
  total_rallies?: number
}

export interface ChampionshipRally {
  id: string
  championship_id: string
  rally_id: string
  round_number: number
  round_name?: string
  is_active: boolean
  created_at: string
  // Joined data
  rally_name?: string
  rally_date?: string
  rally_status?: string
}

export interface ChampionshipResults {
  participant_name: string
  user_id?: string
  class_name: string
  rally_scores: Array<{
    rally_id: string
    rally_name: string
    round_number: number
    points: number
    participated: boolean
    class_position?: number
  }>
  total_points: number
  rounds_participated: number
  championship_position?: number
}

// Query Keys
export const championshipKeys = {
  all: ['championships'] as const,
  lists: () => [...championshipKeys.all, 'list'] as const,
  list: (filters: string) => [...championshipKeys.lists(), { filters }] as const,
  details: () => [...championshipKeys.all, 'detail'] as const,
  detail: (id: string) => [...championshipKeys.details(), id] as const,
  rallies: (id: string) => [...championshipKeys.detail(id), 'rallies'] as const,
  results: (id: string) => [...championshipKeys.detail(id), 'results'] as const,
}

// ============================================================================
// CHAMPIONSHIPS HOOKS
// ============================================================================

export function useChampionships() {
  return useQuery({
    queryKey: championshipKeys.lists(),
    queryFn: async (): Promise<Championship[]> => {
      console.log('🔄 Loading championships...')
      
      const { data, error } = await supabase
        .from('championships')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name),
          championship_rallies(rally_id)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading championships:', error)
        throw error
      }

      const championships = (data || []).map(championship => ({
        ...championship,
        game_name: championship.game?.name || null,
        game_type_name: championship.game_type?.name || null,
        total_rallies: championship.championship_rallies?.length || 0
      }))

      console.log(`✅ Loaded ${championships.length} championships`)
      return championships
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateChampionship() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      season_year?: number
      game_id?: string
      game_type_id?: string
    }) => {
      console.log('🔄 Creating championship...', data)

      const { data: championship, error } = await supabase
        .from('championships')
        .insert([{
          ...data,
          season_year: data.season_year || new Date().getFullYear(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating championship:', error)
        throw error
      }

      console.log('✅ Championship created:', championship.id)
      return championship
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: championshipKeys.lists() })
    }
  })
}

// ============================================================================
// CHAMPIONSHIP RALLIES HOOKS
// ============================================================================

export function useChampionshipRallies(championshipId: string) {
  return useQuery({
    queryKey: championshipKeys.rallies(championshipId),
    queryFn: async (): Promise<ChampionshipRally[]> => {
      if (!championshipId) return []

      console.log('🔄 Loading championship rallies ordered by competition date...')

      const { data, error } = await supabase
        .from('championship_rallies')
        .select(`
          *,
          rally:rallies(name, competition_date, status)
        `)
        .eq('championship_id', championshipId)
        .eq('is_active', true)
        // Remove: .order('round_number', { ascending: true })

      if (error) {
        console.error('Error loading championship rallies:', error)
        throw error
      }

      // ✅ Sort by competition_date instead of round_number
      const sortedRallies = (data || []).sort((a, b) => {
        const dateA = new Date((a.rally as any)?.competition_date || '1970-01-01').getTime()
        const dateB = new Date((b.rally as any)?.competition_date || '1970-01-01').getTime()
        return dateA - dateB
      })

      const rallies = sortedRallies.map((cr, index) => ({
        ...cr,
        rally_name: (cr.rally as any)?.name || 'Unknown Rally',
        rally_date: (cr.rally as any)?.competition_date || null,
        rally_status: (cr.rally as any)?.status || 'unknown',
        etapp_number: index + 1 // ✅ Assign etapp based on date order
      }))

      console.log(`✅ Loaded ${rallies.length} championship rallies ordered by date`)
      return rallies
    },
    enabled: !!championshipId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAddRallyToChampionship() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      championship_id: string
      rally_id: string
      round_number: number
      round_name?: string
    }) => {
      console.log('🔄 Adding rally to championship...', data)

      const { data: championshipRally, error } = await supabase
        .from('championship_rallies')
        .insert([data])
        .select()
        .single()

      if (error) {
        console.error('Error adding rally to championship:', error)
        throw error
      }

      console.log('✅ Rally added to championship')
      return championshipRally
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: championshipKeys.rallies(variables.championship_id) 
      })
    }
  })
}

export function useRemoveRallyFromChampionship() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      championship_id: string
      rally_id: string
    }) => {
      console.log('🔄 Removing rally from championship...', data)

      const { error } = await supabase
        .from('championship_rallies')
        .delete()
        .eq('championship_id', data.championship_id)
        .eq('rally_id', data.rally_id)

      if (error) {
        console.error('Error removing rally from championship:', error)
        throw error
      }

      console.log('✅ Rally removed from championship')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: championshipKeys.rallies(variables.championship_id) 
      })
    }
  })
}

// ============================================================================
// CHAMPIONSHIP ACTIVATION
// ============================================================================

export function useActivateChampionship() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (championshipId: string) => {
      console.log('🔄 Activating championship:', championshipId)

      const { data: championship, error } = await supabase
        .from('championships')
        .update({
          is_active: true,
          activated_at: new Date().toISOString(),
          activated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', championshipId)
        .select()
        .single()

      if (error) {
        console.error('Error activating championship:', error)
        throw error
      }

      console.log('✅ Championship activated')
      return championship
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: championshipKeys.lists() })
    }
  })
}

// ============================================================================
// CHAMPIONSHIP RESULTS CALCULATION (CLIENT-SIDE)
// ============================================================================

export function useChampionshipResults(championshipId: string) {
  return useQuery({
    queryKey: championshipKeys.results(championshipId),
    queryFn: async (): Promise<ChampionshipResults[]> => {
      if (!championshipId) return []

      console.log('🔄 Calculating championship results for:', championshipId)

      // Get championship rallies
      const { data: championshipRallies, error: ralliesError } = await supabase
        .from('championship_rallies')
        .select(`
          *,
          rally:rallies(name, competition_date)
        `)
        .eq('championship_id', championshipId)
        .eq('is_active', true)
        .order('round_number', { ascending: true })

      if (ralliesError) {
        console.error('Error loading championship rallies:', ralliesError)
        throw ralliesError
      }

      if (!championshipRallies || championshipRallies.length === 0) {
        return []
      }

      // Get all rally results for these rallies
      const rallyIds = championshipRallies.map(cr => cr.rally_id)
      const { data: allResults, error: resultsError } = await supabase
        .from('rally_results')
        .select(`
          rally_id,
          participant_name,
          user_id,
          class_name,
          total_points,
          class_position
        `)
        .in('rally_id', rallyIds)
        .not('class_position', 'is', null)

      if (resultsError) {
        console.error('Error loading rally results:', resultsError)
        throw resultsError
      }

      // Group results by participant and class
      const participantMap = new Map<string, ChampionshipResults>()

      // Initialize all participants
      allResults?.forEach(result => {
        const key = `${result.participant_name}-${result.class_name}`
        if (!participantMap.has(key)) {
          participantMap.set(key, {
            participant_name: result.participant_name,
            user_id: result.user_id,
            class_name: result.class_name,
            rally_scores: [],
            total_points: 0,
            rounds_participated: 0
          })
        }
      })

      // Add rally scores for each participant
      participantMap.forEach((participant, key) => {
        championshipRallies.forEach(cr => {
          const rallyResult = allResults?.find(r => 
            r.rally_id === cr.rally_id && 
            r.participant_name === participant.participant_name &&
            r.class_name === participant.class_name
          )

          participant.rally_scores.push({
            rally_id: cr.rally_id,
            rally_name: cr.rally?.name || 'Unknown Rally',
            round_number: cr.round_number,
            points: rallyResult?.total_points || 0,
            participated: !!rallyResult,
            class_position: rallyResult?.class_position || undefined
          })

          if (rallyResult) {
            participant.total_points += rallyResult.total_points || 0
            participant.rounds_participated += 1
          }
        })
      })

      // Calculate championship positions by class
      const resultsByClass = new Map<string, ChampionshipResults[]>()
      participantMap.forEach(participant => {
        if (!resultsByClass.has(participant.class_name)) {
          resultsByClass.set(participant.class_name, [])
        }
        resultsByClass.get(participant.class_name)!.push(participant)
      })

      // Sort each class and assign positions
      resultsByClass.forEach(classResults => {
        classResults.sort((a, b) => {
          if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points
          }
          return b.rounds_participated - a.rounds_participated
        })

        classResults.forEach((participant, index) => {
          participant.championship_position = index + 1
        })
      })

      const finalResults = Array.from(participantMap.values())
      console.log(`✅ Calculated results for ${finalResults.length} participants`)
      return finalResults
    },
    enabled: !!championshipId,
    staleTime: 2 * 60 * 1000, // 2 minutes - results change less frequently
  })
}