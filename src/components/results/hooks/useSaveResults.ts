// src/components/results/hooks/useSaveResults.ts - SIMPLIFIED: Removed participated logic, added approve
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'

interface SaveResultsData {
  rallyId: string
  allParticipants: Array<{
    participantId: string
    playerName: string
    className: string
    overallPosition: number | null
    classPosition: number | null
    totalPoints: number | null
    extraPoints: number | null  // NEW: Extra points
  }>
}

interface UseSaveResultsProps {
  rallyId: string
  onSaveSuccess?: () => void
}

export function useSaveResults({ rallyId, onSaveSuccess }: UseSaveResultsProps) {
  const queryClient = useQueryClient()

  const saveResultsMutation = useMutation({
    mutationFn: async ({ rallyId, allParticipants }: SaveResultsData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const currentTime = new Date().toISOString()

      // Get all participants to match with registrations
      const { data: participants, error: participantsError } = await supabase
        .from('rally_registrations')
        .select(`
          id,
          user_id,
          class_id,
          users!inner(player_name),
          game_classes!inner(name)
        `)
        .eq('rally_id', rallyId)
        .in('status', ['registered', 'confirmed'])

      if (participantsError) {
        throw participantsError
      }

      // Save rally results for all participants
      for (const result of allParticipants) {
        const participant = participants.find(p => p.id === result.participantId)
        if (!participant) continue

        const isManualParticipant = participant.user_id === 'manual-participant'
        
        // Only save results if participant has positions/points
        if (!result.classPosition && !result.totalPoints && !result.extraPoints) {
          continue
        }

        try {
          if (isManualParticipant) {
            // Manual participants: save to rally_results
            const { data: existing } = await supabase
              .from('rally_results')
              .select('id')
              .eq('rally_id', rallyId)
              .eq('participant_name', result.playerName)
              .is('user_id', null)
              .single()

            const rallyResultData = {
              rally_id: rallyId,
              user_id: null,
              registration_id: null,
              participant_name: result.playerName,
              class_name: result.className,
              overall_position: result.overallPosition,
              class_position: result.classPosition,
              total_points: result.totalPoints,
              extra_points: result.extraPoints,  // NEW: Save extra points
              results_entered_by: user.id,
              results_entered_at: currentTime,
              updated_at: currentTime
            }

            if (existing) {
              const { error } = await supabase
                .from('rally_results')
                .update(rallyResultData)
                .eq('id', existing.id)
              if (error) throw error
            } else {
              const { error } = await supabase
                .from('rally_results')
                .insert(rallyResultData)
              if (error) throw error
            }

          } else {
            // Registered participants: save to rally_results
            const rallyResultData = {
              rally_id: rallyId,
              user_id: participant.user_id,
              registration_id: participant.id,
              participant_name: null,
              class_name: null,
              overall_position: result.overallPosition,
              class_position: result.classPosition,
              total_points: result.totalPoints,
              extra_points: result.extraPoints,  // NEW: Save extra points
              results_entered_by: user.id,
              results_entered_at: currentTime,
              updated_at: currentTime
            }

            // Check if result already exists
            const { data: existingResult } = await supabase
              .from('rally_results')
              .select('id')
              .eq('rally_id', rallyId)
              .eq('user_id', participant.user_id)
              .single()

            if (existingResult) {
              // Update existing result
              const { error } = await supabase
                .from('rally_results')
                .update(rallyResultData)
                .eq('id', existingResult.id)
              if (error) throw error
            } else {
              // Insert new result
              const { error } = await supabase
                .from('rally_results')
                .insert(rallyResultData)
              if (error) throw error
            }
          }
        } catch (error) {
          console.error(`Error saving result for participant ${result.playerName}:`, error)
          throw error
        }
      }

      // Update rally results status to completed
      const { error: statusError } = await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_completed: true,
          results_completed_at: currentTime,
          results_entered_by: user.id,
          updated_at: currentTime
        }, {
          onConflict: 'rally_id'
        })

      if (statusError) {
        throw statusError
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      onSaveSuccess?.()
    },
    onError: (error) => {
      console.error('Failed to save results:', error)
    }
  })

  const approveResultsMutation = useMutation({
    mutationFn: async (rallyId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
    },
    onError: (error) => {
      console.error('Failed to approve results:', error)
    }
  })

  return {
    saveResultsMutation,
    approveResultsMutation
  }
}