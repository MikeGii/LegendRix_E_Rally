// src/components/results/hooks/useRallyResultsStatus.ts - COMPLETE: Both status and approval functionality
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'

export interface RallyResultsStatus {
  rally_id: string
  results_needed_since: string
  results_completed: boolean
  results_approved: boolean
  approved_at?: string
  approved_by?: string
}

/**
 * Get results status for a specific rally
 */
export function useRallyResultsStatus(rallyId: string) {
  return useQuery({
    queryKey: resultsKeys.rally_results_status(rallyId),
    queryFn: async (): Promise<RallyResultsStatus | null> => {
      if (!rallyId) return null

      const { data, error } = await supabase
        .from('rally_results_status')
        .select('*')
        .eq('rally_id', rallyId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data || {
        rally_id: rallyId,
        results_needed_since: new Date().toISOString(),
        results_completed: false,
        results_approved: false
      }
    },
    enabled: !!rallyId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Approve results for a rally - FIXED: Proper update/insert logic
 */
export function useApproveResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Kasutaja pole autentitud')
      }

      // Verify rally exists and is completed
      const { data: rally, error: rallyError } = await supabase
        .from('rallies')
        .select('id, name, status')
        .eq('id', rallyId)
        .single()

      if (rallyError || !rally || rally.status !== 'completed') {
        throw new Error('Rally peab olema lõppenud enne tulemuste kinnitamist')
      }

      // Check if there are results to approve
      const { data: allResults, error: resultsError } = await supabase
        .from('rally_results')
        .select('id, overall_position, total_points, extra_points')
        .eq('rally_id', rallyId)

      if (resultsError || !allResults || allResults.length === 0) {
        throw new Error('Rallis pole osalejaid')
      }

      const hasAnyResults = allResults.some(result => 
        result.overall_position !== null || 
        (result.total_points !== null && result.total_points > 0) ||
        (result.extra_points !== null && result.extra_points > 0)
      )

      if (!hasAnyResults) {
        throw new Error('Tulemusi pole veel sisestatud. Sisestage enne kinnitamist vähemalt mõned tulemused.')
      }

      // REMOVE ALL THE TEAM RESULTS POPULATION CODE - IT'S NOT NEEDED

      // KEEP YOUR EXISTING STATUS UPDATE CODE
      const { data: existingStatus, error: checkError } = await supabase
        .from('rally_results_status')
        .select('rally_id')
        .eq('rally_id', rallyId)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Error checking status: ${checkError.message}`)
      }

      const statusData = {
        results_approved: true,
        results_completed: true,
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        updated_at: new Date().toISOString()
      }

      if (existingStatus) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('rally_results_status')
          .update(statusData)
          .eq('rally_id', rallyId)

        if (updateError) {
          throw new Error(`Kinnitamine ebaõnnestus: ${updateError.message}`)
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('rally_results_status')
          .insert({
            rally_id: rallyId,
            results_needed_since: new Date().toISOString(),
            ...statusData
          })

        if (insertError) {
          throw new Error(`Kinnitamine ebaõnnestus: ${insertError.message}`)
        }
      }

      return true
    },
    onSuccess: (_, rallyId) => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_results_status(rallyId) })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      queryClient.invalidateQueries({ queryKey: resultsKeys.approved_rallies() })
      queryClient.invalidateQueries({ queryKey: ['rallies-with-team-results'] })
      queryClient.invalidateQueries({ queryKey: ['team-rally-results'] })
      queryClient.invalidateQueries({ queryKey: ['team-rally-totals'] })
    },
    onError: (error: any) => {
      console.error('Tulemuste kinnitamine ebaõnnestus:', error)
    }
  })
}