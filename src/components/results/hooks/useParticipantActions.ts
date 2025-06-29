// src/components/results/hooks/useParticipantActions.ts - FIXED: Better registered participant removal
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resultsKeys } from '@/hooks/useResultsManagement'
import type { ManualParticipant } from './useResultsState'
import { toast } from 'sonner'

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
    onSuccess: (data, variables) => {
      toast.success(`Osaleja "${variables.playerName}" lisatud edukalt!`)
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      onParticipantAdded()
    },
    onError: (error: any) => {
      console.error('Failed to add manual participant:', error)
      toast.error(`Osaleja lisamine ebaõnnestus: ${error.message}`)
    }
  })

  // Remove participant mutation - UPDATED WITH DIRECT DELETE
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
          throw new Error(`Kustutamine ebaõnnestus: ${deleteError.message}`)
        }

        if (count === 0) {
          throw new Error('Osalejat ei leitud')
        }

        console.log('✅ Manual participant deleted successfully')

      } else {
        // For registered participants: Use direct deletion approach
        console.log('🔍 Deleting registered participant...')
        
        // Show loading toast
        const loadingToast = toast.loading('Kustutan registreeritud osalejat...')
        
        try {
          // Step 1: Delete any existing rally_results records first
          console.log('🔄 Step 1: Cleaning up rally results...')
          const { error: resultsCleanupError } = await supabase
            .from('rally_results')
            .delete()
            .eq('rally_id', rallyId)
            .eq('user_id', participant.user_id)

          if (resultsCleanupError) {
            console.warn('⚠️ Rally results cleanup warning (may not exist):', resultsCleanupError)
          }

          // Step 2: Get the registration data
          console.log('🔄 Step 2: Getting registration data...')
          const { data: registrationData, error: fetchError } = await supabase
            .from('rally_registrations')
            .select('id, user_id, rally_id')
            .eq('id', participant.id)
            .eq('rally_id', rallyId)
            .single()

          if (fetchError) {
            toast.dismiss(loadingToast)
            console.error('❌ Failed to fetch registration:', fetchError)
            throw new Error(`Registreerimist ei leitud: ${fetchError.message}`)
          }

          console.log('📊 Registration data:', registrationData)

          // Step 3: Use direct deletion
          console.log('🔄 Step 3: Direct deletion approach...')
          
          // Try to delete the registration directly
          const { error: deleteError } = await supabase
            .from('rally_registrations')
            .delete()
            .eq('id', participant.id)
            .eq('rally_id', rallyId)

          toast.dismiss(loadingToast)

          if (deleteError) {
            console.error('❌ Direct deletion failed:', deleteError)
            
            // If deletion fails due to permissions, try to cancel instead
            if (deleteError.code === '42501' || deleteError.message.includes('permission')) {
              console.log('🔄 Trying to cancel registration instead...')
              
              const { error: cancelError } = await supabase
                .from('rally_registrations')
                .update({ 
                  status: 'cancelled',
                  updated_at: new Date().toISOString()
                })
                .eq('id', participant.id)
                .eq('rally_id', rallyId)
              
              if (cancelError) {
                throw new Error(`Kustutamine/tühistamine ebaõnnestus: ${cancelError.message}`)
              }
              
              console.log('⚠️ Registration cancelled (not deleted due to permissions)')
              toast.warning('Registreerimine tühistatud (kustutamine pole lubatud)')
              return participant.id
            } else {
              throw new Error(`Kustutamine ebaõnnestus: ${deleteError.message}`)
            }
          } else {
            console.log('✅ Direct deletion succeeded')
          }
        } catch (error) {
          toast.dismiss(loadingToast)
          throw error
        }

        console.log('✅ Registered participant removed successfully')
      }

      return participant.id
    },
    onMutate: async (participant) => {
      // Optimistically remove from UI
      const participantName = participant.player_name || participant.participant_name || 'Unknown'
      console.log(`🔄 Optimistically removing ${participantName} from UI...`)
    },
    onSuccess: async (participantId, participant) => {
      console.log('🎉 Deletion completed successfully for:', participant.player_name)
      
      const participantName = participant.player_name || participant.participant_name || 'Unknown'
      const isManual = participant.user_id === null || participant.user_id === 'manual-participant'
      
      // Show success message
      toast.success(
        isManual 
          ? `Manuaalne osaleja "${participantName}" kustutatud!`
          : `Registreeritud osaleja "${participantName}" eemaldatud!`,
        {
          duration: 5000,
          description: isManual ? 'Osaleja on tulemuste tabelist eemaldatud.' : 'Osaleja registreerimine on tühistatud.'
        }
      )
      
      // Remove from local state immediately
      onParticipantRemoved(participantId)
      
      // Debug: Log all available query keys
      console.log('Available query keys:', queryClient.getQueryCache().getAll().map(q => q.queryKey))
      
      // Force complete refresh with more aggressive approach
      await queryClient.cancelQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.removeQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      
      // Try multiple query key variations
      const queryVariations = [
        resultsKeys.rally_participants(rallyId),
        ['results_management', 'rally_participants', rallyId],
        ['rally_participants', rallyId],
        ['rally-participants', rallyId],
        ['rallies'],
        ['rally_registrations'],
        ['user-statistics']
      ]
      
      // Invalidate all variations
      for (const queryKey of queryVariations) {
        await queryClient.invalidateQueries({ queryKey })
      }
      
      // Force refetch with exact: false to catch partial matches
      await queryClient.refetchQueries({ 
        queryKey: resultsKeys.rally_participants(rallyId),
        exact: false 
      })
      
      // Additional refetch after delay
      setTimeout(async () => {
        await queryClient.refetchQueries({ 
          queryKey: resultsKeys.rally_participants(rallyId),
          exact: false
        })
        
        // If still not working, try broader refetch
        await queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey as any[]
            return key.includes(rallyId) || key.includes('rally_participants')
          }
        })
      }, 300)
      
      console.log('✅ All queries refreshed with multiple approaches')
    },
    onError: (error: any, participant) => {
      console.error('❌ Deletion failed for:', participant.player_name, error)
      const participantName = participant.player_name || participant.participant_name || 'Unknown'
      
      toast.error(`Kustutamine ebaõnnestus`, {
        description: `Osaleja "${participantName}" eemaldamine ebaõnnestus: ${error.message}`,
        duration: 7000,
      })
    },
    onSettled: async () => {
      // This runs after success OR error
      console.log('🔄 onSettled: Final cleanup and refresh')
      
      // One more aggressive refresh attempt
      await queryClient.invalidateQueries()
      
      // Focus on rally participants specifically
      await queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey as string[]
          return queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('participant') || key === rallyId)
          )
        },
        type: 'active'
      })
    }
  })

  const handleAddParticipant = (participant: ManualParticipant) => {
    if (participant.playerName.trim() && participant.className.trim()) {
      addManualParticipantMutation.mutate(participant)
    } else {
      toast.error('Palun täitke kõik väljad!')
    }
  }

  const handleRemoveParticipant = (participant: any) => {
    const isManual = participant.user_id === null || participant.user_id === 'manual-participant'
    const participantName = participant.player_name || participant.participant_name || 'Unknown'
    
    const message = isManual 
      ? `Kas olete kindel, et soovite eemaldada manuaalse osaleja "${participantName}"?`
      : `Kas olete kindel, et soovite eemaldada registreeritud osaleja "${participantName}"? See tühistab ka tema registreerimise.`
    
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