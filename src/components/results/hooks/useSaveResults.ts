// src/components/results/hooks/useSaveResults.ts - FIXED VERSION
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'
import type { ParticipantResult } from './useResultsState'

interface UseSaveResultsProps {
  rallyId: string
  participants: any[]
  onSaveSuccess: () => void
}

export function useSaveResults({ rallyId, participants, onSaveSuccess }: UseSaveResultsProps) {
  const queryClient = useQueryClient()

  const saveResultsMutation = useMutation({
    mutationFn: async (results: Record<string, ParticipantResult>) => {
      console.log('🔄 Saving rally results...')
      
      const updates = Object.values(results).filter(result => 
        result.classPosition !== null || result.totalPoints !== null
      )

      if (updates.length === 0) {
        throw new Error('Ei ole tulemusi salvestamiseks')
      }

      // Get current user for tracking who entered results
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const currentTime = new Date().toISOString()

      for (const result of updates) {
        const participant = participants.find(p => p.id === result.participantId)
        if (!participant) continue

        const isManualParticipant = participant.user_id === 'manual-participant'
        
        try {
          if (isManualParticipant) {
            // For manual participants: check if record exists first, then update or insert
            const { data: existing, error: checkError } = await supabase
              .from('rally_results')
              .select('id')
              .eq('rally_id', rallyId)
              .eq('participant_name', result.playerName)
              .is('user_id', null)
              .single()

            if (checkError && checkError.code !== 'PGRST116') {
              throw checkError
            }

            if (existing) {
              // Update existing manual participant
              const { error } = await supabase
                .from('rally_results')
                .update({
                  class_name: result.className,
                  class_position: result.classPosition,
                  total_points: result.totalPoints,
                  results_entered_at: currentTime, // ✅ FIX: Set results_entered_at
                  results_entered_by: user.id,     // ✅ FIX: Track who entered
                  updated_at: currentTime
                })
                .eq('id', existing.id)

              if (error) {
                console.error('Error updating manual participant result:', result.playerName, error)
                throw error
              }
            } else {
              // Insert new manual participant result
              const { error } = await supabase
                .from('rally_results')
                .insert({
                  rally_id: rallyId,
                  user_id: null,
                  registration_id: null,
                  participant_name: result.playerName,
                  class_name: result.className,
                  class_position: result.classPosition,
                  total_points: result.totalPoints,
                  results_entered_at: currentTime, // ✅ FIX: Set results_entered_at
                  results_entered_by: user.id,     // ✅ FIX: Track who entered
                  updated_at: currentTime
                })

              if (error) {
                console.error('Error inserting manual participant result:', result.playerName, error)
                throw error
              }
            }
          } else {
            // For registered participants: check if record exists first, then update or insert
            const { data: existing, error: checkError } = await supabase
              .from('rally_results')
              .select('id')
              .eq('rally_id', rallyId)
              .eq('user_id', participant.user_id)
              .single()

            if (checkError && checkError.code !== 'PGRST116') {
              throw checkError
            }

            if (existing) {
              // Update existing registered participant
              const { error } = await supabase
                .from('rally_results')
                .update({
                  class_position: result.classPosition,
                  total_points: result.totalPoints,
                  results_entered_at: currentTime, // ✅ FIX: Set results_entered_at
                  results_entered_by: user.id,     // ✅ FIX: Track who entered
                  updated_at: currentTime
                })
                .eq('id', existing.id)

              if (error) {
                console.error('Error updating registered participant result:', result.playerName, error)
                throw error
              }
            } else {
              // Insert new registered participant result
              const { error } = await supabase
                .from('rally_results')
                .insert({
                  rally_id: rallyId,
                  user_id: participant.user_id,
                  registration_id: participant.id,
                  participant_name: null,
                  class_name: null, // Class comes from registration for registered participants
                  class_position: result.classPosition,
                  total_points: result.totalPoints,
                  results_entered_at: currentTime, // ✅ FIX: Set results_entered_at
                  results_entered_by: user.id,     // ✅ FIX: Track who entered
                  updated_at: currentTime
                })

              if (error) {
                console.error('Error inserting registered participant result:', result.playerName, error)
                throw error
              }
            }
          }
        } catch (error) {
          console.error('Error saving result for:', result.playerName, error)
          throw error
        }
      }

      // Update rally results status
      await supabase
        .from('rally_results_status')
        .upsert({
          rally_id: rallyId,
          results_completed: true,
          results_completed_at: currentTime,  // ✅ CORRECT: matches your DB schema
          results_entered_by: user.id,        // ✅ CORRECT: matches your DB schema
          updated_at: currentTime
        })

      return updates.length
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] }) // ✅ FIX: Also invalidate status
      onSaveSuccess()
      console.log(`✅ Saved results for ${count} participants with proper tracking`)
    },
    onError: (error) => {
      console.error('❌ Failed to save results:', error)
    }
  })

  return {
    saveResultsMutation,
    handleSaveResults: (results: Record<string, ParticipantResult>) => {
      saveResultsMutation.mutate(results)
    }
  }
}