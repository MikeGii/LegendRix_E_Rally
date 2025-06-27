// src/hooks/useTeamRallyResults.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Types
export interface TeamRallyResult {
  rally_id: string
  rally_name: string
  team_id: string
  team_name: string
  class_id: string
  class_name: string
  is_approved: boolean
  team_total_points: number
  top_scorers: Array<{
    user_id: string
    player_name: string
    points: number
    rank: number
  }>
  participating_members: number
  scoring_members: number
  class_position: number
  overall_position: number
}

// Hook to fetch team results for a specific rally
export function useTeamRallyResults(rallyId: string) {
  return useQuery({
    queryKey: ['team-rally-results', rallyId],
    queryFn: async (): Promise<TeamRallyResult[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading team results for rally:', rallyId)

      const { data, error } = await supabase
        .from('team_rally_totals')
        .select('*')
        .eq('rally_id', rallyId)
        .order('class_name', { ascending: true })
        .order('class_position', { ascending: true })

      if (error) {
        console.error('Error loading team rally results:', error)
        throw error
      }

      console.log(`✅ Team results loaded: ${data?.length || 0} teams`)
      return data || []
    },
    enabled: !!rallyId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  })
}

// Hook to fetch team results by class
export function useTeamRallyResultsByClass(rallyId: string, classId?: string) {
  return useQuery({
    queryKey: ['team-rally-results-by-class', rallyId, classId],
    queryFn: async (): Promise<TeamRallyResult[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading team results for rally/class:', rallyId, classId)

      let query = supabase
        .from('team_rally_totals')
        .select('*')
        .eq('rally_id', rallyId)

      if (classId) {
        query = query.eq('class_id', classId)
      }

      const { data, error } = await query.order('team_total_points', { ascending: false })

      if (error) {
        console.error('Error loading team rally results by class:', error)
        throw error
      }

      return data || []
    },
    enabled: !!rallyId,
    staleTime: 30 * 1000,
  })
}

// Hook to fetch approved team results only
export function useApprovedTeamRallyResults(rallyId: string) {
  return useQuery({
    queryKey: ['approved-team-rally-results', rallyId],
    queryFn: async (): Promise<TeamRallyResult[]> => {
      if (!rallyId) return []

      const { data, error } = await supabase
        .from('team_rally_totals')
        .select('*')
        .eq('rally_id', rallyId)
        .eq('is_approved', true)
        .order('overall_position', { ascending: true })

      if (error) {
        console.error('Error loading approved team results:', error)
        throw error
      }

      return data || []
    },
    enabled: !!rallyId,
    staleTime: 30 * 1000,
  })
}

// Hook to get team's rally history
export function useTeamRallyHistory(teamId: string) {
  return useQuery({
    queryKey: ['team-rally-history', teamId],
    queryFn: async (): Promise<TeamRallyResult[]> => {
      if (!teamId) return []

      const { data, error } = await supabase
        .from('team_rally_totals')
        .select('*')
        .eq('team_id', teamId)
        .order('rally_id', { ascending: false })

      if (error) {
        console.error('Error loading team rally history:', error)
        throw error
      }

      return data || []
    },
    enabled: !!teamId,
    staleTime: 60 * 1000, // Cache for 1 minute
  })
}