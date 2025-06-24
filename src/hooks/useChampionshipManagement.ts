// src/hooks/useChampionshipManagement.ts - UPDATED: New 3-point system support
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
  status: 'ongoing' | 'completed'
  completed_at?: string
  completed_by?: string
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
  etapp_number?: number
  display_round_number?: number
}

// UPDATED: New interface to match the updated championship results system
export interface ChampionshipResults {
  participant_name: string
  user_id?: string
  class_name: string
  rally_scores: Array<{
    rally_id: string
    rally_name: string
    round_number: number
    rally_points: number      // NEW: Rally points
    extra_points: number      // NEW: Extra points  
    overall_points: number    // NEW: Total points (rally + extra)
    participated: boolean
    class_position?: number
  }>
  total_rally_points: number     // NEW: Sum of rally points
  total_extra_points: number     // NEW: Sum of extra points
  total_overall_points: number   // NEW: Sum of overall points
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
        total_rallies: championship.championship_rallies?.length || 0,
        status: championship.status || 'ongoing'
      }))

      console.log(`✅ Loaded ${championships.length} championships`)
      return championships
    },
    staleTime: 5 * 60 * 1000,
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
      console.log('🔄 Creating championship:', data.name)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      const { data: championship, error } = await supabase
        .from('championships')
        .insert({
          ...data,
          is_active: true,
          status: 'ongoing',
          created_by: user.id,
          activated_at: new Date().toISOString(),
          activated_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating championship:', error)
        throw error
      }

      console.log('✅ Championship created:', championship.name)
      return championship
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: championshipKeys.lists() })
    }
  })
}

export function useUpdateChampionship() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...championshipData 
    }: { 
      id: string
      name?: string
      description?: string
      season_year?: number
      game_id?: string
      game_type_id?: string
    }) => {
      console.log('🔄 Updating championship:', id)
      
      const { data, error } = await supabase
        .from('championships')
        .update({
          ...championshipData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating championship:', error)
        throw error
      }

      console.log('✅ Championship updated:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: championshipKeys.lists() })
      queryClient.invalidateQueries({ queryKey: championshipKeys.detail(variables.id) })
    }
  })
}

