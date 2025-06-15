// src/components/results/hooks/useParticipantActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'
import type { ManualParticipant } from './useResultsState'

interface UseParticipantActionsProps {
  rallyId: string
  onParticipantAdded: () => void
  onParticipantRemoved: (participantId: string) => void
}

export function useParticipantActions({ 
  rallyId, 
  onParticipantAdded, 
  onParticipantRemoved 
}: UseParticipantActionsProps) {
  const queryClient = useQueryClient()

  // Add manual participant mutation
  const addManualParticipantMutation = useMutation({
    mutationFn: async (participant: ManualParticipant) => {
      console.log('🔄 Adding manual participant:', participant)
      
      const { data, error } = await supabase
        .from('rally_results')
        .insert({
          rally_id: rallyId,
          user_id: null, // NULL for manual participants
          registration_id: null,
          participant_name: participant.playerName,
          class_name: participant.className,
          overall_position: null,
          total_points: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding manual participant:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      onParticipantAdded()
      console.log('✅ Manual participant added successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to add manual participant:', error)
    }
  })

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: async (participant: any) => {
      console.log('🔄 Removing participant:', participant)
      
      const isManualParticipant = participant.user_id === 'manual-participant'
      
      if (isManualParticipant) {
        // Remove manual participant from rally_results
        const { error } = await supabase
          .from('rally_results')
          .delete()
          .eq('rally_id', rallyId)
          .eq('participant_name', participant.player_name)
          .is('user_id', null)

        if (error) {
          console.error('Error removing manual participant:', error)
          throw error
        }
      } else {
        // For registered participants, remove from rally_registrations
        // This will cascade delete the rally_results entry
        const { error } = await supabase
          .from('rally_registrations')
          .delete()
          .eq('id', participant.id)
          .eq('rally_id', rallyId)

        if (error) {
          console.error('Error removing registered participant:', error)
          throw error
        }

        // Also clean up any existing rally_results entry
        await supabase
          .from('rally_results')
          .delete()
          .eq('rally_id', rallyId)
          .eq('user_id', participant.user_id)
      }

      return participant.id
    },
    onSuccess: (participantId) => {
      // Remove from local state
      onParticipantRemoved(participantId)
      
      // Refresh participants list
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      console.log('✅ Participant removed successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to remove participant:', error)
    }
  })

  const handleAddParticipant = (participant: ManualParticipant) => {
    if (participant.playerName.trim() && participant.className.trim()) {
      addManualParticipantMutation.mutate(participant)
    }
  }

  const handleRemoveParticipant = (participant: any) => {
    const isManual = participant.user_id === 'manual-participant'
    const message = isManual 
      ? `Kas oled kindel, et soovid eemaldada käsitsi lisatud osalejat "${participant.player_name}"?`
      : `Kas oled kindel, et soovid eemaldada registreeritud osalejat "${participant.player_name}" rallist? See eemaldab ka tema registreeringu.`
    
    if (confirm(message)) {
      removeParticipantMutation.mutate(participant)
    }
  }

  return {
    // Mutations
    addManualParticipantMutation,
    removeParticipantMutation,
    
    // Actions
    handleAddParticipant,
    handleRemoveParticipant
  }
}