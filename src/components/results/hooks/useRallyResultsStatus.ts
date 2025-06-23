// src/components/results/hooks/useRallyResultsStatus.ts - FIXED: Proper upsert logic
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'

export interface RallyResultsStatus {
  rally_id: string
  results_needed: boolean
  results_needed_since?: string
  results_completed: boolean
  results_completed_at?: string
  results_approved: boolean
  approved_at?: string
  approved_by?: string
  results_entered_by?: string
}

export function useRallyResultsStatus(rallyId: string) {
  return useQuery({
    queryKey: [...resultsKeys.rally_results(rallyId), 'status'],
    queryFn: async (): Promise<RallyResultsStatus | null> => {
      if (!rallyId) return null

      try {
        console.log('🔍 Fetching rally results status for:', rallyId)

        const { data, error } = await supabase
          .from('rally_results_status')
          .select('*')
          .eq('rally_id', rallyId)
          .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

        if (error) {
          console.error('❌ Rally results status error:', error)
          
          // Handle specific error codes
          if (error.code === 'PGRST116') {
            // No rows found - create default status
            console.log('📝 No status found, creating default status')
            return {
              rally_id: rallyId,
              results_needed: true,
              results_completed: false,
              results_approved: false
            }
          }
          
          // For 406 errors or other issues, try to create the status record
          if (error.message.includes('406') || error.message.includes('Not Acceptable')) {
            console.warn('⚠️ 406 error detected, attempting to create status record')
            
            try {
              // Try to create a new status record
              const { data: newStatus, error: createError } = await supabase
                .from('rally_results_status')
                .insert({
                  rally_id: rallyId,
                  results_needed: true,
                  results_completed: false,
                  results_approved: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single()

              if (createError) {
                console.error('❌ Failed to create status record:', createError)
                // Return default status instead of throwing
                return {
                  rally_id: rallyId,
                  results_needed: true,
                  results_completed: false,
                  results_approved: false
                }
              }

              console.log('✅ Created new status record:', newStatus)
              return newStatus
            } catch (createError) {
              console.error('❌ Error creating status record:', createError)
              // Still return default status
              return {
                rally_id: rallyId,
                results_needed: true,
                results_completed: false,
                results_approved: false
              }
            }
          }
          
          // For other errors, log but don't throw
          console.warn('⚠️ Database error, using default status:', error)
          return {
            rally_id: rallyId,
            results_needed: true,
            results_completed: false,
            results_approved: false
          }
        }

        // If we got data, return it
        if (data) {
          console.log('✅ Rally results status loaded:', data)
          return data
        }

        // No data and no error - return default
        console.log('📝 No status data, returning default')
        return {
          rally_id: rallyId,
          results_needed: true,
          results_completed: false,
          results_approved: false
        }

      } catch (error) {
        console.error('❌ Unexpected error in rally results status:', error)
        // Always return a default status instead of throwing
        return {
          rally_id: rallyId,
          results_needed: true,
          results_completed: false,
          results_approved: false
        }
      }
    },
    staleTime: 30 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 406 errors or similar HTTP errors
      if (error?.message?.includes('406') || 
          error?.message?.includes('Not Acceptable')) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useApproveResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      try {
        console.log('🔄 Starting results approval for rally:', rallyId)

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('User not authenticated')
        }

        // Verify rally exists and is completed
        const { data: rally, error: rallyError } = await supabase
          .from('rallies')
          .select('id, name, status')
          .eq('id', rallyId)
          .single()

        if (rallyError || !rally) {
          throw new Error('Rally not found')
        }

        if (rally.status !== 'completed') {
          throw new Error('Rally must be completed before approving results')
        }

        console.log('✅ Rally validation passed, checking results...')

        // Check if there are participants to approve results for
        const { data: allResults, error: resultsError } = await supabase
          .from('rally_results')
          .select('id, overall_position, total_points, extra_points')
          .eq('rally_id', rallyId)

        if (resultsError) {
          throw new Error(`Error checking results: ${resultsError.message}`)
        }

        if (!allResults || allResults.length === 0) {
          throw new Error('No participants found for this rally')
        }

        // Check if ANY results have been entered (positions OR points)
        const hasAnyResults = allResults.some(result => 
          result.overall_position !== null || 
          (result.total_points !== null && result.total_points > 0) ||
          (result.extra_points !== null && result.extra_points > 0)
        )

        if (!hasAnyResults) {
          throw new Error('No results have been entered yet. Please enter at least some positions or points before approving.')
        }

        const currentTime = new Date().toISOString()

        console.log('🔄 Using upsert to handle approval...')

        // FIXED: Use upsert to handle both insert and update cases
        const { data: approvalResult, error: approvalError } = await supabase
          .from('rally_results_status')
          .upsert({
            rally_id: rallyId,
            results_needed: true,
            results_completed: true,
            results_completed_at: currentTime,
            results_approved: true,
            approved_at: currentTime,
            approved_by: user.id,
            results_entered_by: user.id,
            created_at: currentTime, // This will be ignored if record exists
            updated_at: currentTime
          }, {
            onConflict: 'rally_id', // This is the unique constraint column
            ignoreDuplicates: false  // We want to update, not ignore
          })
          .select()

        if (approvalError) {
          console.error('❌ Approval upsert error:', approvalError)
          throw new Error(`Failed to approve results: ${approvalError.message}`)
        }

        console.log('✅ Results approved successfully:', approvalResult)
        return true
      } catch (error) {
        console.error('❌ Approve results error:', error)
        throw error
      }
    },
    onSuccess: (_, rallyId) => {
      console.log('🎉 Results approval completed')
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      queryClient.invalidateQueries({ queryKey: ['approved-rallies'] })
    },
    onError: (error) => {
      console.error('❌ Failed to approve results:', error)
      alert(`Failed to approve results: ${error.message}`)
    }
  })
}