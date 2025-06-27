// src/hooks/usePlayerTeam.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface PlayerTeam {
  team_name: string
  vehicle_name?: string
  class_name?: string
}

// Hook to fetch team data for any player
export function usePlayerTeam(userId: string) {
  return useQuery({
    queryKey: ['player-team', userId],
    queryFn: async (): Promise<PlayerTeam | null> => {
      if (!userId) return null

      console.log('🔄 Loading team data for userId:', userId)

      // First get the team membership
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .single()

      if (membershipError || !membership) {
        console.log('ℹ️ No team membership found for user:', userId)
        return null
      }

      // Then get the full team data with vehicle and class info
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select(`
          team_name,
          vehicle:game_vehicles!teams_vehicle_id_fkey(
            vehicle_name
          ),
          game_class:game_classes!teams_class_id_fkey(
            name
          )
        `)
        .eq('id', membership.team_id)
        .single()

      if (teamError || !team) {
        console.error('Error fetching team:', teamError)
        return null
      }

      console.log('✅ Team data loaded for player:', team)

      // Handle the case where vehicle and game_class might be arrays
      const vehicle = Array.isArray(team.vehicle) ? team.vehicle[0] : team.vehicle
      const gameClass = Array.isArray(team.game_class) ? team.game_class[0] : team.game_class

      return {
        team_name: team.team_name,
        vehicle_name: vehicle?.vehicle_name,
        class_name: gameClass?.name
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  })
}