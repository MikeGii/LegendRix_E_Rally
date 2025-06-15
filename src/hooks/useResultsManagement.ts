// src/hooks/useResultsManagement.ts - CLEAN VERSION without any debug functionality

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

      // Get participant counts from both real registrations and manual participants
      const { data: realParticipants, error: realParticipantsError } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed'])

      if (realParticipantsError) {
        console.error('Error loading participant counts:', realParticipantsError)
      }

      // Try to get manual participants count (gracefully handle if table doesn't exist)
      let manualParticipants: any[] = []
      try {
        const { data: manualData, error: manualError } = await supabase
          .from('rally_results')
          .select('rally_id')
          .in('rally_id', rallyIds)
          .is('user_id', null)

        if (!manualError && manualData) {
          manualParticipants = manualData
        }
      } catch (error) {
        console.log('Manual participants table not available')
      }

      // Count participants per rally
      const counts: Record<string, number> = {}
      rallyIds.forEach(id => counts[id] = 0)
      
      if (realParticipants) {
        realParticipants.forEach(p => {
          counts[p.rally_id] = (counts[p.rally_id] || 0) + 1
        })
      }
      
      manualParticipants.forEach(p => {
        counts[p.rally_id] = (counts[p.rally_id] || 0) + 1
      })

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

      console.log(`✅ Loaded ${transformedRallies.length} completed rallies`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// GET RALLY PARTICIPANTS (real registrations + manual participants)
// ============================================================================

// Fixed useRallyParticipants function in useResultsManagement.ts
// Replace the manual participants loading section

export function useRallyParticipants(rallyId: string) {
  return useQuery({
    queryKey: resultsKeys.rally_participants(rallyId),
    queryFn: async (): Promise<RallyParticipant[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading participants for rally:', rallyId)

      // Get real participants from rally_registrations
      const { data: realParticipants, error: realError } = await supabase
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

      if (realError) {
        console.error('Error loading rally participants:', realError)
        throw realError
      }

      // Get manual participants from rally_results
      let manualParticipants: any[] = []
      try {
        const { data: manualData, error: manualError } = await supabase
          .from('rally_results')
          .select(`
            id,
            participant_name,
            class_name,
            overall_position,
            total_points,
            user_id,
            results_entered_at
          `)
          .eq('rally_id', rallyId)
          .is('user_id', null)
          .not('participant_name', 'is', null)

        if (manualError) {
          console.log('Note: No manual participants found:', manualError.message)
        } else {
          manualParticipants = manualData || []
          console.log(`🔍 Found ${manualParticipants.length} manual participants`)
        }
      } catch (error) {
        console.log('Manual participants query failed:', error)
      }

      const allParticipants: RallyParticipant[] = []

      // Transform real participants
      if (realParticipants) {
        const participantUserIds = realParticipants.map(p => p.user_id)
        let existingResults: any[] = []
        
        if (participantUserIds.length > 0) {
          // Get results with all fields needed
          const { data: results, error: resultsError } = await supabase
            .from('rally_results')
            .select('user_id, overall_position, total_points, results_entered_at')
            .eq('rally_id', rallyId)
            .in('user_id', participantUserIds)

          if (resultsError) {
            console.error('Error loading existing results:', resultsError)
          } else {
            existingResults = results || []
          }
        }

        const resultsMap: Record<string, any> = {}
        existingResults.forEach(r => {
          resultsMap[r.user_id] = r
        })

        // Transform real participants
        realParticipants.forEach((p: any) => {
          const result = resultsMap[p.user_id]
          
          // FIXED: Backward compatible logic - if results_entered_at is missing but overall_position exists,
          // consider results as entered (for existing data)
          const hasResultsEntered = result?.results_entered_at || 
                                   (result?.overall_position !== null && result?.overall_position !== undefined)
          
          allParticipants.push({
            id: p.id,
            user_id: p.user_id,
            user_name: '',
            player_name: p.users.player_name,
            user_email: '',
            class_name: p.game_classes.name,
            registration_date: p.registration_date,
            overall_position: result?.overall_position,
            total_points: result?.total_points,
            results_entered: !!hasResultsEntered
          })
        })
      }

      // Transform manual participants with backward compatibility
      manualParticipants.forEach(mp => {
        const hasResultsEntered = mp.results_entered_at || 
                                 (mp.overall_position !== null && mp.overall_position !== undefined)
        
        allParticipants.push({
          id: mp.id,
          user_id: 'manual-participant',
          user_name: '',
          player_name: mp.participant_name,
          user_email: '',
          class_name: mp.class_name || 'Manual Entry',
          registration_date: '2024-01-01T00:00:00Z',
          overall_position: mp.overall_position,
          total_points: mp.total_points,
          results_entered: !!hasResultsEntered
        })
      })

      // Sort by overall position (nulls last), then by name
      allParticipants.sort((a, b) => {
        if (a.overall_position && b.overall_position) {
          return a.overall_position - b.overall_position
        }
        if (a.overall_position && !b.overall_position) return -1
        if (!a.overall_position && b.overall_position) return 1
        return (a.player_name || a.user_name).localeCompare(b.player_name || b.user_name)
      })

      console.log(`✅ Loaded ${allParticipants.length} participants`)
      // Log participants with results for debugging
      const withResults = allParticipants.filter(p => p.results_entered)
      console.log(`📊 ${withResults.length}/${allParticipants.length} participants have results entered`)
      
      return allParticipants
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
          results_completed: true,
          completed_by: user.id,
          completed_at: new Date().toISOString()
        })

      if (statusError) {
        console.error('Error updating rally results status:', statusError)
        throw statusError
      }

      return results.length
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(variables.rallyId) })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_results(variables.rallyId) })
    }
  })
}