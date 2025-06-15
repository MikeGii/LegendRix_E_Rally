// src/hooks/useApprovedRallies.ts - Public hook for approved rallies
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ApprovedRally {
  id: string
  name: string
  description?: string
  competition_date: string
  max_participants?: number
  game_name: string
  game_type_name: string
  approved_at: string
  approved_by: string
  total_participants: number
  participants_with_results: number
}

export interface ApprovedRallyResult {
  id: string
  participant_name: string
  user_id?: string
  class_name: string
  overall_position: number
  class_position: number | null  // NEW: Add class_position field
  total_points: number
  registration_date?: string
}

// Hook to get all approved rallies (public access)
export function useApprovedRallies() {
  return useQuery({
    queryKey: ['approved-rallies'],
    queryFn: async (): Promise<ApprovedRally[]> => {
      console.log('🔄 Loading approved rallies for public view...')

      const { data, error } = await supabase
        .from('approved_rallies')
        .select('*')
        .order('competition_date', { ascending: false })

      if (error) {
        console.error('Error loading approved rallies:', error)
        throw error
      }

      console.log(`✅ Loaded ${data?.length || 0} approved rallies`)
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - public data can be cached longer
  })
}

// Hook to get detailed results for a specific approved rally
export function useApprovedRallyResults(rallyId: string) {
  return useQuery({
    queryKey: ['approved-rally-results', rallyId],
    queryFn: async (): Promise<ApprovedRallyResult[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading approved rally results for:', rallyId)

      // First verify this rally is actually approved
      const { data: rallyStatus, error: statusError } = await supabase
        .from('rally_results_status')
        .select('results_approved')
        .eq('rally_id', rallyId)
        .eq('results_approved', true)
        .single()

      if (statusError || !rallyStatus) {
        console.warn('Rally results not approved or not found:', rallyId)
        return []
      }

      // Get all results for this approved rally - INCLUDE class_position
      const { data: results, error } = await supabase
        .from('rally_results')
        .select(`
          id,
          participant_name,
          user_id,
          class_name,
          overall_position,
          class_position,
          total_points,
          rally_registrations(registration_date)
        `)
        .eq('rally_id', rallyId)
        .not('overall_position', 'is', null)
        .order('overall_position', { ascending: true })

      if (error) {
        console.error('Error loading approved rally results:', error)
        throw error
      }

      // Transform data for public view
      const transformedResults: ApprovedRallyResult[] = (results || []).map(result => ({
        id: result.id,
        participant_name: result.participant_name || 'Registered User',
        user_id: result.user_id,
        class_name: result.class_name || 'Unknown Class',
        overall_position: result.overall_position,
        class_position: result.class_position ? parseInt(result.class_position) : null, // CONVERT string to number
        total_points: result.total_points || 0,
        registration_date: result.rally_registrations?.[0]?.registration_date
      }))

      console.log(`✅ Loaded ${transformedResults.length} approved results`)
      return transformedResults
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get rally classes for an approved rally
export function useApprovedRallyClasses(rallyId: string) {
  return useQuery({
    queryKey: ['approved-rally-classes', rallyId],
    queryFn: async (): Promise<string[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading classes for approved rally:', rallyId)

      // First verify this rally is approved
      const { data: rallyStatus } = await supabase
        .from('rally_results_status')
        .select('results_approved')
        .eq('rally_id', rallyId)
        .eq('results_approved', true)
        .single()

      if (!rallyStatus) return []

      // Get unique classes from results
      const { data: results, error } = await supabase
        .from('rally_results')
        .select('class_name')
        .eq('rally_id', rallyId)
        .not('class_name', 'is', null)

      if (error) {
        console.error('Error loading rally classes:', error)
        return []
      }

      const uniqueClasses = Array.from(new Set((results || []).map(r => r.class_name).filter(Boolean)))
      console.log(`✅ Found ${uniqueClasses.length} classes`)
      return uniqueClasses
    },
    enabled: !!rallyId,
    staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
  })
}

// Hook to get statistics for the public leaderboard page
export function useLeaderboardStats() {
  return useQuery({
    queryKey: ['leaderboard-stats'],
    queryFn: async () => {
      console.log('🔄 Loading leaderboard statistics...')

      const { data: stats, error } = await supabase
        .rpc('get_leaderboard_stats')

      if (error) {
        console.error('Error loading leaderboard stats:', error)
        // Return default stats if function doesn't exist
        return {
          total_approved_rallies: 0,
          total_participants: 0,
          latest_rally_date: null
        }
      }

      return stats
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}