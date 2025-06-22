// src/components/results/utils/resultCalculations.ts - SIMPLIFIED: Removed participated logic
import type { ParticipantResult } from '../hooks/useResultsState'
import { calculateClassBasedPositions } from './classBasedCalculations'

export function calculatePositionsFromPoints(
  results: Record<string, ParticipantResult>,
  updateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
) {
  // Only calculate positions for participants with points > 0
  const participantsWithPoints = Object.values(results).filter(result => 
    result.overallPoints && result.overallPoints > 0
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
  updateResult(participantId, 'extraPoints', null)
}

export function sortParticipantsByResults(
  participants: any[],
  results: Record<string, ParticipantResult>
) {
  return participants.sort((a, b) => {
    const aResult = results[a.id]
    const bResult = results[b.id]
    
    // 1. Participants with overall points > 0 (by overall points DESC, then extra points DESC)
    const aHasPoints = aResult?.overallPoints > 0
    const bHasPoints = bResult?.overallPoints > 0
    
    if (aHasPoints && bHasPoints) {
      // Sort by overall points first
      const overallPointsDiff = (bResult.overallPoints || 0) - (aResult.overallPoints || 0)
      if (overallPointsDiff !== 0) {
        return overallPointsDiff
      }
      // Tiebreaker: extra points (higher is better)
      return (bResult.extraPoints || 0) - (aResult.extraPoints || 0)
    }
    if (aHasPoints && !bHasPoints) return -1
    if (!aHasPoints && bHasPoints) return 1
    
    // 2. Participants without points (alphabetical by name)
    return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
  })
}