// src/hooks/usePublicPlayerProfile.ts - SECURE VERSION
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface PublicPlayerProfile {
  id: string
  player_name: string
  created_at: string
  // Note: We DON'T include sensitive fields like email, name, etc.
}

// SECURITY: Load profile by userId instead of playerName
export function usePublicPlayerProfile(userId: string) {
  return useQuery({
    queryKey: ['public-player-profile', userId],
    queryFn: async (): Promise<PublicPlayerProfile | null> => {
      if (!userId) return null

      console.log('🔄 Loading public player profile for userId:', userId)

      // Get user by ID (secure - no name collision possible)
      const { data: user, error } = await supabase
        .from('users')
        .select('id, player_name, created_at')
        .eq('id', userId)
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
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - public profiles don't change often
  })
}