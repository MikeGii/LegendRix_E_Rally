// src/components/results/hooks/useRallyResultsStatus.ts - COMPLETE FIXED VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'

export interface RallyResultsStatus {
  rally_id: string
  results_completed: boolean
  results_approved: boolean
  completed_at?: string
  completed_by?: string
  approved_at?: string
  approved_by?: string
  participants_total: number
  participants_with_results: number
  progress_percentage: number
}

// ============================================================================
// GET RALLY RESULTS STATUS
// ============================================================================

export function useRallyResultsStatus(rallyId: string) {
  return useQuery({
    queryKey: [...resultsKeys.rally_results(rallyId), 'status'],
    queryFn: async (): Promise<RallyResultsStatus | null> => {
      if (!rallyId) return null

      console.log('🔄 Loading rally results status for:', rallyId)

      // Get results status from database with correct column names
      const { data: status, error: statusError } = await supabase
        .from('rally_results_status')
        .select('*')
        .eq('rally_id', rallyId)
        .single()

      if (statusError && statusError.code !== 'PGRST116') {
        console.error('Error loading results status:', statusError)
        throw statusError
      }

      // Count total participants (registered + manual)
      const { data: registrations } = await supabase
        .from('rally_registrations')
        .select('id')
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

      const { data: manualParticipants } = await supabase
        .from('rally_results')
        .select('id')
        .eq('rally_id', rallyId)
        .is('user_id', null)

      const totalParticipants = (registrations?.length || 0) + (manualParticipants?.length || 0)

      // Count participants with results (those who have overall_position set)
      const { data: resultsWithPositions } = await supabase
        .from('rally_results')
        .select('id')
        .eq('rally_id', rallyId)
        .not('overall_position', 'is', null)

      const participantsWithResults = resultsWithPositions?.length || 0
      const progressPercentage = totalParticipants > 0 ? 
        Math.round((participantsWithResults / totalParticipants) * 100) : 0

      return {
        rally_id: rallyId,
        results_completed: status?.results_completed || false,
        results_approved: status?.results_approved || false,
        completed_at: status?.results_completed_at, // CORRECT: matches DB schema
        completed_by: status?.results_entered_by, // CORRECT: matches DB schema
        approved_at: status?.approved_at, // CORRECT: matches DB schema
        approved_by: status?.approved_by, // CORRECT: matches DB schema
        participants_total: totalParticipants,
        participants_with_results: participantsWithResults,
        progress_percentage: progressPercentage
      }
    },
    enabled: !!rallyId,
    refetchInterval: 10000, // Refresh every 10 seconds to keep progress updated
    staleTime: 5000 // Consider data fresh for 5 seconds
  })
}

// ============================================================================
// AUTO-COMPLETE MISSING RESULTS
// ============================================================================

