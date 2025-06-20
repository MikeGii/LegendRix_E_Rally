// src/components/results/utils/resultCalculations.ts - SIMPLIFIED: Removed participated logic
import type { ParticipantResult } from '../hooks/useResultsState'
import { calculateClassBasedPositions } from './classBasedCalculations'

export function calculatePositionsFromPoints(
  results: Record<string, ParticipantResult>,
  updateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
) {
  // Only calculate positions for participants with points > 0
  const participantsWithPoints = Object.values(results).filter(result => 
    result.totalPoints && result.totalPoints > 0
  )

  if (participantsWithPoints.length === 0) {
    return
  }

  // Calculate class-based positions using the improved algorithm
  const classPositions = calculateClassBasedPositions(results)
  
  // Update results with calculated positions
  classPositions.forEach(position => {
    updateResult(position.participantId, 'overallPosition', position.overallPosition)
    updateResult(position.participantId, 'classPosition', position.classPosition)
  })
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
    
    // 1. Participants with points > 0 (by points DESC)
    const aHasPoints = aResult?.totalPoints > 0
    const bHasPoints = bResult?.totalPoints > 0
    
    if (aHasPoints && bHasPoints) {
      return (bResult.totalPoints || 0) - (aResult.totalPoints || 0)
    }
    if (aHasPoints && !bHasPoints) return -1
    if (!aHasPoints && bHasPoints) return 1
    
    // 2. Participants without points (alphabetical by name)
    return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
  })
}