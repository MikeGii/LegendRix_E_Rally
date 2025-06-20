// src/components/results/hooks/useParticipantActions.ts - FIXED: Proper deletion logic
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
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      onParticipantAdded()
    },
    onError: (error) => {
      console.error('Failed to add manual participant:', error)
    }
  })

  // Remove participant mutation - FIXED: Direct database approach with proper verification
  const removeParticipantMutation = useMutation({
    mutationFn: async (participant: any) => {
      console.log('🗑️ Starting deletion process for:', participant.player_name)
      console.log('📋 Participant data:', {
        id: participant.id,
        user_id: participant.user_id,
        rally_id: rallyId,
        is_manual: participant.user_id === 'manual-participant'
      })
      
      const isManualParticipant = participant.user_id === 'manual-participant'
      
      if (isManualParticipant) {
        console.log('📝 Deleting manual participant from rally_results')
        
        const { error, count } = await supabase
          .from('rally_results')
          .delete()
          .eq('rally_id', rallyId)
          .eq('participant_name', participant.player_name)
          .is('user_id', null)

        if (error) {
          console.error('❌ Failed to delete manual participant:', error)
          throw error
        }
        
        console.log('✅ Manual participant deleted, affected rows:', count)
      } else {
        console.log('👤 Deleting registered participant')
        
        // First, verify the registration exists
        const { data: existingReg, error: fetchError } = await supabase
          .from('rally_registrations')
          .select('id, rally_id, user_id')
          .eq('id', participant.id)
          .single()

        if (fetchError) {
          console.error('❌ Could not find registration:', fetchError)
          throw new Error(`Registreeringu leidmine ebaõnnestus: ${fetchError.message}`)
        }

        console.log('📋 Found existing registration:', existingReg)

        // Step 1: Delete any existing rally_results entry
        const { error: resultsError, count: resultsCount } = await supabase
          .from('rally_results')
          .delete()
          .eq('rally_id', rallyId)
          .eq('user_id', participant.user_id)

        if (resultsError) {
          console.warn('⚠️ Error deleting rally_results:', resultsError)
        } else {
          console.log('✅ Rally results cleaned up, affected rows:', resultsCount)
        }

        // Step 2: Delete the registration using the correct approach
        const { error: regError, count: regCount } = await supabase
          .from('rally_registrations')
          .delete()
          .eq('id', participant.id)

        if (regError) {
          console.error('❌ Failed to delete registration:', regError)
          throw new Error(`Registreeringu kustutamine ebaõnnestus: ${regError.message}`)
        }
        
        console.log('✅ Registration deleted, affected rows:', regCount)

        // Verify deletion worked
        if (regCount === 0) {
          throw new Error('Registreeringu kustutamine ebaõnnestus - ühtegi rida ei mõjutatud')
        }
      }

      return participant.id
    },
    onSuccess: (participantId, participant) => {
      console.log('🎉 Deletion completed successfully for:', participant.player_name)
      
      // Remove from local state immediately
      onParticipantRemoved(participantId)
      
      // Force complete refresh of all related data
      queryClient.removeQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      
      // Force refetch to ensure UI updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      }, 100)
      
      console.log('✅ All queries refreshed')
    },
    onError: (error, participant) => {
      console.error('❌ Deletion failed for:', participant.player_name, error)
      alert(`Osaleja "${participant.player_name}" eemaldamine ebaõnnestus: ${error.message}`)
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