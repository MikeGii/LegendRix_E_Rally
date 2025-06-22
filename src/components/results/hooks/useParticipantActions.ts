// src/components/results/hooks/useParticipantActions.ts - FIXED: Better registered participant removal
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
          total_points: 0,
          extra_points: 0
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

  // Remove participant mutation - FIXED: Better handling for both types
  const removeParticipantMutation = useMutation({
    mutationFn: async (participant: any) => {
      console.log('🗑️ Starting deletion process for:', participant.player_name)
      console.log('📋 Participant data:', {
        id: participant.id,
        user_id: participant.user_id,
        rally_id: rallyId,
        type: participant.user_id === null ? 'Manual' : 'Registered'
      })

      const isManual = participant.user_id === null || participant.user_id === 'manual-participant'
      
      if (isManual) {
        // Delete manual participants from rally_results
        console.log('🔍 Deleting manual participant from rally_results...')
        const { error: deleteError, count } = await supabase
          .from('rally_results')
          .delete()
          .eq('id', participant.id)
          .eq('rally_id', rallyId)

        if (deleteError) {
          console.error('❌ Failed to delete manual participant:', deleteError)
          throw new Error(`Failed to delete manual participant: ${deleteError.message}`)
        }

        if (count === 0) {
          throw new Error('No manual participant found to delete')
        }

        console.log('✅ Manual participant deleted successfully')

      } else {
        // For registered participants: Use admin-level deletion with RLS bypass
        console.log('🔍 Deleting registered participant...')
        
        // Step 1: Delete any existing rally_results records first (to avoid FK constraints)
        console.log('🔄 Step 1: Cleaning up rally results...')
        const { error: resultsCleanupError } = await supabase
          .from('rally_results')
          .delete()
          .eq('rally_id', rallyId)
          .eq('user_id', participant.user_id)

        if (resultsCleanupError) {
          console.warn('⚠️ Rally results cleanup warning (may not exist):', resultsCleanupError)
          // Don't throw here - results might not exist
        }

        // Step 2: Get the registration data for the user check
        console.log('🔄 Step 2: Getting registration data...')
        const { data: registrationData, error: fetchError } = await supabase
          .from('rally_registrations')
          .select('id, user_id, rally_id')
          .eq('id', participant.id)
          .eq('rally_id', rallyId)
          .single()

        if (fetchError) {
          console.error('❌ Failed to fetch registration:', fetchError)
          throw new Error(`Registration not found: ${fetchError.message}`)
        }

        console.log('📊 Registration data:', registrationData)

        // Step 3: Use corrected RPC function to safely delete registration
        console.log('🔄 Step 3: Calling corrected admin deletion function...')
        const { error: rpcError } = await supabase
          .rpc('admin_delete_rally_registration', {
            registration_id: participant.id,
            target_rally_id: rallyId
          })

        if (rpcError) {
          console.error('❌ Primary RPC deletion failed:', rpcError)
          
          // Try the force delete function as a fallback
          console.log('🔄 Trying force delete function...')
          const { error: forceError } = await supabase
            .rpc('force_delete_rally_registration', {
              registration_id: participant.id,
              target_rally_id: rallyId
            })
          
          if (forceError) {
            console.error('❌ Force deletion also failed:', forceError)
            throw new Error(`Failed to delete registration: ${forceError.message}`)
          }
          
          console.log('✅ Force deletion succeeded')
        } else {
          console.log('✅ Primary RPC deletion succeeded')
        }

        console.log('✅ Registered participant deleted successfully')
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
      
      // Also invalidate registration-related queries
      queryClient.invalidateQueries({ queryKey: ['rally_registrations'] })
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
      
      // Force refetch to ensure UI updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      }, 100)
      
      console.log('✅ All queries refreshed')
    },
    onError: (error, participant) => {
      console.error('❌ Deletion failed for:', participant.player_name, error)
      alert(`Failed to remove participant "${participant.player_name}": ${error.message}`)
    }
  })

  const handleAddParticipant = (participant: ManualParticipant) => {
    if (participant.playerName.trim() && participant.className.trim()) {
      addManualParticipantMutation.mutate(participant)
    }
  }

  const handleRemoveParticipant = (participant: any) => {
    const isManual = participant.user_id === null || participant.user_id === 'manual-participant'
    const participantName = participant.player_name || participant.participant_name || 'Unknown'
    
    const message = isManual 
      ? `Are you sure you want to remove manually added participant "${participantName}"?`
      : `Are you sure you want to remove registered participant "${participantName}" from the rally? This will also remove their registration.`
    
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
    handleRemoveParticipant,
    
    // Loading states
    isAdding: addManualParticipantMutation.isPending,
    isRemoving: removeParticipantMutation.isPending,
  }
}