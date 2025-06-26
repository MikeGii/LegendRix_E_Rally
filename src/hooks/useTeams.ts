// src/hooks/useTeams.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

// Query keys for teams
export const teamKeys = {
  all: ['teams'] as const,
  userTeamStatus: (userId: string) => [...teamKeys.all, 'user-status', userId] as const,
}

// Hook to check if user has a team
export function useUserTeamStatus() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: teamKeys.userTeamStatus(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) {
        return { hasTeam: false }
      }

      console.log('🔄 Checking team status for user:', user.id)
      
      const { data, error } = await supabase
        .from('users')
        .select('has_team')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching team status:', error)
        throw error
      }

      console.log('✅ Team status:', data?.has_team)
      
      return {
        hasTeam: data?.has_team || false
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  })
}