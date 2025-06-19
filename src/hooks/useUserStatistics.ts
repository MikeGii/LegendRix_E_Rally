// src/hooks/useUserStatistics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface UserStatisticsData {
  // Participation stats
  trainings: number
  regularRallies: number
  championshipRallies: number
  totalParticipations: number
  // Achievement stats
  championshipTitles: number
  rallyWins: number
  podiumFinishes: number
  // Metadata
  lastCalculatedAt?: string
}

export interface UserChampionshipTitle {
  id: string
  user_id: string
  championship_id: string
  class_id: string
  final_position: number
  total_points: number
  rounds_participated: number
  is_completed: boolean
  awarded_at?: string
  championship_name?: string
  class_name?: string
  season_year?: number
}

// Query keys for caching
export const userStatsKeys = {
  all: ['user-statistics'] as const,
  user: (userId: string) => [...userStatsKeys.all, userId] as const,
  cache: (userId: string) => [...userStatsKeys.user(userId), 'cache'] as const,
  live: (userId: string) => [...userStatsKeys.user(userId), 'live'] as const,
  titles: (userId: string) => [...userStatsKeys.user(userId), 'titles'] as const,
}

// ============================================================================
// GET USER STATISTICS (FROM CACHE)
// ============================================================================
export function useUserStatistics(userId: string, options?: { 
  useCache?: boolean 
  fallbackToLive?: boolean 
}) {
  const { useCache = true, fallbackToLive = true } = options || {}

  return useQuery({
    queryKey: useCache ? userStatsKeys.cache(userId) : userStatsKeys.live(userId),
    queryFn: async (): Promise<UserStatisticsData> => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      console.log(`🔄 Loading user statistics for: ${userId}`, { useCache, fallbackToLive })

      // Try cache first if enabled
      if (useCache) {
        const { data: cacheData, error: cacheError } = await supabase
          .from('user_statistics_cache')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!cacheError && cacheData) {
          console.log('✅ Retrieved statistics from cache')
          return {
            trainings: cacheData.trainings_count || 0,
            regularRallies: cacheData.regular_rallies_count || 0,
            championshipRallies: cacheData.championship_rallies_count || 0,
            totalParticipations: cacheData.total_participations || 0,
            championshipTitles: cacheData.championship_titles_count || 0,
            rallyWins: cacheData.rally_wins_count || 0,
            podiumFinishes: cacheData.podium_finishes_count || 0,
            lastCalculatedAt: cacheData.last_calculated_at
          }
        }

        console.log('⚠️ Cache miss or error, checking fallback options')
      }

      // Fallback to live calculation or throw error
      if (fallbackToLive) {
        console.log('🔄 Falling back to live calculation...')
        return calculateLiveStatistics(userId)
      } else {
        throw new Error('Statistics not available in cache')
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache is usually fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ============================================================================
// GET LIVE STATISTICS (REAL-TIME CALCULATION)
// ============================================================================
export function useUserStatisticsLive(userId: string) {
  return useQuery({
    queryKey: userStatsKeys.live(userId),
    queryFn: () => calculateLiveStatistics(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute - live data changes more frequently
  })
}

// Helper function for live statistics calculation (FIXED FOR ACTUAL SCHEMA)
async function calculateLiveStatistics(userId: string): Promise<UserStatisticsData> {
  console.log('🔄 Calculating live statistics for user:', userId)

  try {
    // Use the database function for optimized calculation
    const { data, error } = await supabase
      .rpc('calculate_user_statistics', { target_user_id: userId })

    if (error) {
      console.error('Error calling calculate_user_statistics function:', error)
      // Fallback to manual calculation if function doesn't exist yet
      return calculateManualStatistics(userId)
    }

    console.log('✅ Live statistics calculated:', data)
    
    return {
      trainings: data?.trainings || 0,
      regularRallies: data?.regular_rallies || 0,
      championshipRallies: data?.championship_rallies || 0,
      totalParticipations: data?.total_participations || 0,
      championshipTitles: data?.championship_titles || 0,
      rallyWins: data?.rally_wins || 0,
      podiumFinishes: data?.podium_finishes || 0,
    }
  } catch (error) {
    console.error('Error calculating live statistics:', error)
    // Fallback to manual calculation
    return calculateManualStatistics(userId)
  }
}

// Fallback manual calculation with correct schema
async function calculateManualStatistics(userId: string): Promise<UserStatisticsData> {
  console.log('🔄 Using manual statistics calculation fallback')

  // Get rally participations with game types
  const { data: participations, error: participationError } = await supabase
    .from('rally_registrations')
    .select(`
      id,
      user_id,
      rally_id,
      status,
      rallies!inner (
        id,
        name,
        game_type_id,
        status,
        game_types!inner (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .in('status', ['registered', 'confirmed'])

  if (participationError) {
    console.error('Error fetching participations:', participationError)
    throw participationError
  }

  // Get rally results with game types and approval status
  const { data: rallyResults, error: resultsError } = await supabase
    .from('rally_results')
    .select(`
      id,
      user_id,
      rally_id,
      overall_position,
      class_position,
      rallies!inner (
        game_type_id,
        game_types!inner (
          name
        )
      ),
      rally_results_status!inner (
        results_approved
      )
    `)
    .eq('user_id', userId)
    .not('overall_position', 'is', null)

  if (resultsError) {
    console.error('Error fetching rally results:', resultsError)
    // Don't throw, just proceed without results
  }

  // Get championship titles (if table exists)
  let championshipTitles: any[] = []
  try {
    const { data: titles } = await supabase
    .from('user_championship_titles')
    .select(`
        *,
        championships!inner(status)
    `)
    .eq('user_id', userId)
    .eq('is_completed', true)
    .eq('final_position', 1)  // ✅ FIXED: Only 1st place wins

    // ✅ FIXED: Filter only completed championships
    const completedChampionshipWins = (titles || []).filter(title => 
    (title.championships as any)?.status === 'completed'
    )

    championshipTitles = completedChampionshipWins
  } catch (error) {
    console.log('Championship titles table not available yet')
  }

  // Calculate statistics
  const stats: UserStatisticsData = {
    trainings: 0,
    regularRallies: 0,
    championshipRallies: 0,
    totalParticipations: 0,
    championshipTitles: 0,
    rallyWins: 0,
    podiumFinishes: 0
  }

  // Process participations
  participations?.forEach((participation: any) => {
    const gameTypeName = participation.rallies?.game_types?.name
    
    if (gameTypeName === 'Treening') {
      stats.trainings++
    } else if (gameTypeName === 'Meistrivõistlused') {
      stats.championshipRallies++
    } else {
      stats.regularRallies++
    }
  })

  // Process rally results
  rallyResults?.forEach((result: any) => {
    const gameTypeName = result.rallies?.game_types?.name
    const resultsApproved = result.rally_results_status?.results_approved || false
    const position = result.overall_position

    // Count total participations (approved results only)
    if (resultsApproved) {
      stats.totalParticipations++
    }

    // Count wins and podiums (only for non-training events with approved results)
    if (resultsApproved && gameTypeName !== 'Treening' && position) {
      if (position === 1) {
        stats.rallyWins++
        stats.podiumFinishes++
      } else if (position >= 2 && position <= 3) {
        stats.podiumFinishes++
      }
    }
  })

  // Count championship titles
  stats.championshipTitles = championshipTitles.length

  console.log('✅ Manual statistics calculated:', stats)
  return stats
}

// ============================================================================
// GET USER CHAMPIONSHIP TITLES
// ============================================================================
export function useUserChampionshipTitles(userId: string) {
  return useQuery({
    queryKey: userStatsKeys.titles(userId),
    queryFn: async (): Promise<UserChampionshipTitle[]> => {
      if (!userId) return []

      console.log('🔄 Loading championship titles for user:', userId)

      const { data, error } = await supabase
        .from('user_championship_titles')
        .select(`
          *,
          championships!inner(name, season_year),
          game_classes!inner(name)
        `)
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('awarded_at', { ascending: false })

      if (error) {
        console.error('Error loading championship titles:', error)
        throw error
      }

      const titles = (data || []).map(title => ({
        ...title,
        championship_name: (title.championships as any)?.name,
        season_year: (title.championships as any)?.season_year,
        class_name: (title.game_classes as any)?.name,
      }))

      console.log(`✅ Loaded ${titles.length} championship titles`)
      return titles
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - titles don't change often
  })
}

// ============================================================================
// UPDATE STATISTICS CACHE
// ============================================================================
export function useUpdateUserStatistics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔄 Updating statistics cache for user:', userId)

      const { error } = await supabase
        .rpc('update_user_statistics_cache', { target_user_id: userId })

      if (error) {
        console.error('Error updating statistics cache:', error)
        throw error
      }

      console.log('✅ Statistics cache updated successfully')
      return true
    },
    onSuccess: (_, userId) => {
      // Invalidate all statistics queries for this user
      queryClient.invalidateQueries({ queryKey: userStatsKeys.user(userId) })
      console.log('🔄 Invalidated statistics cache for user:', userId)
    },
    onError: (error) => {
      console.error('❌ Failed to update statistics cache:', error)
    }
  })
}

// ============================================================================
// AWARD CHAMPIONSHIP TITLE (ADMIN ONLY)
// ============================================================================
export function useAwardChampionshipTitle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (titleData: {
      user_id: string
      championship_id: string
      class_id: string
      final_position: number
      total_points?: number
      rounds_participated?: number
    }) => {
      console.log('🔄 Awarding championship title:', titleData)

      const { data, error } = await supabase
        .from('user_championship_titles')
        .insert([{
          ...titleData,
          is_completed: true,
          awarded_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error awarding championship title:', error)
        throw error
      }

      console.log('✅ Championship title awarded:', data.id)
      return data
    },
    onSuccess: (data) => {
      // Invalidate statistics for the user
      queryClient.invalidateQueries({ queryKey: userStatsKeys.user(data.user_id) })
      console.log('🏆 Championship title awarded and cache invalidated')
    },
    onError: (error) => {
      console.error('❌ Failed to award championship title:', error)
    }
  })
}

// ============================================================================
// BULK UPDATE ALL USER STATISTICS
// ============================================================================
export function useBulkUpdateAllStatistics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting bulk statistics update for all users...')

      // Get all user IDs
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')

      if (usersError) {
        console.error('Error fetching users for bulk update:', usersError)
        throw usersError
      }

      console.log(`🔄 Updating statistics for ${users?.length || 0} users...`)

      // Update statistics for each user
      const updatePromises = (users || []).map(user => 
        supabase.rpc('update_user_statistics_cache', { target_user_id: user.id })
      )

      const results = await Promise.allSettled(updatePromises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      console.log(`✅ Bulk update complete: ${successful} successful, ${failed} failed`)
      
      return { successful, failed, total: users?.length || 0 }
    },
    onSuccess: (results) => {
      // Invalidate all user statistics
      queryClient.invalidateQueries({ queryKey: userStatsKeys.all })
      console.log('🔄 Bulk statistics update completed:', results)
    },
    onError: (error) => {
      console.error('❌ Bulk statistics update failed:', error)
    }
  })
}
