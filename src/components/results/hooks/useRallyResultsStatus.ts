// src/components/results/hooks/useRallyResultsStatus.ts
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

      // Get results status from database
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

      // Count participants with results
      const { data: resultsWithPositions } = await supabase
        .from('rally_results')
        .select('id')
        .eq('rally_id', rallyId)
        .not('overall_position', 'is', null)

      const participantsWithResults = resultsWithPositions?.length || 0
      const progressPercentage = totalParticipants > 0 ? Math.round((participantsWithResults / totalParticipants) * 100) : 0

      return {
        rally_id: rallyId,
        results_completed: status?.results_completed || false,
        results_approved: status?.results_approved || false,
        completed_at: status?.completed_at,
        completed_by: status?.completed_by,
        approved_at: status?.approved_at,
        approved_by: status?.approved_by,
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

      // Get all registered participants
      const { data: registrations } = await supabase
        .from('rally_registrations')
        .select(`
          id,
          user_id,
          rally_id,
          users!inner(player_name),
          game_classes!inner(name)
        `)
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

      // Get existing results
      const { data: existingResults } = await supabase
        .from('rally_results')
        .select('user_id, participant_name')
        .eq('rally_id', rallyId)

      const existingUserIds = new Set(existingResults?.filter(r => r.user_id).map(r => r.user_id) || [])
      const existingManualNames = new Set(existingResults?.filter(r => r.participant_name).map(r => r.participant_name) || [])

      // Find participants without results
      const missingResults = registrations?.filter(reg => !existingUserIds.has(reg.user_id)) || []

      console.log(`📊 Found ${missingResults.length} participants without results`)

      if (missingResults.length > 0) {
        const resultsToInsert = missingResults.map(reg => ({
          rally_id: rallyId,
          user_id: reg.user_id,
          registration_id: reg.id,
          participant_name: null,
          class_name: null, // Will be filled from registration
          overall_position: null, // Will be set to last positions
          total_points: 0, // Set to 0 as specified
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('rally_results')
          .insert(resultsToInsert)

        if (error) {
          console.error('Error auto-completing results:', error)
          throw error
        }

        console.log(`✅ Auto-completed ${resultsToInsert.length} missing results`)
      }

      return missingResults.length
    },
    onSuccess: (count, rallyId) => {
      console.log(`✅ Auto-completed ${count} missing results`)
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
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

      // Update rally results status to approved
      const { error } = await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_completed: true,
          results_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          updated_at: new Date().toISOString()
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