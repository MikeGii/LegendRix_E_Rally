// src/components/results/hooks/useRallyResultsStatus.ts - FIXED WITH CORRECT COLUMN NAMES
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
    refetchInterval: 10000 // Refresh every 10 seconds to keep progress updated
  })
}

export function useAutoCompleteResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Auto-completing missing results for rally:', rallyId)

      // FIXED: Get current user at the beginning
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.warn('No authenticated user for auto-complete')
      }

      // Step 1: Get all registered participants (simplified query)
      const { data: registrations, error: regError } = await supabase
        .from('rally_registrations')
        .select('id, user_id')
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

      if (regError) {
        console.error('Error loading registrations:', regError)
        throw regError
      }

      // Step 2: Get existing results
      const { data: existingResults } = await supabase
        .from('rally_results')
        .select('user_id')
        .eq('rally_id', rallyId)
        .not('user_id', 'is', null) // Only check registered participants

      const existingUserIds = new Set(existingResults?.map(r => r.user_id) || [])

      // Step 3: Find participants without results
      const missingParticipants = (registrations || [])
        .filter(reg => !existingUserIds.has(reg.user_id))

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

        // Step 5: Create results with fallback class lookup
        const resultsToInsert = []
        
        for (const participant of missingParticipants) {
          // Get the registration details including class_id
          const { data: registration } = await supabase
            .from('rally_registrations')
            .select('class_id')
            .eq('id', participant.id)
            .single()

          // Get the class name separately
          let className = 'Unknown Class'
          if (registration?.class_id) {
            const { data: gameClass } = await supabase
              .from('game_classes')
              .select('name')
              .eq('id', registration.class_id)
              .single()
            
            className = gameClass?.name || 'Unknown Class'
          }

          resultsToInsert.push({
            rally_id: rallyId,
            user_id: participant.user_id,
            registration_id: participant.id,
            participant_name: null,
            class_name: className,
            overall_position: nextPosition++,
            total_points: 0,
            results_entered_at: new Date().toISOString(), // FIXED: Mark as entered
            results_entered_by: user?.id, // FIXED: Track who entered
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

      // Step 7: Update rally results status to completed with correct column names
      const { error: statusError } = await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_completed: true,
          results_completed_at: new Date().toISOString(),
          results_entered_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'rally_id' // FIXED: Specify the conflict column
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

export function useApproveResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Approving results for rally:', rallyId)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Verify all participants have results before approving
      const { data: totalParticipants } = await supabase
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

      const totalCount = (totalParticipants?.length || 0) + (manualParticipants?.length || 0)
      const resultsCount = resultsWithPositions?.length || 0

      if (resultsCount < totalCount) {
        throw new Error(`Mitte kõigil osalejatel pole tulemused sisestatud (${resultsCount}/${totalCount})`)
      }

      // Update rally results status to approved with correct column names
      const { error } = await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_completed: true,
          results_approved: true,
          results_completed_at: new Date().toISOString(), // CORRECT: matches DB schema
          results_entered_by: user.id, // CORRECT: matches DB schema
          approved_at: new Date().toISOString(), // CORRECT: matches DB schema  
          approved_by: user.id, // CORRECT: matches DB schema
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'rally_id' // FIXED: Specify the conflict column
        })

      if (error) {
        console.error('Error approving results:', error)
        throw error
      }

      console.log('✅ Results approved successfully')
      return rallyId
    },
    onSuccess: (rallyId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_results(rallyId) })
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      
      // Also invalidate approved rallies query (for public view)
      queryClient.invalidateQueries({ queryKey: ['approved-rallies'] })
    },
    onError: (error) => {
      console.error('❌ Failed to approve results:', error)
    }
  })
}