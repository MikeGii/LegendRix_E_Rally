// src/hooks/useTeamRallies.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CompletedRally } from './useResultsManagement'

export function useRalliesWithTeamResults() {
  return useQuery({
    queryKey: ['rallies-with-team-results'],
    queryFn: async (): Promise<CompletedRally[]> => {
      console.log('🔄 Loading rallies with team results...')

      // First, get all rally IDs that have team results
      const { data: teamRallyIds, error: teamError } = await supabase
        .from('team_rally_totals')
        .select('rally_id')
        .not('rally_id', 'is', null)

      if (teamError) {
        console.error('Error loading team rally IDs:', teamError)
        throw teamError
      }

      if (!teamRallyIds || teamRallyIds.length === 0) {
        console.log('No rallies with team results found')
        return []
      }

      // Get unique rally IDs using Array.from instead of spread operator
      const uniqueRallyIds = Array.from(new Set(teamRallyIds.map(r => r.rally_id)))

      // Now fetch the rally details for these rallies that are also approved
      const { data: rallies, error: ralliesError } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          description,
          competition_date,
          status,
          games!inner(name),
          game_types!inner(name),
          rally_results_status!inner(
            results_approved,
            results_completed,
            results_needed_since
          )
        `)
        .in('id', uniqueRallyIds)
        .eq('rally_results_status.results_approved', true)
        .order('competition_date', { ascending: false })

      if (ralliesError) {
        console.error('Error loading rallies with team results:', ralliesError)
        throw ralliesError
      }

      // Get participant counts for each rally
      const rallyIds = rallies?.map(r => r.id) || []
      
      const { data: participantCounts } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed', 'completed'])

      // Count participants per rally
      const countMap = participantCounts?.reduce((acc, reg) => {
        acc[reg.rally_id] = (acc[reg.rally_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Format the rallies to match CompletedRally interface
      const formattedRallies: CompletedRally[] = (rallies || []).map(rally => ({
        id: rally.id,
        name: rally.name,
        description: rally.description,
        competition_date: rally.competition_date,
        participant_count: countMap[rally.id] || 0,
        // Access the first element of the array for single relationships
        game_name: rally.games?.[0]?.name || 'Unknown Game',
        game_type_name: rally.game_types?.[0]?.name || 'Unknown Type',
        // Access rally_results_status array
        results_needed_since: rally.rally_results_status?.[0]?.results_needed_since || rally.competition_date,
        results_completed: rally.rally_results_status?.[0]?.results_completed || false,
        results_approved: rally.rally_results_status?.[0]?.results_approved || false
      }))

      console.log(`✅ Found ${formattedRallies.length} rallies with team results`)
      return formattedRallies
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}