// src/components/results/utils/resultCalculations.ts - UPDATED to use improved sorting

import type { ParticipantResult } from '../hooks/useResultsState'
import { calculateClassBasedPositions } from './classBasedCalculations'

export function calculatePositionsFromPoints(
  results: Record<string, ParticipantResult>,
  updateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
) {
  // Calculate class-based positions using the new improved algorithm
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
  // Keep participation status - only clear positions and points
}

export function sortParticipantsByResults(
  participants: any[],
  results: Record<string, ParticipantResult>
) {
  // Use the same sorting logic as the table component
  return participants.sort((a, b) => {
    const aResult = results[a.id]
    const bResult = results[b.id]
    
    // 1. Participants who participated and have points > 0 (by points DESC)
    const aParticipatedWithPoints = aResult?.participated && aResult?.totalPoints > 0
    const bParticipatedWithPoints = bResult?.participated && bResult?.totalPoints > 0
    
    if (aParticipatedWithPoints && bParticipatedWithPoints) {
      return (bResult.totalPoints || 0) - (aResult.totalPoints || 0)
    }
    if (aParticipatedWithPoints && !bParticipatedWithPoints) return -1
    if (!aParticipatedWithPoints && bParticipatedWithPoints) return 1
    
    // 2. Participants who participated but have 0 points (alphabetical)
    const aParticipatedZeroPoints = aResult?.participated && (aResult?.totalPoints === null || aResult?.totalPoints === 0)
    const bParticipatedZeroPoints = bResult?.participated && (bResult?.totalPoints === null || bResult?.totalPoints === 0)
    
    if (aParticipatedZeroPoints && bParticipatedZeroPoints) {
      return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
    }
    if (aParticipatedZeroPoints && !bParticipatedZeroPoints) return -1
    if (!aParticipatedZeroPoints && bParticipatedZeroPoints) return 1
    
    // 3. Participants who did NOT participate (alphabetical)
    const aNotParticipated = !aResult?.participated
    const bNotParticipated = !bResult?.participated
    
    if (aNotParticipated && bNotParticipated) {
      return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
    }
    if (aNotParticipated && !bNotParticipated) return 1
    if (!aNotParticipated && bNotParticipated) return -1
    
    // Fallback: sort by name
    return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
  })
}