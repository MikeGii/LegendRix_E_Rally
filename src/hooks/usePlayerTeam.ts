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

      try {
        // First get the team membership with better error handling
        const { data: membership, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId)
          .eq('status', 'approved')
          .maybeSingle() // Use maybeSingle instead of single to avoid errors when no rows

        // If no membership found or error, return null silently
        if (membershipError || !membership) {
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
          return null
        }

        // Handle the case where vehicle and game_class might be arrays
        const vehicle = Array.isArray(team.vehicle) ? team.vehicle[0] : team.vehicle
        const gameClass = Array.isArray(team.game_class) ? team.game_class[0] : team.game_class

        return {
          team_name: team.team_name,
          vehicle_name: vehicle?.vehicle_name,
          class_name: gameClass?.name
        }
      } catch (error) {
        // Silently handle any unexpected errors
        return null
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // Cache for 30 seconds
    retry: false, // Don't retry failed requests
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  })
}