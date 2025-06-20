// src/components/results/hooks/useSaveResults.ts - FINAL WORKING VERSION
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
      console.log('🔄 FINAL SAVE: Updating participation and rally results...')
      
      const allParticipants = Object.values(results)
      if (allParticipants.length === 0) {
        throw new Error('Ei ole osalejaid salvestamiseks')
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const currentTime = new Date().toISOString()

      // ====================================================================
      // STEP 1: UPDATE PARTICIPATION STATUS - FIXED METHOD
      // ====================================================================
      
      console.log('📋 Updating participation status with FIXED method...')
      
      // Get all registrations for this rally
      const { data: allRegistrations, error: regError } = await supabase
        .from('rally_registrations')
        .select('*')
        .eq('rally_id', rallyId)

      if (regError) {
        throw regError
      }

      let participationUpdates = 0
      
      for (const result of allParticipants) {
        const participant = participants.find(p => p.id === result.participantId)
        
        if (!participant || participant.user_id === 'manual-participant') {
          continue
        }

        // Find matching registration
        const matchingReg = allRegistrations?.find(reg => reg.user_id === participant.user_id)
        
        if (matchingReg) {
          console.log(`🎯 Updating ${result.playerName}: ${matchingReg.participated} -> ${result.participated}`)
          
          // FIXED: Update by registration ID (not user_id) and DON'T use .select()
          const { error, count } = await supabase
            .from('rally_registrations')
            .update({ 
              participated: result.participated,
              updated_at: currentTime 
            })
            .eq('id', matchingReg.id)

          if (error) {
            console.error(`❌ Failed to update ${result.playerName}:`, error)
            throw error
          } else {
            console.log(`✅ Updated ${result.playerName} (count: ${count})`)
            participationUpdates++
          }
        } else {
          console.warn(`⚠️ No registration found for ${result.playerName}`)
        }
      }

      console.log(`📊 Successfully updated ${participationUpdates} participation records`)

      // ====================================================================
      // STEP 2: SAVE RALLY RESULTS (SCORES AND POSITIONS)
      // ====================================================================
      
      console.log('💾 Saving rally results (scores and positions)...')
      
      let resultsUpdates = 0
      
      for (const result of allParticipants) {
        const participant = participants.find(p => p.id === result.participantId)
        if (!participant) continue

        const isManualParticipant = participant.user_id === 'manual-participant'
        
        // Only save results if participant has positions/points OR participated
        if (!result.participated && !result.classPosition && !result.totalPoints) {
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
              overall_position: result.participated ? result.overallPosition : null,
              class_position: result.participated ? result.classPosition : null,
              total_points: result.participated ? result.totalPoints : null,
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
            
            console.log(`✅ Saved manual participant: ${result.playerName}`)

          } else {
            // Registered participants: save to rally_results
            const rallyResultData = {
              rally_id: rallyId,
              user_id: participant.user_id,
              registration_id: null,
              participant_name: null,
              class_name: null,
              overall_position: result.participated ? result.overallPosition : null,
              class_position: result.participated ? result.classPosition : null,
              total_points: result.participated ? result.totalPoints : null,
              results_entered_by: user.id,
              results_entered_at: currentTime,
              updated_at: currentTime
            }

            const { error } = await supabase
              .from('rally_results')
              .upsert(rallyResultData, {
                onConflict: 'rally_id,user_id'
              })

            if (error) {
              throw error
            }
            
            console.log(`✅ Saved registered participant: ${result.playerName}`)
          }
          
          resultsUpdates++
        } catch (error) {
          console.error(`❌ Error saving results for ${result.playerName}:`, error)
          throw error
        }
      }

      console.log(`📊 Successfully saved ${resultsUpdates} rally results`)

      // ====================================================================
      // STEP 3: DO NOT AUTO-COMPLETE RALLY STATUS
      // ====================================================================
      
      console.log('⏭️ SKIPPING rally status auto-completion (as requested)')
      // REMOVED: Auto-completion of rally_results_status
      // The rally should only be marked as completed manually by admin

      console.log('🎉 Save process completed successfully!')
      return { 
        participationUpdates, 
        resultsUpdates,
        total: allParticipants.length 
      }
    },
    onSuccess: (result) => {
      console.log(`✅ SAVE SUCCESS!`)
      console.log(`   Participation updates: ${result.participationUpdates}`)
      console.log(`   Results updates: ${result.resultsUpdates}`)
      console.log(`   Total participants: ${result.total}`)
      
      onSaveSuccess()
      
      // Refresh data to show the updates
      setTimeout(() => {
        console.log('🔄 Refreshing data to show updates...')
        queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
        queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
        queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      }, 1000)
    },
    onError: (error) => {
      console.error('❌ Save failed:', error)
    }
  })

  return {
    saveResultsMutation,
    handleSaveResults: (results: Record<string, ParticipantResult>) => {
      console.log('🚀 Starting final save process...')
      console.log('📝 Participation changes:', Object.values(results).map(r => ({
        name: r.playerName,
        participated: r.participated
      })))
      saveResultsMutation.mutate(results)
    }
  }
}