// src/components/results/hooks/useSaveResults.ts - DEBUG VERSION with extensive logging
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
    extraPoints: number | null
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
      console.log('🚀 === SAVE RESULTS DEBUG START ===')
      console.log('📊 Rally ID:', rallyId)
      console.log('👥 Total participants to process:', allParticipants.length)
      
      // Log all participant data being passed in
      console.log('📋 Participants data:')
      allParticipants.forEach((participant, index) => {
        console.log(`  ${index + 1}. ${participant.playerName}:`, {
          id: participant.participantId,
          overallPosition: participant.overallPosition,
          classPosition: participant.classPosition,
          totalPoints: participant.totalPoints,
          extraPoints: participant.extraPoints,
          className: participant.className
        })
      })
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ User authentication failed:', userError)
        throw new Error('User not authenticated')
      }
      console.log('✅ User authenticated:', user.email)

      const currentTime = new Date().toISOString()
      let savedCount = 0
      let skippedCount = 0
      let errorCount = 0

      // Process each participant individually
      for (let index = 0; index < allParticipants.length; index++) {
        const result = allParticipants[index]
        try {
          console.log(`\n--- Processing ${index + 1}/${allParticipants.length}: ${result.playerName} ---`)
          
          // Check if participant has any results to save
          const hasResults = result.overallPosition !== null || 
                           result.classPosition !== null || 
                           (result.totalPoints !== null && result.totalPoints !== 0) || 
                           (result.extraPoints !== null && result.extraPoints !== 0)

          console.log('🔍 Results check:', {
            overallPosition: result.overallPosition,
            classPosition: result.classPosition,
            totalPoints: result.totalPoints,
            extraPoints: result.extraPoints,
            hasResults: hasResults
          })

          if (!hasResults) {
            console.log('⏭️ Skipping - no results to save')
            skippedCount++
            continue
          }

          // Look up the participant in the database
          console.log('🔍 Looking up participant ID:', result.participantId)
          const { data: currentParticipant, error: lookupError } = await supabase
            .from('rally_results')
            .select('id, user_id, participant_name, registration_id, total_points, extra_points, overall_position, class_position')
            .eq('id', result.participantId)
            .single()

          if (lookupError) {
            console.error('❌ Database lookup failed:', lookupError)
            throw new Error(`Could not find participant ${result.playerName}: ${lookupError.message}`)
          }

          console.log('📊 Current DB data:', currentParticipant)
          
          const isManualParticipant = currentParticipant.user_id === null
          console.log('🏷️ Participant type:', isManualParticipant ? 'Manual' : 'Registered')

          if (isManualParticipant) {
            // For manual participants: Update existing rally_results record
            const updateData = {
              overall_position: result.overallPosition,
              class_position: result.classPosition,
              total_points: result.totalPoints,
              extra_points: result.extraPoints || 0,
              results_entered_by: user.id,
              results_entered_at: currentTime,
              updated_at: currentTime
            }

            console.log('📝 Preparing to update manual participant with data:', updateData)

            const { data: updateResult, error: updateError } = await supabase
              .from('rally_results')
              .update(updateData)
              .eq('id', result.participantId)
              .select() // Get the updated data back

            if (updateError) {
              console.error('❌ Update failed:', updateError)
              throw new Error(`Failed to update manual participant ${result.playerName}: ${updateError.message}`)
            }

            console.log('✅ Update successful! Updated data:', updateResult)

          } else {
            // For registered participants: Check if rally_results record exists, create/update as needed
            console.log('🔍 Checking for existing registered participant result...')
            const { data: existingResult, error: existingError } = await supabase
              .from('rally_results')
              .select('id')
              .eq('rally_id', rallyId)
              .eq('user_id', currentParticipant.user_id)
              .maybeSingle()

            if (existingError) {
              console.error('❌ Error checking existing result:', existingError)
              throw new Error(`Error checking existing results for ${result.playerName}: ${existingError.message}`)
            }

            console.log('📊 Existing result check:', existingResult)

            const resultData = {
              rally_id: rallyId,
              user_id: currentParticipant.user_id,
              registration_id: currentParticipant.registration_id,
              participant_name: null, // NULL for registered participants
              class_name: null, // NULL for registered participants (use registration data)
              overall_position: result.overallPosition,
              class_position: result.classPosition,
              total_points: result.totalPoints,
              extra_points: result.extraPoints || 0,
              results_entered_by: user.id,
              results_entered_at: currentTime,
              updated_at: currentTime
            }

            if (existingResult) {
              // Update existing
              console.log('📝 Updating existing registered participant result')
              const { data: updateResult, error: updateError } = await supabase
                .from('rally_results')
                .update(resultData)
                .eq('id', existingResult.id)
                .select()

              if (updateError) {
                console.error('❌ Update failed:', updateError)
                throw new Error(`Failed to update registered participant ${result.playerName}: ${updateError.message}`)
              }
              console.log('✅ Update successful!', updateResult)
            } else {
              // Create new
              console.log('📝 Creating new registered participant result')
              const { data: insertResult, error: insertError } = await supabase
                .from('rally_results')
                .insert(resultData)
                .select()

              if (insertError) {
                console.error('❌ Insert failed:', insertError)
                throw new Error(`Failed to create result for registered participant ${result.playerName}: ${insertError.message}`)
              }
              console.log('✅ Insert successful!', insertResult)
            }
          }

          savedCount++
          console.log(`✅ SUCCESS: Saved result for ${result.playerName}`)

        } catch (error) {
          console.error(`❌ ERROR processing ${result.playerName}:`, error)
          errorCount++
          throw error // Re-throw to stop the whole operation
        }
      }

      console.log(`\n🎯 FINAL SUMMARY:`)
      console.log(`  ✅ Saved: ${savedCount}`)
      console.log(`  ⏭️ Skipped: ${skippedCount}`)
      console.log(`  ❌ Errors: ${errorCount}`)

      // Update rally results status to completed
      console.log('\n🔄 Updating rally status...')
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
        console.error('❌ Rally status update failed:', statusError)
        throw new Error(`Failed to update rally status: ${statusError.message}`)
      }
      
      console.log('✅ Rally status updated successfully')
      console.log('🏁 === SAVE RESULTS DEBUG END ===\n')

      return { savedCount, skippedCount, errorCount }
    },
    onSuccess: (result) => {
      console.log('🎉 Save mutation completed successfully:', result)
      queryClient.invalidateQueries({ queryKey: resultsKeys.rally_participants(rallyId) })
      queryClient.invalidateQueries({ queryKey: [...resultsKeys.rally_results(rallyId), 'status'] })
      queryClient.invalidateQueries({ queryKey: resultsKeys.completed_rallies() })
      onSaveSuccess?.()
      alert(`Results saved successfully! ${result.savedCount} participants saved, ${result.skippedCount} skipped.`)
    },
    onError: (error) => {
      console.error('❌ Save mutation failed:', error)
      alert(`Failed to save results: ${error.message}`)
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
      queryClient.invalidateQueries({ queryKey: ['approved-rallies'] })
    },
    onError: (error) => {
      console.error('Failed to approve results:', error)
      alert(`Failed to approve results: ${error.message}`)
    }
  })

  return {
    saveResultsMutation,
    approveResultsMutation
  }
}