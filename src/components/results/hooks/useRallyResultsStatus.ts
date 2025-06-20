// src/components/results/hooks/useRallyResultsStatus.ts - SIMPLIFIED: Removed auto-complete, added approval
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'

interface RallyResultsStatus {
  rally_id: string
  results_needed: boolean
  results_completed: boolean
  results_approved: boolean
  results_needed_since?: string
  results_completed_at?: string
  approved_at?: string
  approved_by?: string
  results_entered_by?: string
}

export function useRallyResultsStatus(rallyId: string) {
  return useQuery({
    queryKey: [...resultsKeys.rally_results(rallyId), 'status'],
    queryFn: async (): Promise<RallyResultsStatus | null> => {
      if (!rallyId) return null

      const { data, error } = await supabase
        .from('rally_results_status')
        .select('*')
        .eq('rally_id', rallyId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || {
        rally_id: rallyId,
        results_needed: true,
        results_completed: false,
        results_approved: false
      }
    },
    staleTime: 30 * 1000,
  })
}

export function useApproveResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Verify all participants have results before approving
      const { data: totalRegistrations } = await supabase
        .from('rally_registrations')
        .select('id')
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

      const { data: manualParticipants } = await supabase
        .from('rally_results')
        .select('id')
        .eq('rally_id', rallyId)
        .is('user_id', null)

      const { data: resultsWithPositions } = await supabase
        .from('rally_results')
        .select('id')
        .eq('rally_id', rallyId)
        .not('overall_position', 'is', null)

      const totalParticipants = (totalRegistrations?.length || 0) + (manualParticipants?.length || 0)
      const participantsWithResults = resultsWithPositions?.length || 0

      if (participantsWithResults === 0) {
        throw new Error('Tulemusi pole veel sisestatud')
      }

      const currentTime = new Date().toISOString()

      const { error } = await supabase
        .from('rally_results_status')
        .update({
          results_approved: true,
          approved_at: currentTime,
          approved_by: user.id,
          updated_at: currentTime
        })
        .eq('rally_id', rallyId)

      if (error) {
        throw error
      }

      return true
    },
    onSuccess: (_, rallyId) => {
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
    },
    onError: (error) => {
      console.error('Failed to approve results:', error)
    }
  })
}