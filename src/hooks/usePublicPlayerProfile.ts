// src/hooks/usePublicPlayerProfile.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUserStatistics } from './useUserStatistics'
import { useUserAchievements } from './useUserAchievements'

export interface PublicPlayerProfile {
  id: string
  player_name: string
  created_at: string
  // Note: We DON'T include sensitive fields like email, name, etc.
}

export function usePublicPlayerProfile(playerName: string) {
  return useQuery({
    queryKey: ['public-player-profile', playerName],
    queryFn: async (): Promise<PublicPlayerProfile | null> => {
      if (!playerName) return null

      console.log('🔄 Loading public player profile for:', playerName)

      // Get user by player_name (public data only)
      const { data: user, error } = await supabase
        .from('users')
        .select('id, player_name, created_at')
        .eq('player_name', playerName)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') { // Not found is ok
          console.error('Error loading public player profile:', error)
        }
        return null
      }

      console.log('✅ Public player profile loaded:', user.player_name)
      return user
    },
    enabled: !!playerName,
    staleTime: 10 * 60 * 1000, // 10 minutes - public profiles don't change often
  })
}