// src/hooks/useChampionshipCompletion.ts - Fixed version with direct table update
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface ChampionshipCompletionResult {
  success: boolean
  message?: string
  error?: string
}

// Hook to complete a championship - Simple direct table update
export function useCompleteChampionship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (championshipId: string): Promise<ChampionshipCompletionResult> => {
      console.log('🔄 Completing championship:', championshipId)

      // Get current user for logging purposes
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      try {
        // Simple direct update to the championships table
        const { data, error } = await supabase
          .from('championships')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: user.id
          })
          .eq('id', championshipId)
          .select()

        if (error) {
          console.error('Error completing championship:', error)
          return {
            success: false,
            error: error.message
          }
        }

        console.log('✅ Championship completed successfully:', data)
        return {
          success: true,
          message: 'Championship marked as completed'
        }
      } catch (err: any) {
        console.error('Error completing championship:', err)
        return {
          success: false,
          error: err.message || 'Failed to complete championship'
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate relevant queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['championships'] })
        queryClient.invalidateQueries({ queryKey: ['championship-results'] })
        
        console.log('🏆 Championship completed and caches invalidated')
      }
    },
    onError: (error) => {
      console.error('❌ Failed to complete championship:', error)
    }
  })
}

// Hook to reopen a championship - Simple direct table update
export function useReopenChampionship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (championshipId: string): Promise<ChampionshipCompletionResult> => {
      console.log('🔄 Reopening championship:', championshipId)

      // Get current user for logging purposes
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      try {
        // Simple direct update to the championships table
        const { data, error } = await supabase
          .from('championships')
          .update({ 
            status: 'ongoing',
            completed_at: null,
            completed_by: null
          })
          .eq('id', championshipId)
          .select()

        if (error) {
          console.error('Error reopening championship:', error)
          return {
            success: false,
            error: error.message
          }
        }

        console.log('✅ Championship reopened successfully:', data)
        return {
          success: true,
          message: 'Championship reopened successfully'
        }
      } catch (err: any) {
        console.error('Error reopening championship:', err)
        return {
          success: false,
          error: err.message || 'Failed to reopen championship'
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate relevant queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['championships'] })
        queryClient.invalidateQueries({ queryKey: ['championship-results'] })
        
        console.log('🔄 Championship reopened and caches invalidated')
      }
    },
    onError: (error) => {
      console.error('❌ Failed to reopen championship:', error)
    }
  })
}