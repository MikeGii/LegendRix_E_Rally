// src/hooks/useResultsManagement.ts - OPTIMIZED: Clean data loading, proper separation
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
  extra_points: number | null
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
  results_approved: boolean
  game_name: string
  game_type_name: string
}

// Centralized query keys
export const resultsKeys = {
  all: ['results'] as const,
  completed_rallies: () => [...resultsKeys.all, 'completed'] as const,
  approved_rallies: () => [...resultsKeys.all, 'approved'] as const,
  rally_participants: (rallyId: string) => [...resultsKeys.all, 'participants', rallyId] as const,
  rally_events: (rallyId: string) => [...resultsKeys.all, 'events', rallyId] as const,
  rally_results_status: (rallyId: string) => [...resultsKeys.all, 'status', rallyId] as const,
}

/**
 * Get completed rallies that need results (not yet approved)
 */
export function useCompletedRallies() {
  return useQuery({
    queryKey: resultsKeys.completed_rallies(),
    queryFn: async (): Promise<CompletedRally[]> => {
      console.log('🔍 Loading completed rallies (pending results)...')
      
      // Step 1: Get all completed rallies first
      const { data: allCompletedRallies, error: ralliesError } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          description,
          competition_date,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('status', 'completed')
        .eq('is_active', true) // Only active rallies
        .order('competition_date', { ascending: false })

      if (ralliesError) {
        console.error('Error loading rallies:', ralliesError)
        throw ralliesError
      }

      console.log(`📊 Found ${allCompletedRallies?.length || 0} completed rallies`)

      if (!allCompletedRallies || allCompletedRallies.length === 0) {
        return []
      }

      // Step 2: Get ALL rally_results_status entries for debugging
      const { data: allStatuses, error: statusError } = await supabase
        .from('rally_results_status')
        .select('rally_id, results_completed, results_approved')

      console.log('📊 Rally results status data:', allStatuses)
      
      if (statusError) {
        console.error('Error loading rally_results_status:', statusError)
        // If error, assume all rallies need results
        console.warn('⚠️ Could not load rally_results_status, showing all completed rallies')
      }

      // Step 3: Create a Set of approved rally IDs
      const approvedRallyIds = new Set<string>()
      
      if (allStatuses && allStatuses.length > 0) {
        allStatuses.forEach(status => {
          if (status.results_approved === true) {
            approvedRallyIds.add(status.rally_id)
            console.log(`✅ Rally ${status.rally_id} is approved`)
          } else {
            console.log(`⏳ Rally ${status.rally_id} is NOT approved`)
          }
        })
      }

      console.log(`📊 Approved rally IDs: ${Array.from(approvedRallyIds).join(', ')}`)

      // Step 4: Filter out approved rallies
      const pendingRallies = allCompletedRallies.filter(rally => {
        const isApproved = approvedRallyIds.has(rally.id)
        console.log(`Rally "${rally.name}" (${rally.id}): ${isApproved ? 'APPROVED ❌' : 'PENDING ✅'}`)
        return !isApproved // Return true if NOT approved
      })

      console.log(`📊 Filtered to ${pendingRallies.length} pending rallies`)

      if (pendingRallies.length === 0) {
        console.log('ℹ️ No pending rallies found')
        return []
      }

      // Step 5: Get participant counts only for pending rallies
      const pendingRallyIds = pendingRallies.map(r => r.id)
      
      const { data: participantCounts } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', pendingRallyIds)
        .in('status', ['registered', 'confirmed'])

      const counts: Record<string, number> = {}
      participantCounts?.forEach(pc => {
        counts[pc.rally_id] = (counts[pc.rally_id] || 0) + 1
      })

      // Step 6: Get results status for pending rallies only
      const { data: pendingStatuses } = await supabase
        .from('rally_results_status')
        .select('rally_id, results_completed, results_approved')
        .in('rally_id', pendingRallyIds)

      const statusMap: Record<string, any> = {}
      pendingStatuses?.forEach(rs => {
        statusMap[rs.rally_id] = rs
      })

      // Return only pending rallies
      const result = pendingRallies.map((rally: any) => ({
        id: rally.id,
        name: rally.name,
        description: rally.description,
        competition_date: rally.competition_date,
        participant_count: counts[rally.id] || 0,
        results_needed_since: rally.competition_date,
        results_completed: statusMap[rally.id]?.results_completed || false,
        results_approved: statusMap[rally.id]?.results_approved || false,
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type'
      }))

      console.log('✅ Returning pending rallies:', result.map(r => r.name))
      return result
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get approved rallies (for viewing only)
 */
export function useApprovedRallies() {
  return useQuery({
    queryKey: resultsKeys.approved_rallies(),
    queryFn: async (): Promise<CompletedRally[]> => {
      // Get rally IDs with approved results
      const { data: approvedStatuses, error: statusError } = await supabase
        .from('rally_results_status')
        .select('rally_id')
        .eq('results_approved', true)

      if (statusError) throw statusError

      const approvedRallyIds = approvedStatuses?.map(s => s.rally_id) || []
      
      if (approvedRallyIds.length === 0) {
        return []
      }

      // Get rally details
      const { data: rallies, error: ralliesError } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          description,
          competition_date,
          game:games(name),
          game_type:game_types(name)
        `)
        .in('id', approvedRallyIds)
        .order('competition_date', { ascending: false })

      if (ralliesError) throw ralliesError

      // Get participant counts from rally_registrations
      const { data: participantCounts } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', approvedRallyIds)
        .in('status', ['registered', 'confirmed'])

      const counts: Record<string, number> = {}
      participantCounts?.forEach(pc => {
        counts[pc.rally_id] = (counts[pc.rally_id] || 0) + 1
      })

      return (rallies || []).map((rally: any) => ({
        id: rally.id,
        name: rally.name,
        description: rally.description,
        competition_date: rally.competition_date,
        participant_count: counts[rally.id] || 0, // Shows registered participants
        results_needed_since: rally.competition_date,
        results_completed: true,
        results_approved: true,
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type'
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get participants for a specific rally
 */
export function useRallyParticipants(rallyId: string) {
  return useQuery({
    queryKey: resultsKeys.rally_participants(rallyId),
    queryFn: async (): Promise<RallyParticipant[]> => {
      if (!rallyId) return []

      // Get registered participants with their results
      const { data: registeredParticipants, error: registeredError } = await supabase
        .from('rally_registrations')
        .select(`
          id,
          user_id,
          rally_id,
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

      if (registeredError) throw registeredError

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
          extra_points,
          results_entered_at
        `)
        .eq('rally_id', rallyId)
        .is('user_id', null)

      if (manualError) throw manualError

      const allParticipants: RallyParticipant[] = []

      // Process registered participants
      if (registeredParticipants) {
        const userIds = registeredParticipants.map(p => p.user_id)
        let existingResults: any[] = []
        
        if (userIds.length > 0) {
          const { data: results } = await supabase
            .from('rally_results')
            .select('user_id, overall_position, class_position, total_points, extra_points, results_entered_at')
            .eq('rally_id', rallyId)
            .in('user_id', userIds)

          existingResults = results || []
        }

        const resultsMap: Record<string, any> = {}
        existingResults.forEach(r => {
          resultsMap[r.user_id] = r
        })

        registeredParticipants.forEach((p: any) => {
          const result = resultsMap[p.user_id]
          const hasResults = result?.results_entered_at || result?.overall_position !== null
          
          allParticipants.push({
            id: p.id,
            user_id: p.user_id,
            user_name: p.users?.name || '',
            player_name: p.users?.player_name || '',
            user_email: p.users?.email || '',
            class_name: p.game_classes?.name || '',
            registration_date: p.registration_date,
            overall_position: result?.overall_position,
            class_position: result?.class_position,
            total_points: result?.total_points,
            extra_points: result?.extra_points,
            results_entered: !!hasResults
          })
        })
      }

      // Process manual participants
      if (manualParticipants) {
        manualParticipants.forEach(mp => {
          const hasResults = mp.results_entered_at || mp.overall_position !== null
          
          allParticipants.push({
            id: mp.id,
            user_id: null,
            user_name: '',
            player_name: mp.participant_name || '',
            user_email: '',
            class_name: mp.class_name || 'Manual Entry',
            registration_date: '2024-01-01T00:00:00Z',
            overall_position: mp.overall_position,
            class_position: mp.class_position,
            total_points: mp.total_points,
            extra_points: mp.extra_points,
            results_entered: !!hasResults
          })
        })
      }

      return allParticipants
    },
    enabled: !!rallyId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get events for a rally (disabled - not needed for results)
 */
export function useRallyEvents(rallyId: string) {
  return useQuery({
    queryKey: resultsKeys.rally_events(rallyId),
    queryFn: async () => {
      // Disabled - events not needed for results functionality
      return []
    },
    enabled: false, // Disable this query to prevent 400 errors
    staleTime: 5 * 60 * 1000,
  })
}