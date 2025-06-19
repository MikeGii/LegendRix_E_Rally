// src/hooks/useChampionshipCompletion.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ChampionshipCompletionResult {
  success: boolean
  message?: string
  error?: string
}

// Hook to complete a championship
export function useCompleteChampionship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (championshipId: string): Promise<ChampionshipCompletionResult> => {
      console.log('🔄 Completing championship:', championshipId)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      // Call the database function
      const { data, error } = await supabase.rpc('complete_championship', {
        championship_id: championshipId,
        admin_user_id: user.id
      })

      if (error) {
        console.error('Error completing championship:', error)
        throw error
      }

      console.log('✅ Championship completion result:', data)
      return data
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['championships'] })
        queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
        queryClient.invalidateQueries({ queryKey: ['championship-results'] })
        
        console.log('🏆 Championship completed and caches invalidated')
      }
    },
    onError: (error) => {
      console.error('❌ Failed to complete championship:', error)
    }
  })
}

// Hook to reopen a championship
export function useReopenChampionship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (championshipId: string): Promise<ChampionshipCompletionResult> => {
      console.log('🔄 Reopening championship:', championshipId)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      // Call the database function
      const { data, error } = await supabase.rpc('reopen_championship', {
        championship_id: championshipId,
        admin_user_id: user.id
      })

      if (error) {
        console.error('Error reopening championship:', error)
        throw error
      }

      console.log('✅ Championship reopen result:', data)
      return data
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['championships'] })
        queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
        queryClient.invalidateQueries({ queryKey: ['championship-results'] })
        
        console.log('🔄 Championship reopened and caches invalidated')
      }
    },
    onError: (error) => {
      console.error('❌ Failed to reopen championship:', error)
    }
  })
}