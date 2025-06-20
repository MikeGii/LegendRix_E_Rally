// src/hooks/useResultsManagement.ts - FINAL CLEAN VERSION
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface RallyParticipant {
  id: string
  user_id: string | null
  user_name: string
  player_name: string
  user_email: string
  class_name: string
  registration_date: string
  overall_position: number | null
  class_position: number | null
  total_points: number | null
  results_entered: boolean
}

export interface CompletedRally {
  id: string
  name: string
  description?: string
  competition_date: string
  participant_count: number
  results_needed_since: string
  results_completed: boolean
  game_name?: string
  game_type_name?: string
}

export const resultsKeys = {
  all: ['results'] as const,
  completed_rallies: () => [...resultsKeys.all, 'completed'] as const,
  rally_participants: (rallyId: string) => [...resultsKeys.all, 'participants', rallyId] as const,
  rally_events: (rallyId: string) => [...resultsKeys.all, 'events', rallyId] as const,
  rally_results: (rallyId: string) => [...resultsKeys.all, 'rally-results', rallyId] as const,
}

export function useRallyParticipants(rallyId: string) {
  return useQuery({
    queryKey: resultsKeys.rally_participants(rallyId),
    queryFn: async (): Promise<RallyParticipant[]> => {
      if (!rallyId) return []

      // Get registered participants
      const { data: realParticipants, error: registeredError } = await supabase
        .from('rally_registrations')
        .select(`
          id,
          user_id,
          class_id,
          registration_date,
          users!inner(
            id,
            player_name,
            name,
            email
          ),
          game_classes!inner(
            id,
            name
          )
        `)
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

      if (registeredError) {
        throw registeredError
      }

      // Get manual participants
      const { data: manualParticipants, error: manualError } = await supabase
        .from('rally_results')
        .select(`
          id,
          participant_name,
          class_name,
          overall_position,
          class_position,
          total_points,
          results_entered_at
        `)
        .eq('rally_id', rallyId)
        .is('user_id', null)

      if (manualError) {
        throw manualError
      }

      const allParticipants: RallyParticipant[] = []

      // Transform registered participants
      if (realParticipants) {
        const participantUserIds = realParticipants.map(p => p.user_id)
        let existingResults: any[] = []
        
        if (participantUserIds.length > 0) {
          const { data: results, error: resultsError } = await supabase
            .from('rally_results')
            .select('user_id, overall_position, class_position, total_points, results_entered_at')
            .eq('rally_id', rallyId)
            .in('user_id', participantUserIds)

          if (!resultsError) {
            existingResults = results || []
          }
        }

        const resultsMap: Record<string, any> = {}
        existingResults.forEach(r => {
          resultsMap[r.user_id] = r
        })

        realParticipants.forEach((p: any) => {
          const result = resultsMap[p.user_id]
          
          const hasResultsEntered = result?.results_entered_at || 
                                   (result?.overall_position !== null && result?.overall_position !== undefined)
          
          allParticipants.push({
            id: p.id,
            user_id: p.user_id,
            user_name: p.users?.name || '',
            player_name: p.users?.player_name || '',
            user_email: p.users?.email || '',
            class_name: p.game_classes?.name || '',
            registration_date: p.registration_date,
            overall_position: result?.overall_position,
            class_position: result?.class_position ? parseInt(result.class_position) : null,
            total_points: result?.total_points,
            results_entered: !!hasResultsEntered
          })
        })
      }

      // Transform manual participants
      if (manualParticipants) {
        manualParticipants.forEach(mp => {
          const hasResultsEntered = mp.results_entered_at || 
                                   (mp.overall_position !== null && mp.overall_position !== undefined)
          
          allParticipants.push({
            id: mp.id,
            user_id: 'manual-participant',
            user_name: '',
            player_name: mp.participant_name || '',
            user_email: '',
            class_name: mp.class_name || 'Manual Entry',
            registration_date: '2024-01-01T00:00:00Z',
            overall_position: mp.overall_position,
            class_position: mp.class_position ? parseInt(mp.class_position) : null,
            total_points: mp.total_points,
            results_entered: !!hasResultsEntered
          })
        })
      }

      return allParticipants
    },
    enabled: !!rallyId,
    staleTime: 30 * 1000,
  })
}

