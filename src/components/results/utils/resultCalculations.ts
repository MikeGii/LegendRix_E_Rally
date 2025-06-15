// src/components/results/utils/resultCalculations.ts

import type { ParticipantResult } from '../hooks/useResultsState'
import { calculateClassBasedPositions } from './classBasedCalculations'

export function calculatePositionsFromPoints(
  results: Record<string, ParticipantResult>,
  updateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
) {
  console.log('🔄 Starting class-based position calculation...')
  
  // Calculate class-based positions
  const classPositions = calculateClassBasedPositions(results)
  
  // Update results with calculated positions
  classPositions.forEach(position => {
    updateResult(position.participantId, 'overallPosition', position.overallPosition)
    updateResult(position.participantId, 'classPosition', position.classPosition)
  })
  
  console.log('✅ Class-based positions calculated and applied')
}

export function clearParticipantResults(
  participantId: string,
  updateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
) {
  updateResult(participantId, 'overallPosition', null)
  updateResult(participantId, 'classPosition', null)
  updateResult(participantId, 'totalPoints', null)
}

export function sortParticipantsByResults(
  participants: any[],
  results: Record<string, ParticipantResult>
) {
  return participants.sort((a, b) => {
    const aResult = results[a.id]
    const bResult = results[b.id]
    
    if (aResult?.overallPosition && bResult?.overallPosition) {
      return aResult.overallPosition - bResult.overallPosition
    }
    if (aResult?.overallPosition && !bResult?.overallPosition) return -1
    if (!aResult?.overallPosition && bResult?.overallPosition) return 1
    return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
  })
}