export function useAutoCompleteResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Auto-completing missing results for rally:', rallyId)

      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Step 1: Get all registered participants with class information
      const { data: registrations, error: regError } = await supabase
        .from('rally_registrations')
        .select(`
          id,
          user_id,
          class_id,
          game_classes!inner(
            id,
            name
          )
        `)
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

      if (regError) {
        console.error('Error loading registrations:', regError)
        throw regError
      }

      // Step 2: Get existing results
      const { data: existingResults } = await supabase
        .from('rally_results')
        .select('user_id, registration_id')
        .eq('rally_id', rallyId)

      const existingUserIds = new Set(existingResults?.map(r => r.user_id).filter(Boolean) || [])
      const existingRegistrationIds = new Set(existingResults?.map(r => r.registration_id).filter(Boolean) || [])

      // Step 3: Find participants without results
      const missingParticipants = (registrations || []).filter(reg => 
        !existingUserIds.has(reg.user_id) && !existingRegistrationIds.has(reg.id)
      )

      console.log(`📊 Found ${missingParticipants.length} participants without results`)

      if (missingParticipants.length > 0) {
        // Step 4: Get the highest existing position to start from
        const { data: maxPositionResult } = await supabase
          .from('rally_results')
          .select('overall_position')
          .eq('rally_id', rallyId)
          .not('overall_position', 'is', null)
          .order('overall_position', { ascending: false })
          .limit(1)

        let nextPosition = (maxPositionResult?.[0]?.overall_position || 0) + 1

        // Step 5: Create results with proper class name resolution
        const resultsToInsert = []
        
        const { data: registrations, error: regError } = await supabase
        .from('rally_registrations')
        .select('id, user_id, class_id')
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

        if (regError) {
        console.error('Error loading registrations:', regError)
        throw regError
        }

        // Get class names separately to avoid join complexity
        const classIds = Array.from(new Set(registrations?.map(r => r.class_id).filter(Boolean) || []))
        const { data: classes } = await supabase
        .from('game_classes')
        .select('id, name')
        .in('id', classIds)

        const classMap = new Map(classes?.map(c => [c.id, c.name]) || [])

        // Then in the loop:
        for (const participant of missingParticipants) {
        const className = classMap.get(participant.class_id) || 'Unknown Class'
        
        resultsToInsert.push({
            rally_id: rallyId,
            user_id: participant.user_id,
            registration_id: participant.id,
            participant_name: null,
            class_name: className,
            overall_position: nextPosition++,
            class_position: null,
            total_points: 0,
            results_entered_at: new Date().toISOString(),
            results_entered_by: user?.id,
            updated_at: new Date().toISOString()
        })
        }

        // Step 6: Insert all missing results
        const { error: insertError } = await supabase
          .from('rally_results')
          .insert(resultsToInsert)

        if (insertError) {
          console.error('Error auto-completing results:', insertError)
          throw insertError
        }

        console.log(`✅ Auto-completed ${resultsToInsert.length} missing results with positions ${nextPosition - resultsToInsert.length} to ${nextPosition - 1}`)
      }

      // Step 7: Update rally results status to completed
      const { error: statusError } = await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_completed: true,
          results_completed_at: new Date().toISOString(),
          results_entered_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'rally_id'
        })

      if (statusError) {
        console.error('Error updating rally status:', statusError)
        throw statusError
      }

      return missingParticipants.length
    },
    onSuccess: (count, rallyId) => {
      console.log(`✅ Auto-completed ${count} missing results`)
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
    },
    onError: (error) => {
      console.error('❌ Failed to auto-complete results:', error)
    }
  })
}

// ============================================================================
// APPROVE RALLY RESULTS
// ============================================================================

export function useApproveResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Approving results for rally:', rallyId)

      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Step 1: Verify all participants have results before approving
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

      if (participantsWithResults < totalParticipants) {
        throw new Error(`Cannot approve: ${totalParticipants - participantsWithResults} participants still missing results`)
      }

      // Step 2: Mark results as completed first (if not already)
      await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_completed: true,
          results_completed_at: new Date().toISOString(),
          results_entered_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'rally_id'
        })

      // Step 3: Approve the results
      const { error: approvalError } = await supabase
        .from('rally_results_status')
        .update({
          results_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('rally_id', rallyId)

      if (approvalError) {
        console.error('Error approving results:', approvalError)
        throw approvalError
      }

      // Step 4: Update rally status to completed
      const { error: rallyUpdateError } = await supabase
        .from('rallies')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', rallyId)

      if (rallyUpdateError) {
        console.error('Error updating rally status:', rallyUpdateError)
        // Don't throw here as approval was successful
      }

      console.log('✅ Results approved and rally marked as completed')
      return { rallyId, approvedAt: new Date().toISOString() }
    },
    onSuccess: (data, rallyId) => {
      console.log('✅ Results approved successfully for rally:', rallyId)
      
      // Invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      queryClient.invalidateQueries({ queryKey: ['approved-rallies'] })
      queryClient.invalidateQueries({ queryKey: ['rally-management'] })
      
      // Force a refetch of approved rallies for public view
      queryClient.refetchQueries({ queryKey: ['approved-rallies'] })
    },
    onError: (error) => {
      console.error('❌ Failed to approve results:', error)
    }
  })
}

// ============================================================================
// MARK RALLY AS NEEDING RESULTS
// ============================================================================

export function useMarkRallyNeedsResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Marking rally as needing results:', rallyId)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_needed: true,
          results_needed_since: new Date().toISOString(),
          results_completed: false,
          results_approved: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'rally_id'
        })

      if (error) {
        console.error('Error marking rally as needing results:', error)
        throw error
      }

      return { rallyId }
    },
    onSuccess: (data, rallyId) => {
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
    },
    onError: (error) => {
      console.error('❌ Failed to mark rally as needing results:', error)
    }
  })
}