export function useCompletedRallies() {
  return useQuery({
    queryKey: resultsKeys.completed_rallies(),
    queryFn: async (): Promise<CompletedRally[]> => {
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          description,
          competition_date,
          status,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_active', true)
        .eq('status', 'completed')
        .order('competition_date', { ascending: false })

      if (error) {
        throw error
      }

      if (!rallies || rallies.length === 0) {
        return []
      }

      const rallyIds = rallies.map(rally => rally.id)

      // Get participant counts
      const { data: realParticipants } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed'])

      const { data: manualParticipants } = await supabase
        .from('rally_results')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .is('user_id', null)

      // Count participants per rally
      const counts: Record<string, number> = {}
      rallyIds.forEach(id => counts[id] = 0)
      
      if (realParticipants) {
        realParticipants.forEach(p => {
          counts[p.rally_id] = (counts[p.rally_id] || 0) + 1
        })
      }
      
      if (manualParticipants) {
        manualParticipants.forEach(p => {
          counts[p.rally_id] = (counts[p.rally_id] || 0) + 1
        })
      }

      // Get results status
      const { data: resultsStatus } = await supabase
        .from('rally_results_status')
        .select('rally_id, results_needed_since, results_completed')
        .in('rally_id', rallyIds)

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

      return transformedRallies
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useApprovedRallies() {
  return useQuery({
    queryKey: [...resultsKeys.completed_rallies(), 'approved'],
    queryFn: async (): Promise<CompletedRally[]> => {
      // Get rallies that have results_approved = true
      const { data: approvedStatus, error: statusError } = await supabase
        .from('rally_results_status')
        .select('rally_id')
        .eq('results_approved', true)

      if (statusError) {
        throw statusError
      }

      if (!approvedStatus || approvedStatus.length === 0) {
        return []
      }

      const approvedRallyIds = approvedStatus.map(s => s.rally_id)

      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          description,
          competition_date,
          status,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_active', true)
        .in('id', approvedRallyIds)
        .order('competition_date', { ascending: false })

      if (error) {
        throw error
      }

      if (!rallies || rallies.length === 0) {
        return []
      }

      const rallyIds = rallies.map(rally => rally.id)

      // Get participant counts
      const { data: realParticipants } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed'])

      const { data: manualParticipants } = await supabase
        .from('rally_results')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .is('user_id', null)

      // Count participants per rally
      const counts: Record<string, number> = {}
      rallyIds.forEach(id => counts[id] = 0)
      
      if (realParticipants) {
        realParticipants.forEach(p => {
          counts[p.rally_id] = (counts[p.rally_id] || 0) + 1
        })
      }
      
      if (manualParticipants) {
        manualParticipants.forEach(p => {
          counts[p.rally_id] = (counts[p.rally_id] || 0) + 1
        })
      }

      // Get results status
      const { data: resultsStatus } = await supabase
        .from('rally_results_status')
        .select('rally_id, results_needed_since, results_completed')
        .in('rally_id', rallyIds)

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

      return transformedRallies
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useRallyEvents(rallyId: string) {
  return useQuery({
    queryKey: resultsKeys.rally_events(rallyId),
    queryFn: async () => {
      if (!rallyId) return []

      const { data: events, error } = await supabase
        .from('rally_events')
        .select(`
          id,
          event_order,
          is_active
        `)
        .eq('rally_id', rallyId)
        .eq('is_active', true)
        .order('event_order', { ascending: true })

      if (error) {
        return []
      }

      return events || []
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}