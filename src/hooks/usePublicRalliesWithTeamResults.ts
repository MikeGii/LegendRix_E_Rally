// src/hooks/usePublicRalliesWithTeamResults.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface PublicRallyWithTeams {
  id: string
  name: string
  competition_date: string
  game_name: string
  game_type_name: string
  team_count: number
}

export function usePublicRalliesWithTeamResults() {
  return useQuery({
    queryKey: ['public-rallies-with-team-results'],
    queryFn: async (): Promise<PublicRallyWithTeams[]> => {
      console.log('🔄 Loading public rallies with team results...')

      // Step 1: Get rally IDs that have team results
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

      // Get unique rally IDs
      const uniqueRallyIds = Array.from(new Set(teamRallyIds.map(r => r.rally_id)))

      // Step 2: Get rallies that are both approved AND public
      const { data: publicRallyStatus, error: statusError } = await supabase
        .from('rally_results_status')
        .select('rally_id')
        .eq('results_approved', true)
        .eq('is_public', true)
        .in('rally_id', uniqueRallyIds)

      if (statusError) {
        console.error('Error loading public rally status:', statusError)
        throw statusError
      }

      if (!publicRallyStatus || publicRallyStatus.length === 0) {
        console.log('No public rallies with team results found')
        return []
      }

      const publicRallyIds = publicRallyStatus.map(status => status.rally_id)

      // Step 3: Get rally details from approved_rallies view
      const { data: rallies, error: ralliesError } = await supabase
        .from('approved_rallies')
        .select('*')
        .in('id', publicRallyIds)
        .order('competition_date', { ascending: false })

      if (ralliesError) {
        console.error('Error loading public rallies with team results:', ralliesError)
        throw ralliesError
      }

      // Step 4: Get team counts for each rally
      const { data: teamCounts, error: countError } = await supabase
        .from('team_rally_totals')
        .select('rally_id, team_id')
        .in('rally_id', publicRallyIds)

      if (countError) {
        console.error('Error loading team counts:', countError)
        // Continue without team counts
      }

      // Count unique teams per rally
      const teamCountMap: Record<string, Set<string>> = {}
      if (teamCounts) {
        teamCounts.forEach(tc => {
          if (!teamCountMap[tc.rally_id]) {
            teamCountMap[tc.rally_id] = new Set<string>()
          }
          teamCountMap[tc.rally_id].add(tc.team_id)
        })
      }

      // Format the rallies
      const formattedRallies: PublicRallyWithTeams[] = (rallies || []).map(rally => ({
        id: rally.id,
        name: rally.name,
        competition_date: rally.competition_date,
        game_name: rally.game_name,
        game_type_name: rally.game_type_name,
        team_count: teamCountMap[rally.id]?.size || 0
      }))

      console.log(`✅ Found ${formattedRallies.length} public rallies with team results`)
      return formattedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}