export function useDeleteChampionship() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (championshipId: string) => {
      console.log('🔄 Deactivating championship:', championshipId)
      
      const { error } = await supabase
        .from('championships')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', championshipId)

      if (error) {
        console.error('Error deactivating championship:', error)
        throw error
      }

      console.log('✅ Championship deactivated')
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
      
      console.log('🔄 Loading championship rallies for:', championshipId)
      
      const { data: rallies, error } = await supabase
        .from('championship_rallies')
        .select(`
          *,
          rally:rallies(
            name, 
            competition_date, 
            status
          )
        `)
        .eq('championship_id', championshipId)
        .eq('is_active', true)
        .order('round_number', { ascending: true })

      if (error) {
        console.error('Error loading championship rallies:', error)
        throw error
      }

      const transformedRallies = rallies?.map((cr: any, index: number) => ({
        ...cr,
        rally_name: cr.rally?.name || 'Unknown Rally',
        rally_date: cr.rally?.competition_date,
        rally_status: cr.rally?.status,
        etapp_number: index + 1,
        display_round_number: index + 1
      })) || []

      console.log(`✅ Championship rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
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
      console.log('🔄 Adding rally to championship...')
      
      const { data: result, error } = await supabase
        .from('championship_rallies')
        .insert(data)
        .select()
        .single()

      if (error) {
        console.error('Error adding rally to championship:', error)
        throw error
      }

      console.log('✅ Rally added to championship')
      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: championshipKeys.rallies(variables.championship_id) })
      queryClient.invalidateQueries({ queryKey: championshipKeys.results(variables.championship_id) })
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
      console.log('🔄 Removing rally from championship...')
      
      const { error } = await supabase
        .from('championship_rallies')
        .update({ is_active: false })
        .eq('championship_id', data.championship_id)
        .eq('rally_id', data.rally_id)

      if (error) {
        console.error('Error removing rally from championship:', error)
        throw error
      }

      console.log('✅ Rally removed from championship')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: championshipKeys.rallies(variables.championship_id) })
      queryClient.invalidateQueries({ queryKey: championshipKeys.results(variables.championship_id) })
    }
  })
}

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
// UPDATED: Support for new 3-point system
// ============================================================================

export function useChampionshipResults(championshipId: string) {
  return useQuery({
    queryKey: championshipKeys.results(championshipId),
    queryFn: async (): Promise<ChampionshipResults[]> => {
      if (!championshipId) return []

      console.log('🔄 Calculating championship results with new 3-point system for:', championshipId)

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

      // Get all rally results for these rallies with the new 3-point structure
      const rallyIds = championshipRallies.map(cr => cr.rally_id)
      const { data: allResults, error: resultsError } = await supabase
        .from('rally_results')
        .select(`
          rally_id,
          participant_name,
          user_id,
          class_name,
          total_points,
          extra_points,
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
            total_rally_points: 0,
            total_extra_points: 0,
            total_overall_points: 0,
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

          // Calculate points using new 3-point system
          const rallyPoints = rallyResult?.total_points || 0
          const extraPoints = rallyResult?.extra_points || 0
          const overallPoints = rallyPoints + extraPoints

          participant.rally_scores.push({
            rally_id: cr.rally_id,
            rally_name: cr.rally?.name || 'Unknown Rally',
            round_number: cr.round_number,
            rally_points: rallyPoints,
            extra_points: extraPoints,
            overall_points: overallPoints,
            participated: !!rallyResult && overallPoints > 0,
            class_position: rallyResult?.class_position || undefined
          })

          if (rallyResult && overallPoints > 0) {
            participant.total_rally_points += rallyPoints
            participant.total_extra_points += extraPoints
            participant.total_overall_points += overallPoints
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

      // Sort each class and assign positions using new sorting logic
      resultsByClass.forEach(classResults => {
        classResults.sort((a, b) => {
          // Primary: total overall points (descending)
          if (b.total_overall_points !== a.total_overall_points) {
            return b.total_overall_points - a.total_overall_points
          }
          // Secondary: total extra points (descending)
          if (b.total_extra_points !== a.total_extra_points) {
            return b.total_extra_points - a.total_extra_points
          }
          // Tertiary: rounds participated (descending)
          return b.rounds_participated - a.rounds_participated
        })

        classResults.forEach((participant, index) => {
          participant.championship_position = index + 1
        })
      })

      const finalResults = Array.from(participantMap.values())
      console.log(`✅ Calculated results for ${finalResults.length} participants with new 3-point system`)
      return finalResults
    },
    enabled: !!championshipId,
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================================================
// CHAMPIONSHIP STATUS MANAGEMENT HOOKS
// ============================================================================

export function useCompleteChampionship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (championshipId: string) => {
      console.log('🔄 Completing championship:', championshipId)

      // Get current user for logging purposes
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      try {
        // Simple direct update to the championships table
        const { data, error } = await supabase
          .from('championships')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: user.id
          })
          .eq('id', championshipId)
          .select()

        if (error) {
          console.error('Error completing championship:', error)
          return {
            success: false,
            error: error.message
          }
        }

        console.log('✅ Championship completed successfully:', data)
        return {
          success: true,
          message: 'Championship marked as completed'
        }
      } catch (err: any) {
        console.error('Error completing championship:', err)
        return {
          success: false,
          error: err.message || 'Failed to complete championship'
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: championshipKeys.lists() })
        queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
        console.log('🏆 Championship completed and caches invalidated')
      }
    }
  })
}

export function useReopenChampionship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (championshipId: string) => {
      console.log('🔄 Reopening championship:', championshipId)

      // Get current user for logging purposes
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      try {
        // Simple direct update to the championships table
        const { data, error } = await supabase
          .from('championships')
          .update({ 
            status: 'ongoing',
            completed_at: null,
            completed_by: null
          })
          .eq('id', championshipId)
          .select()

        if (error) {
          console.error('Error reopening championship:', error)
          return {
            success: false,
            error: error.message
          }
        }

        console.log('✅ Championship reopened successfully:', data)
        return {
          success: true,
          message: 'Championship reopened successfully'
        }
      } catch (err: any) {
        console.error('Error reopening championship:', err)
        return {
          success: false,
          error: err.message || 'Failed to reopen championship'
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: championshipKeys.lists() })
        queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
        console.log('🔄 Championship reopened and caches invalidated')
      }
    }
  })
}