// src/hooks/useResultsManagement.ts - Hook for managing rally results
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface CompletedRally {
  id: string
  name: string
  description?: string
  competition_date: string
  participant_count: number
  results_needed_since?: string
  results_completed: boolean
  game_name?: string
  game_type_name?: string
  // Rally events for scoring
  events?: RallyEvent[]
}

export interface RallyEvent {
  id: string
  event_name: string
  event_order: number
  points_multiplier?: number
}

export interface RallyParticipant {
  id: string
  user_id: string
  user_name: string
  player_name?: string
  user_email: string
  class_name: string
  registration_date: string
  // Results if available
  overall_position?: number
  total_points?: number
  results_entered?: boolean
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const resultsKeys = {
  all: ['results'] as const,
  completed_rallies: () => [...resultsKeys.all, 'completed-rallies'] as const,
  rally_participants: (rallyId: string) => [...resultsKeys.all, 'participants', rallyId] as const,
  rally_results: (rallyId: string) => [...resultsKeys.all, 'results', rallyId] as const,
}

// ============================================================================
// GET COMPLETED RALLIES (need results entry)
// ============================================================================

export function useCompletedRallies() {
  return useQuery({
    queryKey: resultsKeys.completed_rallies(),
    queryFn: async (): Promise<CompletedRally[]> => {
      console.log('🔄 Loading rallies that need results entry...')

      // Get rallies where competition_date + 12 hours < NOW
      const twelveHoursAgo = new Date()
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12)

      // FIXED: Remove is_active filter to include all completed rallies
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          description,
          competition_date,
          is_active,
          game:games(name),
          game_type:game_types(name)
        `)
        .lte('competition_date', twelveHoursAgo.toISOString())
        .order('competition_date', { ascending: false })

      if (error) {
        console.error('Error loading completed rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        console.log('No completed rallies found')
        return []
      }

      const rallyIds = rallies.map(r => r.id)

      // Get participant counts for each rally
      const { data: participantCounts, error: countError } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed'])

      if (countError) {
        console.error('Error loading participant counts:', countError)
      }

      // Count participants per rally
      const counts: Record<string, number> = {}
      rallyIds.forEach(id => counts[id] = 0)
      
      if (participantCounts) {
        participantCounts.forEach(p => {
          counts[p.rally_id] = (counts[p.rally_id] || 0) + 1
        })
      }

      // Check if results status exists
      const { data: resultsStatus, error: statusError } = await supabase
        .from('rally_results_status')
        .select('rally_id, results_needed_since, results_completed')
        .in('rally_id', rallyIds)

      if (statusError) {
        console.error('Error loading results status:', statusError)
      }

      const statusMap: Record<string, any> = {}
      if (resultsStatus) {
        resultsStatus.forEach(s => {
          statusMap[s.rally_id] = s
        })
      }

      // Transform data
      const transformedRallies: CompletedRally[] = rallies.map((rally: any) => {
        const status = statusMap[rally.id]
        
        return {
          id: rally.id,
          name: rally.name,
          description: rally.description,
          competition_date: rally.competition_date,
          participant_count: counts[rally.id] || 0,
          results_needed_since: status?.results_needed_since || rally.competition_date,
          results_completed: status?.results_completed || false,
          game_name: rally.game?.name,
          game_type_name: rally.game_type?.name
        }
      })

      console.log(`✅ Loaded ${transformedRallies.length} completed rallies (including inactive ones)`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// GET RALLY PARTICIPANTS (for results entry)
// ============================================================================

export function useRallyParticipants(rallyId: string) {
  return useQuery({
    queryKey: resultsKeys.rally_participants(rallyId),
    queryFn: async (): Promise<RallyParticipant[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading participants for rally:', rallyId)

      const { data: participants, error } = await supabase
        .from('rally_registrations')
        .select(`
          id,
          user_id,
          registration_date,
          users!inner(
            name,
            player_name,
            email
          ),
          game_classes!inner(
            name
          )
        `)
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])
        .order('registration_date', { ascending: true })

      if (error) {
        console.error('Error loading rally participants:', error)
        throw error
      }

      if (!participants) return []

      // Check if results already exist
      const participantUserIds = participants.map(p => p.user_id)
      const { data: existingResults, error: resultsError } = await supabase
        .from('rally_results')
        .select('user_id, overall_position, total_points')
        .eq('rally_id', rallyId)
        .in('user_id', participantUserIds)

      if (resultsError) {
        console.error('Error loading existing results:', resultsError)
      }

      const resultsMap: Record<string, any> = {}
      if (existingResults) {
        existingResults.forEach(r => {
          resultsMap[r.user_id] = r
        })
      }

      // Transform data
      const transformedParticipants: RallyParticipant[] = participants.map((p: any) => {
        const result = resultsMap[p.user_id]
        
        return {
          id: p.id,
          user_id: p.user_id,
          user_name: p.users.name,
          player_name: p.users.player_name,
          user_email: p.users.email,
          class_name: p.game_classes.name,
          registration_date: p.registration_date,
          overall_position: result?.overall_position,
          total_points: result?.total_points,
          results_entered: !!result
        }
      })

      console.log(`✅ Loaded ${transformedParticipants.length} participants`)
      return transformedParticipants
    },
    enabled: !!rallyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ============================================================================
// GET RALLY EVENTS (for event-based scoring)
// ============================================================================

export function useRallyEvents(rallyId: string) {
  return useQuery({
    queryKey: [...resultsKeys.all, 'events', rallyId],
    queryFn: async (): Promise<RallyEvent[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading events for rally:', rallyId)

      const { data: events, error } = await supabase
        .from('rally_events')
        .select(`
          id,
          event_order,
          points_multiplier,
          event:game_events(
            id,
            name
          )
        `)
        .eq('rally_id', rallyId)
        .eq('is_active', true)
        .order('event_order', { ascending: true })

      if (error) {
        console.error('Error loading rally events:', error)
        throw error
      }

      if (!events) return []

      const transformedEvents: RallyEvent[] = events
        .filter((e: any) => e.event && e.event.id)
        .map((e: any) => ({
          id: e.id,
          event_name: e.event.name,
          event_order: e.event_order,
          points_multiplier: e.points_multiplier
        }))

      console.log(`✅ Loaded ${transformedEvents.length} events`)
      return transformedEvents
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// MUTATIONS FOR SAVING RESULTS
// ============================================================================

export function useSaveRallyResults() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      rallyId: string
      results: Array<{
        userId: string
        registrationId: string
        overallPosition?: number
        totalPoints: number
        eventResults?: Array<{
          rallyEventId: string
          eventPoints: number
          powerStagePoints?: number
        }>
      }>
    }) => {
      console.log('🔄 Saving rally results...', params)
      
      const { rallyId, results } = params
      
      // Get current user for tracking who entered results
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Save main results
      for (const result of results) {
        // Upsert rally result
        const { error: resultError } = await supabase
          .from('rally_results')
          .upsert({
            rally_id: rallyId,
            user_id: result.userId,
            registration_id: result.registrationId,
            overall_position: result.overallPosition,
            total_points: result.totalPoints,
            results_entered_by: user.id,
            results_entered_at: new Date().toISOString()
          }, {
            onConflict: 'rally_id,user_id'
          })

        if (resultError) {
          console.error('Error saving rally result:', resultError)
          throw resultError
        }

        // Save event results if provided
        if (result.eventResults && result.eventResults.length > 0) {
          const { data: rallyResult } = await supabase
            .from('rally_results')
            .select('id')
            .eq('rally_id', rallyId)
            .eq('user_id', result.userId)
            .single()

          if (rallyResult) {
            for (const eventResult of result.eventResults) {
              const { error: eventError } = await supabase
                .from('event_results')
                .upsert({
                  rally_result_id: rallyResult.id,
                  rally_event_id: eventResult.rallyEventId,
                  event_points: eventResult.eventPoints,
                  power_stage_points: eventResult.powerStagePoints || 0
                }, {
                  onConflict: 'rally_result_id,rally_event_id'
                })

              if (eventError) {
                console.error('Error saving event result:', eventError)
                throw eventError
              }
            }
          }
        }
      }

      // Update rally results status
      const { error: statusError } = await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_needed: true,
          results_completed: true,
          results_completed_at: new Date().toISOString(),
          results_entered_by: user.id
        }, {
          onConflict: 'rally_id'
        })

      if (statusError) {
        console.error('Error updating rally status:', statusError)
        throw statusError
      }

      console.log('✅ Rally results saved successfully')
      return { rallyId, resultCount: results.length }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating results caches...')
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(data.rallyId) })
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_results(data.rallyId) })
      
      console.log('✅ Results saved and caches updated')
    },
    onError: (error) => {
      console.error('❌ Failed to save results:', error)
    }
  })
}